#!/usr/bin/env bash
# Kings Norton Dashboard — quick start
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Load .env if it exists
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Install deps if needed
if ! python3 -c "import rich, requests" 2>/dev/null; then
  echo "Installing dependencies..."
  pip3 install -r requirements.txt
fi

python3 dashboard.py
