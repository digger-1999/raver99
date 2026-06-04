#!/usr/bin/env python3
"""Kings Norton Dashboard — Weather · Trains · Buses · News · Brum · Sport · Music · Calendar"""

import os, time, random, re, json, zipfile, io as _io
import xml.etree.ElementTree as ET
import requests
from datetime import datetime, date, timedelta
from pathlib import Path
from rich.console import Console
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.align import Align
from rich import box

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  CONFIG  (all overridable via .env or environment variables)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TRAIN_CRS    = os.getenv("TRAIN_CRS",    "KNN")   # Kings Norton CRS code
TRAIN_COUNT  = int(os.getenv("TRAIN_COUNT", "12"))
TRAIN_VIA_BHM = "BHM"   # filter for Birmingham-bound trains

# BODS (Bus Open Data Service) — free, no daily limit
# Sign up at https://data.bus-data.dft.gov.uk/ to get a key
BODS_API_KEY    = os.getenv("BODS_API_KEY", "")
BODS_DATASET_ID = 20441          # National Express West Midlands
BODS_LINES      = ["45", "49"]

BUS_STOPS   = ["43000401102", "43000400302"]   # ATCO codes for Kings Norton stops
BUS_ROUTES  = {"45", "49"}
BUS_TERMINI = {"45": ("Longbridge", "City Centre"), "49": ("Rubery", "Solihull")}
BUS_REFRESH = int(os.getenv("BUS_REFRESH_SECONDS", "60"))

NEWS_RSS  = "https://feeds.bbci.co.uk/news/rss.xml"
BRUM_RSS  = "https://feeds.bbci.co.uk/news/england/birmingham_and_black_country/rss.xml"
SPORT_RSS = "https://feeds.bbci.co.uk/sport/rss.xml"
MUSIC_RSS = "https://www.nme.com/feed/"

# Google Calendar credentials — download from console.cloud.google.com
# APIs & Services → Credentials → OAuth 2.0 Client → Download JSON
GCAL_CREDENTIALS = os.getenv("GOOGLE_CREDENTIALS", "")
GCAL_TOKEN_FILE  = Path.home() / ".config" / "kn-dashboard" / "gcal-token.json"
GCAL_SCOPES      = ["https://www.googleapis.com/auth/calendar.readonly"]

REFRESH = int(os.getenv("REFRESH_SECONDS", "60"))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BIG-BLOCK CLOCK  (bigtime "big" font)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_BIGTIME = {
    '0': ['11111111','11000011','11000011','11000011','11000011','11000011','11111111'],
    '1': ['00011000','00011000','00011000','00011000','00011000','00011000','00011000'],
    '2': ['11111111','00000011','00000011','11111111','11000000','11000000','11111111'],
    '3': ['11111111','00000011','00000011','11111111','00000011','00000011','11111111'],
    '4': ['11000011','11000011','11000011','11111111','00000011','00000011','00000011'],
    '5': ['11111111','11000000','11000000','11111111','00000011','00000011','11111111'],
    '6': ['11111111','11000000','11000000','11111111','11000011','11000011','11111111'],
    '7': ['11111111','00000011','00000011','00000011','00000011','00000011','00000011'],
    '8': ['11111111','11000011','11000011','11111111','11000011','11000011','11111111'],
    '9': ['11111111','11000011','11000011','11111111','00000011','00000011','11111111'],
    ':': ['0000',    '0000',    '0110',    '0000',    '0110',    '0000',    '0000'   ],
    ' ': ['00000000','00000000','00000000','00000000','00000000','00000000','00000000'],
}

def big_clock(s, block='█'):
    rows = [''] * 7
    for ch in s:
        d = _BIGTIME.get(ch, _BIGTIME[' '])
        for i, line in enumerate(d):
            for bit in line:
                rows[i] += block if bit == '1' else ' '
            rows[i] += ' '
    return rows

seg_clock = big_clock

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  WEATHER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEATHER_QUIP = {
    "Clear":        ["Genuinely nice out. Don't waste it.",
                     "Sun's out. Birmingham looks almost attractive."],
    "Clouds":       ["Classic Brummie sky.", "Could be worse. Could be raining."],
    "Rain":         ["Classic.", "It's grim up the Midlands.", "Wet. Very wet."],
    "Drizzle":      ["That annoying drizzle that soaks you anyway.", "Not proper rain. Just damp."],
    "Thunderstorm": ["Absolutely biblical out there.", "Stay in. Seriously."],
    "Snow":         ["Snow in Birmingham. Chaos incoming.", "One inch. City grinds to a halt."],
    "Mist":         ["Atmospheric. Or just murky."],
    "Fog":          ["Can't see Kings Norton. Might be a feature."],
}

_current_wquip = "Typical."

def fetch_weather_now():
    global _current_wquip
    try:
        r = requests.get("https://wttr.in/Kings+Norton,Birmingham?0",
                         headers={"User-Agent": "curl/7.68.0"}, timeout=9)
        r.raise_for_status()
        lines = [l for l in r.text.rstrip().split("\n")
                 if "igor_chubin" not in l and "Location:" not in l]
        txt = r.text.lower()
        for cond, pool in WEATHER_QUIP.items():
            if cond.lower() in txt:
                _current_wquip = random.choice(pool)
                break
        return "\n".join(lines), None
    except Exception as e:
        return None, str(e)

def fetch_weather_forecast():
    try:
        j = requests.get("https://wttr.in/Kings+Norton,Birmingham?format=j1",
                         headers={"User-Agent": "curl/7.68.0"}, timeout=9).json()
        return j, None
    except Exception as e:
        return None, str(e)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  TRAINS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def fetch_trains():
    try:
        r = requests.get(f"https://huxley2.azurewebsites.net/departures/{TRAIN_CRS}/{TRAIN_COUNT}",
                         timeout=9)
        r.raise_for_status()
        return r.json(), None
    except Exception as e:
        return None, str(e)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  BUSES  (BODS TransXChange timetable, cached weekly)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CACHE_DIR       = Path.home() / ".config" / "kn-dashboard"
TIMETABLE_CACHE = CACHE_DIR / "bus-timetable.json"
TXC_NS          = "http://www.transxchange.org.uk/"

def _T(tag): return f"{{{TXC_NS}}}{tag}"

def _iso_dur(s):
    m = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', s or 'PT0S')
    return (int(m.group(1) or 0)*3600 + int(m.group(2) or 0)*60 + int(m.group(3) or 0)) if m else 0

def _runs_on_dow(vj, dow):
    op = vj.find(_T('OperatingProfile'))
    if op is None: return True
    rdt = op.find(_T('RegularDayType'))
    if rdt is None: return True
    days = rdt.find(_T('DaysOfWeek'))
    if days is None or not list(days): return True
    tags = {c.tag.split('}')[1] for c in days}
    if dow < 5 and tags & {'Monday','Tuesday','Wednesday','Thursday','Friday','MondayToFriday','MondayToSunday'}: return True
    if dow == 5 and tags & {'Saturday','MondayToSunday'}: return True
    if dow == 6 and tags & {'Sunday','MondayToSunday'}:   return True
    return False

def _build_timetable_cache():
    if not BODS_API_KEY:
        raise RuntimeError("BODS_API_KEY not set — add it to .env")
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    print("  Downloading bus timetable from BODS (once a week)...", flush=True)
    r = requests.get(
        f"https://data.bus-data.dft.gov.uk/timetable/dataset/{BODS_DATASET_ID}/download/",
        params={"api_key": BODS_API_KEY}, timeout=120)
    r.raise_for_status()
    z = zipfile.ZipFile(_io.BytesIO(r.content))

    all_deps = []

    for fname in z.namelist():
        raw = z.read(fname)
        if b'<LineName>45</LineName>' not in raw and b'<LineName>49</LineName>' not in raw:
            continue
        root = ET.fromstring(raw)

        jp_line = {}
        for svc in root.findall(_T('Services') + '/' + _T('Service')):
            ln = svc.findtext(f'.//{_T("LineName")}') or ''
            if ln not in ('45', '49'): continue
            for jp in svc.findall(f'.//{_T("JourneyPattern")}'):
                jp_line[jp.get('id')] = ln

        sections = {}
        for sec in root.findall(_T('JourneyPatternSections') + '/' + _T('JourneyPatternSection')):
            sid = sec.get('id'); seq = []; cumul = 0
            for link in sec.findall(_T('JourneyPatternTimingLink')):
                fr = link.find(_T('From')); to = link.find(_T('To'))
                if fr is None or to is None: continue
                sf = fr.findtext(_T('StopPointRef')) or ''
                cumul += _iso_dur(fr.findtext(_T('WaitTime')))
                if not seq: seq.append((sf, cumul))
                cumul += _iso_dur(link.findtext(_T('RunTime')))
                seq.append((to.findtext(_T('StopPointRef')) or '', cumul))
            sections[sid] = seq

        jp_seq = {}
        for jp in root.findall(f'.//{_T("JourneyPattern")}'):
            jpid = jp.get('id'); cumul_seq = []
            for ref in jp.findall(_T('JourneyPatternSectionRefs')):
                ss = sections.get(ref.text, [])
                if not ss: continue
                if not cumul_seq: cumul_seq.extend(ss)
                else:
                    last = cumul_seq[-1][1]
                    for s, c in ss[1:]: cumul_seq.append((s, last + c))
            jp_seq[jpid] = cumul_seq

        for vj in root.findall(_T('VehicleJourneys') + '/' + _T('VehicleJourney')):
            dep_str = vj.findtext(_T('DepartureTime')) or ''
            jp_ref  = vj.findtext(_T('JourneyPatternRef')) or ''
            line    = jp_line.get(jp_ref) or ''
            if line not in ('45', '49'): continue
            dest    = vj.findtext(_T('DestinationDisplay')) or ''
            mask    = sum((1 << d) for d in range(7) if _runs_on_dow(vj, d))
            if mask == 0: continue
            try:
                h, m, s = map(int, dep_str.split(':'))
                base    = h*3600 + m*60 + s
            except Exception: continue
            for stop_ref, offset in jp_seq.get(jp_ref, []):
                if stop_ref not in BUS_STOPS: continue
                arr = base + offset
                all_deps.append([arr//60, line, dest, stop_ref, mask])

    seen = set(); deduped = []
    for row in sorted(all_deps):
        k = (row[0], row[1], row[3])
        if k not in seen: seen.add(k); deduped.append(row)

    TIMETABLE_CACHE.write_text(json.dumps({"built": datetime.now().isoformat(), "deps": deduped}))
    print(f"  Cached {len(deduped)} scheduled departures.", flush=True)
    return deduped

def _load_timetable():
    if TIMETABLE_CACHE.exists():
        cache = json.loads(TIMETABLE_CACHE.read_text())
        if (datetime.now() - datetime.fromisoformat(cache["built"])).days < 7:
            return cache["deps"]
    return _build_timetable_cache()

_timetable_cache = None

def fetch_buses():
    global _timetable_cache
    if _timetable_cache is None:
        try:
            _timetable_cache = _load_timetable()
        except Exception as e:
            return None, str(e)

    dow      = date.today().weekday()
    now_mins = datetime.now().hour * 60 + datetime.now().minute
    merged   = {}; seen = set()

    for arr_min, line, dest, stop_ref, mask in _timetable_cache:
        if not (mask >> dow & 1): continue
        if arr_min < now_mins:    continue
        k = (arr_min, line)
        if k in seen: continue
        seen.add(k)
        hh, mm = divmod(arr_min, 60)
        dep = {"aimed_departure_time": f"{hh%24:02d}:{mm:02d}",
               "best_departure_estimate": f"{hh%24:02d}:{mm:02d}",
               "direction": dest or BUS_TERMINI.get(line, ("?", "?"))[1],
               "source": "scheduled"}
        merged.setdefault(line, []).append(dep)
        if sum(len(v) for v in merged.values()) >= 20: break

    return ({"departures": merged}, None) if merged else (None, "No departures found")

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  NEWS / RSS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def fetch_rss(url, limit=8):
    try:
        r = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=9)
        r.raise_for_status()
        root  = ET.fromstring(r.content)
        items = []
        for it in root.findall(".//item")[:limit]:
            title = (it.findtext("title") or "").strip()
            if not title or title == "[Removed]": continue
            desc = re.sub(r"<[^>]+>", "", (it.findtext("description") or "")).strip()
            items.append({"title": title,
                          "desc":  desc[:160] if desc else "",
                          "pub":   it.findtext("pubDate") or ""})
        return items, None
    except Exception as e:
        return None, str(e)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  GOOGLE CALENDAR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def fetch_calendar():
    if not GCAL_CREDENTIALS:
        return None, "not_configured"
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build

        creds = None
        GCAL_TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
        if GCAL_TOKEN_FILE.exists():
            creds = Credentials.from_authorized_user_file(str(GCAL_TOKEN_FILE), GCAL_SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow  = InstalledAppFlow.from_client_secrets_file(GCAL_CREDENTIALS, GCAL_SCOPES)
                creds = flow.run_local_server(port=0)
            GCAL_TOKEN_FILE.write_text(creds.to_json())

        svc      = build("calendar", "v3", credentials=creds)
        now_z    = datetime.utcnow().isoformat() + "Z"
        cal_list = svc.calendarList().list().execute()

        all_events = []
        for cal in cal_list.get("items", []):
            if cal.get("deleted") or not cal.get("selected", True): continue
            try:
                result = svc.events().list(
                    calendarId=cal["id"], timeMin=now_z,
                    maxResults=8, singleEvents=True, orderBy="startTime"
                ).execute()
                for ev in result.get("items", []):
                    ev["_calName"] = cal.get("summary", cal["id"])
                    all_events.append(ev)
            except Exception:
                pass

        def _sort(e):
            s = e.get("start", {})
            return s.get("dateTime") or s.get("date") or ""
        all_events.sort(key=_sort)
        return all_events[:8], None
    except Exception as e:
        return None, str(e)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PERSONALITY
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WISDOMS = [
    "Kings Norton: est. 7th century.  Tesco: 2003.",
    "The 49 will come. Eventually. In its own time.",
    "Network Rail: always believing in tomorrow.",
    "Birmingham has more canals than Venice. Venice has fewer delays.",
    "You are approximately 4 miles from the Bull Ring.",
    "The Archers was first broadcast near here. Make of that what you will.",
    "Kings Norton Green: still there, still lovely, still no parking.",
    "Longbridge: where Rovers once roamed.",
    "If the 45 is late, consider it a gift of unplanned contemplation.",
    "West Midlands Rail apologises for any inconvenience caused by existence.",
]
_wisdom_i = 0; _wisdom_t = 0; _wisdom_cur = random.choice(WISDOMS)

def tick_wisdom():
    global _wisdom_i, _wisdom_t, _wisdom_cur
    if time.time() - _wisdom_t > 30:
        _wisdom_cur = WISDOMS[_wisdom_i % len(WISDOMS)]
        _wisdom_i += 1; _wisdom_t = time.time()
    return _wisdom_cur

QUIPS = {
    "weather":  ["Try looking out the window.", "Bit cloudy in the server room."],
    "trains":   ["Huxley's gone for a brew.\nLeaves on the line, no doubt.",
                 "Train data unavailable.\nWhich is on-brand, frankly."],
    "buses":    ["The 49 is running on vibes.\nResets at midnight.",
                 "Bus API's gone home.\nMight be quicker to walk."],
    "news":     ["BBC gone quiet.\nProbably a licence fee dispute."],
    "brum":     ["No Brum news.\nEither very good or very bad sign."],
    "sport":    ["Sport taking a breather.\nMust be a rest day."],
    "music":    ["NME gone quiet.\nEveryone's on tour, probably."],
    "calendar": ["Calendar not connected.\nSee .env.example for setup."],
    "loading":  ["Asking the internet nicely...", "Consulting the oracle..."],
}
_qi: dict = {}

def quip(key):
    pool = QUIPS.get(key, ["Something went sideways."])
    i = _qi.get(key, 0); _qi[key] = (i+1) % len(pool)
    return pool[i]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PANEL HELPERS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _panel(body, title, accent, subtitle=None, pad=(0,1)):
    return Panel(body, title=title, subtitle=subtitle,
                 border_style=accent, box=box.HEAVY,
                 padding=pad, style="on grey3")

def _err(msg, title, accent, qkey):
    txt = quip(qkey)
    t = Text()
    t.append("\n")
    for i, line in enumerate(txt.split("\n")):
        t.append(f"  {line}\n", style="bold yellow" if i == 0 else "dim yellow")
    if qkey == "calendar" and msg and msg != "not_configured":
        t.append(f"\n  {msg[:100]}\n", style="dim red")
    return _panel(t, title, accent)

def _loading(title, accent, qkey="loading"):
    return _panel(Text(f"\n  {quip(qkey)}\n", style=f"dim {accent}"), title, accent)

def _fmt_pub(raw):
    if not raw: return ""
    try:
        dt = datetime.strptime(raw[:25], "%a, %d %b %Y %H:%M:%S")
        return dt.strftime("%H:%M") if dt.date() == date.today() else dt.strftime("%-d %b")
    except Exception: return ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  PANELS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_weather(now_text, now_e, fc_j, fc_e):
    T = "[bold gold1] WEATHER [/]"; A = "gold1"
    if now_e and not now_text:
        return _err(now_e, T, A, "weather")
    t = Text()
    if now_text:
        t.append_text(Text.from_ansi(now_text))
        t.append(f"\n  {_current_wquip}\n", style="dim white")
    if fc_j:
        try:
            tmr = fc_j["weather"][1]
            t.append(f"\n  ── TOMORROW  {tmr['date']} ──\n", style="dim gold1")
            t.append(f"  Hi {tmr['maxtempC']}°C  Lo {tmr['mintempC']}°C\n\n", style="white")
            for h in tmr["hourly"][::2]:
                hr   = f"{int(h['time'])//100:02d}:00"
                desc = h["weatherDesc"][0]["value"]
                tmp  = h["tempC"]
                rain = h.get("precipMM", "0")
                t.append(f"  {hr}  ", style="dim white")
                t.append(f"{tmp}°C  ", style="bold bright_yellow")
                t.append(desc, style="white")
                if float(rain) > 0:
                    t.append(f"  {rain}mm", style="steel_blue1")
                t.append("\n")
        except Exception:
            pass
    elif fc_e:
        t.append(f"\n  Tomorrow unavailable.\n", style="dim red")
    return _panel(t, T, A)


def build_trains(data, err):
    T = "[bold bright_green] TRAINS  →  BIRMINGHAM [/]"; A = "bright_green"
    if err:   return _err(err, T, A, "trains")
    if data is None: return _loading(T, A, "trains")

    def _via_bhm(s):
        d   = (s.get("destination") or [{}])[0]
        via = d.get("via") or ""
        return "Birmingham" in d.get("locationName", "") or "Birmingham" in via

    svcs = [s for s in (data.get("trainServices") or []) if _via_bhm(s)]
    if not svcs:
        t = Text()
        t.append("\n  No Birmingham services right now.\n", "dim white")
        t.append("  Network Rail: working hard, probably.\n", "dim yellow")
        return _panel(t, T, A)

    tbl = Table(box=box.SIMPLE_HEAD, show_header=True, expand=True,
                header_style="bold bright_green", padding=(0,1), show_edge=False)
    tbl.add_column("Departs", no_wrap=True, width=6)
    tbl.add_column("To",      ratio=1)
    tbl.add_column("Plt",     justify="center", no_wrap=True, width=4)
    tbl.add_column("Status",  no_wrap=True, width=14)

    for s in svcs:
        sched = s.get("std", "??:??"); etd = s.get("etd", "")
        dest  = (s.get("destination") or [{}])[0].get("locationName", "Unknown")
        plat  = s.get("platform") or "—"
        if   etd == "On time":   sc, ds, st = Text(sched, "bold bright_white"), Text(dest, "white"),   Text("● On time",    "bright_green")
        elif etd == "Cancelled": sc, ds, st = Text(sched, "strike dim red"),    Text(dest, "dim red"),  Text("✕ Cancelled", "bold red")
        elif etd == "Delayed":   sc, ds, st = Text(sched, "bold yellow"),       Text(dest, "yellow"),   Text("▲ Delayed",   "bold yellow")
        else:                    sc, ds, st = Text(sched, "dim yellow"),         Text(dest, "yellow"),   Text(f"→ {etd}",    "yellow")
        tbl.add_row(sc, ds, plat, st)

    upd = data.get("generatedAt", "")
    return _panel(tbl, T, A,
                  subtitle=f"[dim]updated {upd[:19].replace('T',' ')}[/]" if upd else None)


def build_buses(data, err):
    T = "[bold medium_orchid] BUSES  45 · 49 [/]"; A = "medium_orchid"
    if err:   return _err(err, T, A, "buses")
    if data is None: return _loading(T, A, "buses")

    rows = sorted([
        (route,
         d.get("aimed_departure_time", "??:??"),
         d.get("best_departure_estimate") or d.get("aimed_departure_time", ""),
         d.get("direction", "Unknown"))
        for route, deps in data.get("departures", {}).items() if route in BUS_ROUTES
        for d in (deps if isinstance(deps, list) else [])
    ], key=lambda r: r[1])

    if not rows:
        t = Text()
        t.append("\n  No departures.\n", "dim white")
        t.append("  Might be quicker to walk.\n", "dim yellow")
        return _panel(t, T, A)

    tbl = Table(box=box.SIMPLE_HEAD, show_header=True, expand=True,
                header_style="bold medium_orchid", padding=(0,1), show_edge=False)
    tbl.add_column("Rte", justify="center", no_wrap=True, width=4)
    tbl.add_column("Due", no_wrap=True, width=6)
    tbl.add_column("To",  ratio=1)
    tbl.add_column("Status", no_wrap=True, width=10)

    for route, aimed, expected, dest in rows[:6]:
        on_time   = aimed == expected
        dest_disp = dest if dest not in ("Unknown", "") else BUS_TERMINI.get(route, ("?","?"))[1]
        tbl.add_row(
            Text(route, "bold medium_orchid"),
            Text(aimed, "bold bright_white" if on_time else "bold yellow"),
            Text(dest_disp, "white" if on_time else "yellow"),
            Text("● On time", "bright_green") if on_time else Text(f"→ {expected}", "yellow"),
        )

    return _panel(tbl, T, A, subtitle="[dim]BODS timetable · scheduled · refreshes weekly[/]")


def build_feed(items, err, title, accent, qkey, limit=3):
    if err:   return _err(err, title, accent, qkey)
    if items is None: return _loading(title, accent, qkey)
    if not items: return _panel(Text(f"\n  {quip(qkey)}\n", "dim yellow"), title, accent)
    t = Text()
    for a in items[:limit]:
        headline = a["title"].rsplit(" - ", 1)[0].strip()
        desc     = a.get("desc", "")
        pub      = _fmt_pub(a.get("pub", ""))
        t.append(f"\n  › ", style="bold " + accent)
        t.append(f"{headline}\n", style="bold bright_white")
        if desc:
            t.append(f"    {desc}\n", style="white")
        if pub:
            t.append(f"    {pub}\n", style="dim")
    return Panel(t, title=title, border_style=accent, box=box.HEAVY,
                 padding=(0,0), style="on grey3")


def build_calendar(events, err):
    T   = "[bold cornflower_blue] CALENDAR [/]"; A = "cornflower_blue"
    SUB = "[dim]set GOOGLE_CREDENTIALS in .env to connect[/]"

    if err == "not_configured":
        t = Text()
        t.append("\n  Google Calendar — not connected\n\n", style="dim white")
        t.append("  1. console.cloud.google.com\n", "dim cyan")
        t.append("  2. Enable Calendar API\n",      "dim cyan")
        t.append("  3. Download credentials.json\n","dim cyan")
        t.append("  4. GOOGLE_CREDENTIALS=\n",      "dim cyan")
        t.append("     /path/to/credentials.json\n","dim cyan")
        return _panel(t, T, A, subtitle=SUB)

    if err:   return _err(err, T, A, "calendar")
    if events is None: return _loading(T, A, "calendar")
    if not events:
        t = Text()
        t.append("\n  Nothing in the diary.\n", "dim white")
        t.append("  Bliss.\n", "dim italic gold1")
        return _panel(t, T, A)

    cal_names  = list(dict.fromkeys(e.get("_calName", "") for e in events))
    CAL_COLORS = ["cornflower_blue","medium_orchid","hot_pink","chartreuse3",
                  "gold1","steel_blue1","orange3","bright_cyan"]
    cal_color  = {n: CAL_COLORS[i % len(CAL_COLORS)] for i, n in enumerate(cal_names)}

    t = Text(); t.append("\n")
    for e in events:
        start  = e.get("start", {})
        dt_str = start.get("dateTime") or start.get("date", "")
        cal    = e.get("_calName", "")
        colour = cal_color.get(cal, "cornflower_blue")
        try:
            if "T" in dt_str:
                dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
                when     = dt.strftime("%-d %b  %H:%M")
                is_today = dt.date() == date.today()
            else:
                dt = datetime.strptime(dt_str, "%Y-%m-%d")
                when     = dt.strftime("%-d %b  all day")
                is_today = dt.date() == date.today()
        except Exception:
            when = dt_str[:10]; is_today = False

        t.append(f"  {when}  ", style=f"bold {colour}" if is_today else f"dim {colour}")
        t.append(f"[{cal}]\n", style=f"dim {colour}")
        t.append(f"  {e.get('summary','(no title)')}\n",
                 style="bold bright_white" if is_today else "white")
        t.append("\n")
    return _panel(t, T, A)


# Music ticker state
_ticker_text   = "  Fetching music news...  "
_ticker_offset = 0

def build_ticker(music_items, err):
    global _ticker_text, _ticker_offset
    if music_items:
        headlines = [a["title"].rsplit(" - ", 1)[0].strip() for a in music_items]
        new_text  = "   ♪   ".join(headlines) + "   ♪   "
        if new_text != _ticker_text:
            _ticker_text = new_text; _ticker_offset = 0

    txt    = _ticker_text or "  Fetching music news...  "
    _ticker_offset = (_ticker_offset + 1) % len(txt)
    doubled = txt * 3
    window  = doubled[_ticker_offset:_ticker_offset + 200]

    t = Text(justify="left")
    parts = window.split("   ♪   ")
    for i, p in enumerate(parts):
        if p.strip():
            t.append(p, style="bold bright_white" if i % 2 == 0 else "dim white")
        if i < len(parts) - 1:
            t.append("   ♪   ", style="bold hot_pink")

    return Panel(t, title="[bold hot_pink] MUSIC NEWS [/]",
                 border_style="hot_pink", box=box.HEAVY,
                 style="on grey3", height=3)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  HEADER
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_header():
    now  = datetime.now()
    h12  = now.strftime("%-I")
    mins = now.strftime("%M")
    secs = now.strftime("%S")
    ampm = now.strftime("%p").lower()
    dow  = now.strftime("%A").upper()
    day  = now.strftime("%-d")
    mon  = now.strftime("%B").upper()
    yr   = now.strftime("%Y")

    lunation = (now.date() - date(2000, 1, 6)).days % 29.53
    moon     = ("New Moon","Waxing Crescent","First Quarter","Waxing Gibbous",
                "Full Moon","Waning Gibbous","Last Quarter","Waning Crescent")[int(lunation / 29.53 * 8)]

    clock_rows = seg_clock(f"{h12}:{mins}")

    left = Text(justify="left")
    left.append("\n\n")
    left.append(f"  {dow}\n",           style="bold bright_cyan")
    left.append(f"  {day} {mon} {yr}\n",style="bold bright_cyan")
    left.append(f"\n  {moon}\n",        style="dim white")
    left.append(f"\n\n  {tick_wisdom()[:55]}\n", style="dim white")

    centre = Text(justify="center")
    centre.append("\n\n")
    for row in clock_rows:
        centre.append(f"  {row}\n", style="bold gold1")
    centre.append(f"\n  :{secs}  {ampm}\n", style="dim gold1")

    right = Text(justify="right")
    right.append("\n\n\n\n")
    right.append("Kings Norton, Birmingham  \n", style="dim white")
    right.append("B38  \n", style="dim white")
    right.append(f"\n\nrefresh: {REFRESH}s  \n", style="dim white")

    tbl = Table(box=None, show_header=False, expand=True, padding=(0,1))
    tbl.add_column(ratio=2); tbl.add_column(ratio=3); tbl.add_column(ratio=2)
    tbl.add_row(
        Align(left,   vertical="middle"),
        Align(centre, vertical="middle", align="center"),
        Align(right,  vertical="middle", align="right"),
    )
    return Panel(tbl,
                 title="[bold gold1]  KINGS NORTON DASHBOARD  [/]",
                 subtitle=f"[dim white] {dow}  {day} {mon} {yr} [/]",
                 box=box.HEAVY, border_style="gold1", style="on grey11", height=16)

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  LAYOUT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def build_layout(now_w, fc_w, trains, buses, news, brum, sport, cal, music):
    L = Layout()
    L.split_column(
        Layout(name="header", size=14),
        Layout(name="row1",   ratio=5),
        Layout(name="row2",   ratio=4),
        Layout(name="ticker", size=3),
    )
    L["row1"].split_row(
        Layout(name="weather",  ratio=3),
        Layout(name="trains",   ratio=4),
        Layout(name="calendar", ratio=2),
    )
    L["row2"].split_row(
        Layout(name="buses", ratio=2),
        Layout(name="brum",  ratio=3),
        Layout(name="news",  ratio=3),
        Layout(name="sport", ratio=2),
    )
    L["header"  ].update(build_header())
    L["weather" ].update(build_weather(*now_w, *fc_w))
    L["trains"  ].update(build_trains(*trains))
    L["calendar"].update(build_calendar(*cal))
    L["buses"   ].update(build_buses(*buses))
    L["brum"    ].update(build_feed(*brum,  "[bold orange3] BIRMINGHAM [/]",       "orange3",        "brum",  3))
    L["news"    ].update(build_feed(*news,  "[bold deep_sky_blue1] UK NEWS [/]",   "deep_sky_blue1", "news",  3))
    L["sport"   ].update(build_feed(*sport, "[bold chartreuse3] SPORT [/]",        "chartreuse3",    "sport", 3))
    L["ticker"  ].update(build_ticker(*music))
    return L

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  MAIN
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

console = Console()

def main():
    global _timetable_cache
    if _timetable_cache is None:
        try:
            _timetable_cache = _load_timetable()
        except Exception as e:
            print(f"  Bus timetable unavailable: {e}", flush=True)

    state = dict(
        now_w=(None, None), fc_w=(None, None),
        trains=(None, None), buses=(None, None),
        news=(None, None),   brum=(None, None),
        sport=(None, None),  cal=(None, "not_configured"),
        music=(None, None),
    )
    last = 0

    with Live(console=console, refresh_per_second=4, screen=True) as live:
        while True:
            now = time.time()
            if now - last >= REFRESH:
                state["now_w"]  = fetch_weather_now()
                state["fc_w"]   = fetch_weather_forecast()
                state["trains"] = fetch_trains()
                state["buses"]  = fetch_buses()
                state["news"]   = fetch_rss(NEWS_RSS)
                state["brum"]   = fetch_rss(BRUM_RSS)
                state["sport"]  = fetch_rss(SPORT_RSS)
                state["music"]  = fetch_rss(MUSIC_RSS, limit=15)
                state["cal"]    = fetch_calendar()
                last = now
            live.update(build_layout(**state))
            time.sleep(0.25)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[bold gold1]  Safe home.  [/]\n")
