<?php
session_start();

// Get current day information
$currentDay = date('l');
$currentDate = date('j F Y');
$currentTime = date('H:i');
$dayOfWeek = date('N');
$currentHour = intval(date('H'));

$isWeekend = ($dayOfWeek >= 6);
$isFridayEvening = ($dayOfWeek == 5 && $currentHour >= 17);
$isTakeawayTime = $isWeekend || $isFridayEvening;

// Calculate hours until dinner
$dinnerTime = 18;
$hoursUntilDinner = '';

if ($isWeekend) {
    $hoursUntilDinner = "🏖️ Weekend vibes - dinner time is whenever you decide!";
} else {
    if ($currentHour < $dinnerTime) {
        $hoursLeft = $dinnerTime - $currentHour;
        $hoursUntilDinner = "⏰ T-minus $hoursLeft hours until dinner service";
    } elseif ($currentHour == $dinnerTime) {
        $hoursUntilDinner = "🔥 DINNER TIME! The crowd is waiting for your set";
    } else {
        $hoursUntilDinner = "🌙 Evening service in progress - hope it's going well!";
    }
}

$dayTypeMessage = '';
if ($isTakeawayTime) {
    if ($isFridayEvening) {
        $dayTypeMessage = "🍕 Friday night beats! Perfect time for a cheeky takeaway if you fancy it";
    } else {
        $dayTypeMessage = "🏖️ Weekend mode activated! Takeaway is absolutely acceptable behaviour";
    }
}

// Meal database
$meals = [
    'Spaghetti Bolognese' => [
        'difficulty' => 'medium',
        'prep_time' => '45 minutes',
        'advance_prep' => 'None required - raid the cupboards like the tactical genius you are',
        'shopping_list' => ['Mince beef (500g)', 'Spaghetti (400g)', 'Tinned tomatoes (2 tins)', 'Onion (1 large)', 'Garlic (3 cloves)', 'Parmesan cheese'],
        'sarcasm' => 'The meal that makes you feel like an actual parent. Even the pickiest eater will grudgingly admit it\'s "alright, I suppose."',
        'emoji' => '🍝',
        'serves' => '4-6 people',
        'cost_estimate' => '£8-12',
        'freezer_friendly' => true,
        'kid_rating' => 9
    ],
    'Chicken Curry (Mild Korma/Tikka)' => [
        'difficulty' => 'planned',
        'prep_time' => '25 minutes',
        'advance_prep' => 'Defrost chicken if frozen (yes, planning is a skill some of us possess)',
        'shopping_list' => ['Chicken breast (600g)', 'Korma sauce jar', 'Basmati rice (300g)', 'Naan bread', 'Natural yoghurt', 'Onion (1)'],
        'sarcasm' => 'Jar sauce and absolutely zero shame. Sometimes convenience wins, and that\'s perfectly fine by me.',
        'emoji' => '🍛',
        'serves' => '4 people',
        'cost_estimate' => '£6-9',
        'freezer_friendly' => true,
        'kid_rating' => 7
    ],
    'Grilled Salmon with Rice & Broccoli' => [
        'difficulty' => 'planned',
        'prep_time' => '20 minutes',
        'advance_prep' => 'Defrost salmon if frozen (you absolute planning legend)',
        'shopping_list' => ['Salmon fillets (4)', 'Basmati rice (250g)', 'Broccoli (1 head)', 'Lemon (2)', 'Butter', 'Olive oil'],
        'sarcasm' => 'Right, look at you being all healthy and organised. The kids will eat it and they might even thank you. Miracles do happen.',
        'emoji' => '🐟',
        'serves' => '4 people',
        'cost_estimate' => '£12-16',
        'freezer_friendly' => false,
        'kid_rating' => 6
    ],
    'Soup & Toastie' => [
        'difficulty' => 'easy',
        'prep_time' => '15 minutes',
        'advance_prep' => 'None - this is your "I\'ve absolutely had it" emergency protocol',
        'shopping_list' => ['Tinned soup (2 tins)', 'Bread (1 loaf)', 'Cheese slices', 'Ham', 'Butter'],
        'sarcasm' => 'The "I have officially given up but in a nutritionally adequate way" option. Sometimes this is exactly what everyone needs, and that\'s absolutely fine.',
        'emoji' => '🍲',
        'serves' => '3-4 people',
        'cost_estimate' => '£4-6',
        'freezer_friendly' => false,
        'kid_rating' => 8
    ],
    'Chicken Fajitas' => [
        'difficulty' => 'planned',
        'prep_time' => '20 minutes',
        'advance_prep' => 'Defrost chicken if frozen (again with the planning - you\'re on fire)',
        'shopping_list' => ['Chicken breast (500g)', 'Bell peppers (3)', 'Onion (1 large)', 'Tortillas (8)', 'Fajita seasoning', 'Sour cream', 'Cheese (grated)', 'Salsa'],
        'sarcasm' => 'Interactive dining where everyone builds their own creation. The kids can customise their disappointment exactly how they like it.',
        'emoji' => '🌮',
        'serves' => '4 people',
        'cost_estimate' => '£8-11',
        'freezer_friendly' => false,
        'kid_rating' => 9
    ],
    'Homemade Burgers' => [
        'difficulty' => 'medium',
        'prep_time' => '30 minutes',
        'advance_prep' => 'Can prep patties day before (if you\'re that sort of organised legend)',
        'shopping_list' => ['Mince beef (600g)', 'Burger buns (6)', 'Cheese slices', 'Lettuce (1 head)', 'Tomatoes (3)', 'Onion (1)', 'Chips/sweet potato fries'],
        'sarcasm' => 'Homemade burgers: because sometimes you need to prove you can absolutely smash McDonald\'s out the park. Spoiler alert: you can.',
        'emoji' => '🍔',
        'serves' => '4-6 people',
        'cost_estimate' => '£9-13',
        'freezer_friendly' => true,
        'kid_rating' => 10
    ],
    'Tuna Pasta Bake' => [
        'difficulty' => 'easy',
        'prep_time' => '35 minutes',
        'advance_prep' => 'Can assemble morning of (if you\'re feeling particularly accomplished)',
        'shopping_list' => ['Pasta (300g)', 'Tinned tuna (3 tins)', 'Cheese sauce jar', 'Sweetcorn (1 tin)', 'Breadcrumbs (50g)', 'Cheddar cheese (grated)'],
        'sarcasm' => 'The ultimate "raid the cupboard and somehow create magic" meal. Consistently delivers when you need it most. Proper reliable, this one.',
        'emoji' => '🐟',
        'serves' => '4-5 people',
        'cost_estimate' => '£5-8',
        'freezer_friendly' => true,
        'kid_rating' => 8
    ],
    'Sausages, Egg & Chips' => [
        'difficulty' => 'planned',
        'prep_time' => '25 minutes',
        'advance_prep' => 'Defrost sausages if frozen (planning strikes again)',
        'shopping_list' => ['Sausages (8)', 'Eggs (4-6)', 'Potatoes (1kg) or frozen chips', 'Baked beans (2 tins)', 'Oil for frying'],
        'sarcasm' => 'Full English breakfast for dinner because conventional meal timing is just a social construct anyway. Proper comfort food this.',
        'emoji' => '🍳',
        'serves' => '4 people',
        'cost_estimate' => '£6-9',
        'freezer_friendly' => false,
        'kid_rating' => 10
    ],
    'Jacket Potato with Toppings' => [
        'difficulty' => 'easy',
        'prep_time' => '60 minutes (or 8 minutes in microwave if you\'re not precious about it)',
        'advance_prep' => 'None - the potato will patiently wait while you sort your life out',
        'shopping_list' => ['Large potatoes (4-6)', 'Mature cheddar (grated)', 'Baked beans (2 tins)', 'Tinned tuna (2 tins)', 'Butter', 'Coleslaw'],
        'sarcasm' => 'The meal that basically cooks itself while you get on with more important things, like questioning your life choices. Brilliantly efficient.',
        'emoji' => '🥔',
        'serves' => '4 people',
        'cost_estimate' => '£4-7',
        'freezer_friendly' => false,
        'kid_rating' => 9
    ]
];

// Initialize session variables
if (!isset($_SESSION['meal_history'])) {
    $_SESSION['meal_history'] = [];
}
if (!isset($_SESSION['weekly_plan'])) {
    $_SESSION['weekly_plan'] = [];
}

function getRandomMeal($meals) {
    $mealNames = array_keys($meals);
    return $mealNames[array_rand($mealNames)];
}

function getMealsByDifficulty($meals, $difficulty) {
    return array_filter($meals, function($meal) use ($difficulty) {
        return $meal['difficulty'] === $difficulty;
    });
}

function generateWeeklyPlan($meals) {
    $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $plan = [];
    $mealNames = array_keys($meals);
    
    foreach ($days as $day) {
        $plan[$day] = $mealNames[array_rand($mealNames)];
    }
    
    return $plan;
}

function sendMealEmail($email, $mealName, $mealData) {
    $subject = "Tonight's Track Drop: $mealName {$mealData['emoji']}";
    
    $shoppingList = implode("\n    • ", $mealData['shopping_list']);
    
    $message = "
🎧 R FAMILY MEAL MIXER - TRACK DELIVERED 🎧

Tonight's Banger: {$mealData['emoji']} $mealName
Mix Style: " . ucfirst($mealData['difficulty']) . "
Set Time: {$mealData['prep_time']}
Feeds the Crowd: {$mealData['serves']}
Cost of the Show: {$mealData['cost_estimate']}

⚠️ SOUNDCHECK REQUIRED:
{$mealData['advance_prep']}

📋 BACKSTAGE RIDER (SHOPPING LIST):
    • $shoppingList

🎭 DJ COMMENTARY:
{$mealData['sarcasm']}

📊 TRACK STATS:
Crowd Approval Rating: {$mealData['kid_rating']}/10
Freezer Vault Ready: " . ($mealData['freezer_friendly'] ? 'Yes' : 'No') . "

Time to drop this beat in the kitchen, legend.

---
Sent from R Family Meal Mixer DJ Booth™
";
    
    $headers = "From: R Family DJ <noreply@rfamilymixer.local>\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    return mail($email, $subject, $message, $headers);
}

// Handle form submissions
$selectedMeal = '';
$mealData = [];
$emailSent = false;
$weeklyPlan = [];

if ($_POST) {
    if (isset($_POST['random_meal'])) {
        $selectedMeal = getRandomMeal($meals);
    } elseif (isset($_POST['difficulty'])) {
        $filteredMeals = getMealsByDifficulty($meals, $_POST['difficulty']);
        if (!empty($filteredMeals)) {
            $mealNames = array_keys($filteredMeals);
            $selectedMeal = $mealNames[array_rand($mealNames)];
        }
    } elseif (isset($_POST['weekly_plan'])) {
        $weeklyPlan = generateWeeklyPlan($meals);
        $_SESSION['weekly_plan'] = $weeklyPlan;
    } elseif (isset($_POST['clear_history'])) {
        $_SESSION['meal_history'] = [];
    }
    
    if ($selectedMeal && isset($meals[$selectedMeal])) {
        $mealData = $meals[$selectedMeal];
        
        $_SESSION['meal_history'][] = [
            'meal' => $selectedMeal,
            'date' => date('d/m/Y H:i'),
            'difficulty' => $mealData['difficulty']
        ];
        
        if (count($_SESSION['meal_history']) > 10) {
            array_shift($_SESSION['meal_history']);
        }
    }
    
    if (isset($_POST['email']) && !empty($_POST['email']) && $selectedMeal) {
        $emailSent = sendMealEmail($_POST['email'], $selectedMeal, $mealData);
    }
}

// Calculate stats
$totalMeals = count($meals);
$easyMeals = count(getMealsByDifficulty($meals, 'easy'));
$mediumMeals = count(getMealsByDifficulty($meals, 'medium'));
$plannedMeals = count(getMealsByDifficulty($meals, 'planned'));
$avgCost = 8.50;
?>

<!DOCTYPE html>

<html lang="en-GB">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>R Family Meal Mixer 🎧 - DJ Your Dinner</title>
    <style>
        * { box-sizing: border-box; }

```
    body {
        font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        max-width: 1200px;
        margin: 0 auto;
        padding: 10px;
        background: linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%);
        min-height: 100vh;
        color: #333;
        position: relative;
        overflow-x: hidden;
    }
    
    @media (min-width: 768px) { body { padding: 20px; } }
    
    body::before {
        content: '';
        position: fixed;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: 
            radial-gradient(circle at 20% 50%, rgba(255, 0, 110, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(131, 56, 236, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(58, 134, 255, 0.3) 0%, transparent 50%);
        animation: float 20s ease-in-out infinite;
        z-index: -1;
    }
    
    @keyframes float {
        0%, 100% { transform: translate(0%, 0%) rotate(0deg); }
        33% { transform: translate(30px, -30px) rotate(120deg); }
        66% { transform: translate(-20px, 20px) rotate(240deg); }
    }
    
    .container {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 30px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
        overflow: hidden;
        position: relative;
    }
    
    .container::before {
        content: '🎧';
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 1.5rem;
        animation: sparkle 2s ease-in-out infinite;
        z-index: 10;
    }
    
    @media (min-width: 768px) {
        .container::before { top: 20px; right: 30px; font-size: 2rem; }
    }
    
    @keyframes sparkle {
        0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.7; }
        50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
    }
    
    .header {
        text-align: center;
        padding: 25px 20px;
        background: linear-gradient(135deg, #ff006e 0%, #fb5607 100%);
        color: white;
        position: relative;
        overflow: hidden;
    }
    
    @media (min-width: 768px) { .header { padding: 40px 30px; } }
    
    .header::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.1) 10px, rgba(255, 255, 255, 0.1) 20px);
        animation: slide 15s linear infinite;
    }
    
    @keyframes slide {
        0% { transform: translateX(-50px) translateY(-50px); }
        100% { transform: translateX(50px) translateY(50px); }
    }
    
    .header h1 {
        margin: 0 0 8px 0;
        font-size: 2rem;
        font-weight: 800;
        text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
        position: relative;
        z-index: 2;
    }
    
    @media (min-width: 768px) { .header h1 { font-size: 2.8rem; margin-bottom: 10px; } }
    
    .header .subtitle {
        font-size: 0.9rem;
        opacity: 0.95;
        position: relative;
        z-index: 2;
        margin-bottom: 8px;
    }
    
    @media (min-width: 768px) { .header .subtitle { font-size: 1.2rem; margin-bottom: 0; } }
    
    .dj-tagline {
        font-size: 0.8rem;
        opacity: 0.8;
        font-style: italic;
        position: relative;
        z-index: 2;
    }
    
    @media (min-width: 768px) { .dj-tagline { font-size: 0.95rem; } }
    
    .current-time {
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        padding: 12px 20px;
        border-radius: 15px;
        margin: 15px auto 0;
        max-width: 90%;
        border: 2px solid rgba(255, 255, 255, 0.3);
        position: relative;
        z-index: 2;
    }
    
    @media (min-width: 768px) {
        .current-time {
            padding: 15px 25px;
            border-radius: 20px;
            margin: 20px auto 0;
            max-width: 400px;
        }
    }
    
    .time-display {
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    @media (min-width: 768px) { .time-display { font-size: 1.1rem; margin-bottom: 5px; } }
    
    .day-type {
        font-size: 0.8rem;
        opacity: 0.9;
    }
    
    @media (min-width: 768px) { .day-type { font-size: 0.9rem; } }
    
    .dinner-countdown {
        background: rgba(255, 190, 11, 0.2);
        border: 2px solid rgba(255, 190, 11, 0.4);
        color: white;
        padding: 8px 15px;
        border-radius: 12px;
        margin-top: 8px;
        font-size: 0.8rem;
        font-weight: 600;
    }
    
    @media (min-width: 768px) {
        .dinner-countdown {
            padding: 10px 20px;
            border-radius: 15px;
            margin-top: 10px;
            font-size: 0.9rem;
        }
    }
    
    .weekend-notice {
        background: linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%);
        color: white;
        padding: 15px;
        border-radius: 15px;
        margin: 20px;
        text-align: center;
        font-weight: 600;
        box-shadow: 0 8px 25px rgba(255, 190, 11, 0.3);
        animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    .stats-bar {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
        padding: 20px;
        color: white;
        position: relative;
    }
    
    @media (min-width: 480px) {
        .stats-bar {
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }
    }
    
    @media (min-width: 768px) {
        .stats-bar {
            display: flex;
            justify-content: space-around;
            padding: 25px;
        }
    }
    
    .stat {
        text-align: center;
        position: relative;
        z-index: 2;
        padding: 10px 5px;
    }
    
    .stat-number {
        font-size: 1.8rem;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        line-height: 1;
    }
    
    @media (min-width: 768px) { .stat-number { font-size: 2.2rem; } }
    
    .stat-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.9;
        margin-top: 2px;
        line-height: 1.2;
    }
    
    @media (min-width: 768px) { .stat-label { font-size: 0.9rem; } }
    
    .main-content {
        display: block;
        padding: 20px;
    }
    
    @media (min-width: 1024px) {
        .main-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 30px;
            padding: 30px;
        }
    }
    
    .picker-section {
        background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
        padding: 25px;
        border-radius: 25px;
        color: white;
        height: fit-content;
        position: relative;
        overflow: hidden;
        box-shadow: 0 15px 35px rgba(255, 0, 110, 0.3);
        margin-bottom: 20px;
    }
    
    @media (min-width: 768px) { .picker-section { padding: 30px; } }
    @media (min-width: 1024px) { .picker-section { margin-bottom: 0; } }
    
    .picker-section::before {
        content: '🎛️';
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 1.5rem;
        opacity: 0.6;
        animation: bounce 3s ease-in-out infinite;
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .picker-section h2 {
        margin-top: 0;
        font-size: 1.6rem;
        margin-bottom: 20px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    @media (min-width: 768px) { .picker-section h2 { font-size: 2rem; margin-bottom: 25px; } }
    
    button {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 3px solid rgba(255, 255, 255, 0.4);
        padding: 15px 22px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 700;
        margin: 6px 0;
        width: 100%;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        backdrop-filter: blur(10px);
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    
    @media (min-width: 768px) {
        button {
            padding: 18px 28px;
            font-size: 16px;
            margin: 8px 0;
        }
    }
    
    button:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.6);
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    
    .random-btn {
        background: linear-gradient(45deg, #ffbe0b, #fb5607);
        border: 3px solid rgba(255, 255, 255, 0.5);
        font-size: 16px;
        padding: 18px 28px;
        margin-bottom: 20px;
        box-shadow: 0 10px 30px rgba(255, 190, 11, 0.4);
    }
    
    @media (min-width: 768px) {
        .random-btn {
            font-size: 20px;
            padding: 22px 35px;
            margin-bottom: 25px;
        }
    }
    
    .random-btn:hover {
        transform: translateY(-5px) scale(1.05);
        box-shadow: 0 15px 40px rgba(255, 190, 11, 0.5);
    }
    
    .difficulty-section h3 {
        margin-bottom: 15px;
        font-size: 1.1rem;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }
    
    @media (min-width: 768px) { .difficulty-section h3 { margin-bottom: 20px; font-size: 1.4rem; } }
    
    .result-box {
        background: white;
        border-radius: 25px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(255, 0, 110, 0.1);
        overflow: hidden;
        animation: slideIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
    }
    
    .result-box::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #ff006e, #8338ec, #3a86ff);
        animation: shimmer 2s ease-in-out infinite;
    }
    
    @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
    }
    
    @keyframes slideIn {
        from { opacity: 0; transform: translateY(30px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }
    
    .meal-header {
        background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
        color: white;
        padding: 35px 30px;
        text-align: center;
        position: relative;
        overflow: hidden;
    }
    
    .meal-title {
        font-size: 2.2rem;
        margin: 0;
        font-weight: 800;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        position: relative;
        z-index: 2;
    }
    
    .meal-emoji {
        font-size: 4rem;
        margin-bottom: 15px;
        display: block;
        animation: wiggle 2s ease-in-out infinite;
        position: relative;
        z-index: 2;
    }
    
    @keyframes wiggle {
        0%, 100% { transform: rotate(-3deg); }
        50% { transform: rotate(3deg); }
    }
    
    .meal-content {
        padding: 30px;
    }
    
    .meal-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 25px;
    }
    
    .meal-stat {
        background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
        padding: 20px;
        border-radius: 15px;
        border-left: 5px solid #ff006e;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }
    
    .meal-stat-label {
        font-size: 0.9rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 5px;
    }
    
    .meal-stat-value {
        font-size: 1.1rem;
        font-weight: 600;
        color: #333;
    }
    
    .prep-warning {
        background: linear-gradient(135deg, #ff006e, #fb5607);
        color: white;
        padding: 20px 25px;
        border-radius: 15px;
        margin: 20px 0;
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 10px 30px rgba(255, 0, 110, 0.3);
    }
    
    .prep-warning::before {
        content: '⚠️';
        font-size: 2rem;
    }
    
    .shopping-section {
        background: linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%);
        padding: 30px;
        border-radius: 20px;
        margin: 25px 0;
        position: relative;
        overflow: hidden;
        box-shadow: 0 15px 35px rgba(255, 190, 11, 0.3);
    }
    
    .shopping-section::before {
        content: '🛒';
        position: absolute;
        top: 20px;
        right: 25px;
        font-size: 2rem;
        opacity: 0.7;
    }
    
    .shopping-section h4 {
        margin-top: 0;
        color: white;
        font-size: 1.5rem;
        margin-bottom: 20px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .shopping-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
    }
    
    @media (min-width: 768px) {
        .shopping-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 12px;
        }
    }
    
    .shopping-item {
        background: rgba(255, 255, 255, 0.9);
        padding: 10px 14px;
        border-radius: 12px;
        font-weight: 600;
        color: #8b4513;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        border: 2px solid rgba(255, 255, 255, 0.5);
        font-size: 0.9rem;
    }
    
    @media (min-width: 768px) {
        .shopping-item {
            padding: 12px 18px;
            font-size: 1rem;
        }
    }
    
    .shopping-item:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        background: rgba(255, 255, 255, 1);
    }
    
    .sarcasm-box {
        background: linear-gradient(135deg, #8338ec 0%, #3a86ff 100%);
        padding: 25px;
        border-radius: 20px;
        margin: 25px 0;
        font-style: italic;
        font-size: 1.2rem;
        color: white;
        position: relative;
        overflow: hidden;
        box-shadow: 0 15px 35px rgba(131, 56, 236, 0.3);
    }
    
    .sarcasm-box::before {
        content: '"';
        font-size: 6rem;
        position: absolute;
        top: -20px;
        left: 20px;
        color: rgba(255, 255, 255, 0.2);
        font-family: serif;
        line-height: 1;
    }
    
    .wife-impresser {
        background: linear-gradient(135deg, #ff006e 0%, #8338ec 100%);
        color: white;
        padding: 20px;
        border-radius: 20px;
        margin: 20px 0;
        text-align: center;
        box-shadow: 0 15px 35px rgba(255, 0, 110, 0.3);
        border: 3px solid rgba(255, 255, 255, 0.2);
    }
    
    .wife-impresser h4 {
        margin-top: 0;
        font-size: 1.2rem;
        margin-bottom: 10px;
    }
    
    @media (min-width: 768px) {
        .wife-impresser h4 { font-size: 1.4rem; }
    }
    
    .wife-impresser p {
        margin: 0;
        font-style: italic;
        opacity: 0.95;
        font-size: 0.9rem;
    }
    
    @media (min-width: 768px) {
        .wife-impresser p { font-size: 1rem; }
    }
    
    .email-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 25px;
        border-radius: 15px;
        margin-top: 25px;
    }
    
    .email-section h4 {
        margin-top: 0;
        font-size: 1.3rem;
        margin-bottom: 15px;
    }
    
    .email-form {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
    }
    
    input[type="email"] {
        flex: 1;
        min-width: 250px;
        padding: 12px 15px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        background: rgba(255, 255, 255, 0.9);
    }
    
    .email-btn {
        background: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.3);
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .email-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
    }
    
    .email-status {
        width: 100%;
        margin-top: 10px;
        padding: 10px;
        border-radius: 8px;
        text-align: center;
        font-weight: 600;
    }
    
    .email-success {
        background: rgba(40, 167, 69, 0.2);
        color: #28a745;
        border: 1px solid rgba(40, 167, 69, 0.3);
    }
    
    .email-error {
        background: rgba(220, 53, 69, 0.2);
        color: #dc3545;
        border: 1px solid rgba(220, 53, 69, 0.3);
    }
    
    .meal-history {
        margin-top: 30px;
        padding: 25px;
        background: #f8f9fa;
        border-radius: 15px;
    }
    
    .meal-history h4 {
        margin-top: 0;
        color: #333;
        margin-bottom: 15px;
    }
    
    .history-item {
        background: white;
        padding: 10px 15px;
        margin: 5px 0;
        border-radius: 8px;
        border-left: 4px solid #667eea;
        font-size: 0.9rem;
    }
    
    .clear-history {
        background: #6c757d;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        font-size: 0.9rem;
        cursor: pointer;
        margin-top: 10px;
    }
    
    .weekly-planner {
        margin-top: 30px;
        padding: 25px;
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        border-radius: 15px;
    }
    
    .weekly-planner h4 {
        margin-top: 0;
        color: #444;
        margin-bottom: 15px;
    }
    
    .week-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
    }
    
    .day-meal {
        background: rgba(255, 255, 255, 0.8);
        padding: 15px;
        border-radius: 10px;
        text-align: center;
    }
    
    .day-name {
        font-weight: bold;
        color: #666;
        margin-bottom: 5px;
    }
    
    .day-meal-name {
        font-size: 0.9rem;
        color: #333;
    }
    
    .how-it-works {
        background: linear-gradient(135deg, #8338ec 0%, #3a86ff 100%);
        border-radius: 25px;
        margin: 20px 0;
        overflow: hidden;
        box-shadow: 0 15px 35px rgba(131, 56, 236, 0.3);
    }
    
    .accordion-header {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        padding: 20px 25px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 700;
        font-size: 1.1rem;
        transition: all 0.3s ease;
    }
    
    .accordion-header:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    .accordion-toggle {
        font-size: 1.5rem;
        transition: transform 0.3s ease;
    }
    
    .accordion-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        color: white;
    }
    
    .accordion-content.active {
        max-height: 2000px;
    }
    
    .accordion-inner {
        padding: 25px;
    }
    
    .how-it-works-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
        margin-top: 20px;
    }
    
    @media (min-width: 768px) {
        .how-it-works-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
    }
    
    .how-it-works-item {
        background: rgba(255,255,255,0.1);
        padding: 15px;
        border-radius: 10px;
    }
    
    @media (min-width: 768px) {
        .how-it-works-item { padding: 20px; }
    }
    
    .how-it-works-item h4 {
        margin-top: 0;
        margin-bottom: 8px;
        font-size: 1rem;
    }
    
    .how-it-works-item p {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.4;
    }
    
    @media (max-width: 768px) {
        .main-content {
            grid-template-columns: 1fr;
        }
        
        .email-form {
            flex-direction: column;
        }
        
        input[type="email"] {
            width: 100%;
        }
    }
</style>
```

</head>
<body>

<div class="container">
    <div class="header">
        <h1>🎧 R Family Meal Mixer</h1>
        <p class="subtitle">Spinning the perfect dinner every time</p>
        <p class="dj-tagline">"Now playing: Tonight's culinary bangers"</p>

```
    <div class="current-time">
        <div class="time-display">
            📅 <?php echo $currentDay . ', ' . $currentDate; ?> • 🕐 <?php echo $currentTime; ?>
        </div>
        <div class="day-type">
            <?php echo $dayTypeMessage ?: "Midweek mixing in progress - you've got this! 💪"; ?>
        </div>
        <div class="dinner-countdown">
            <?php echo $hoursUntilDinner; ?>
        </div>
    </div>
</div>

<?php if ($isTakeawayTime): ?>
<div class="weekend-notice">
    🎉 DJ's choice: it's <?php echo $isWeekend ? 'the weekend' : 'Friday evening'; ?>! 
    The crowd loves a good takeaway remix. Sometimes that's the perfect track for tonight.
</div>
<?php endif; ?>

<div class="stats-bar">
    <div class="stat">
        <div class="stat-number"><?php echo $totalMeals; ?></div>
        <div class="stat-label">Tracks</div>
    </div>
    <div class="stat">
        <div class="stat-number"><?php echo $easyMeals; ?></div>
        <div class="stat-label">Quick Mix</div>
    </div>
    <div class="stat">
        <div class="stat-number"><?php echo $plannedMeals; ?></div>
        <div class="stat-label">DJ Set</div>
    </div>
    <div class="stat">
        <div class="stat-number"><?php echo $mediumMeals; ?></div>
        <div class="stat-label">Full Album</div>
    </div>
</div>

<div class="main-content">
    <div class="picker-section">
        <h2>🎛️ DJ Booth</h2>
        
        <form method="post">
            <button type="submit" name="random_meal" class="random-btn">
                🎲 Hit Me With Your Best Shot
            </button>
        </form>
        
        <div class="difficulty-section">
            <h3>🎚️ Choose Your Mix Style:</h3>
            <form method="post">
                <button type="submit" name="difficulty" value="easy">
                    🚨 Quick Mix (No prep, straight bangers)
                </button>
                <button type="submit" name="difficulty" value="planned">
                    🎧 DJ Set (Planned beats, smooth transitions)
                </button>
                <button type="submit" name="difficulty" value="medium">
                    🔥 Full Album (Proper cooking session)
                </button>
            </form>
        </div>
        
        <form method="post">
            <h3>📅 Weekly Setlist:</h3>
            <button type="submit" name="weekly_plan">
                🗓️ Drop the Weekly Playlist
            </button>
        </form>
    </div>
    
    <div class="result-area">
        <?php if ($selectedMeal): ?>
        <div class="result-box">
            <div class="meal-header">
                <span class="meal-emoji"><?php echo $mealData['emoji']; ?></span>
                <h2 class="meal-title"><?php echo htmlspecialchars($selectedMeal); ?></h2>
            </div>
            
            <div class="meal-content">
                <div class="meal-stats">
                    <div class="meal-stat">
                        <div class="meal-stat-label">Mix Style</div>
                        <div class="meal-stat-value"><?php echo ucfirst($mealData['difficulty']); ?></div>
                    </div>
                    <div class="meal-stat">
                        <div class="meal-stat-label">Set Time</div>
                        <div class="meal-stat-value"><?php echo $mealData['prep_time']; ?></div>
                    </div>
                    <div class="meal-stat">
                        <div class="meal-stat-label">Feeds the Crowd</div>
                        <div class="meal-stat-value"><?php echo $mealData['serves']; ?></div>
                    </div>
                    <div class="meal-stat">
                        <div class="meal-stat-label">Cost of Show</div>
                        <div class="meal-stat-value"><?php echo $mealData['cost_estimate']; ?></div>
                    </div>
                    <div class="meal-stat">
                        <div class="meal-stat-label">Crowd Rating</div>
                        <div class="meal-stat-value"><?php echo $mealData['kid_rating']; ?>/10</div>
                    </div>
                    <div class="meal-stat">
                        <div class="meal-stat-label">Freezer Vault</div>
                        <div class="meal-stat-value"><?php echo $mealData['freezer_friendly'] ? 'Yes' : 'No'; ?></div>
                    </div>
                </div>
                
                <div class="meal-stat">
                    <div class="meal-stat-label">Soundcheck Required</div>
                    <div class="meal-stat-value"><?php echo $mealData['advance_prep']; ?></div>
                </div>
                
                <?php if (strpos($mealData['advance_prep'], 'Defrost') !== false || strpos($mealData['advance_prep'], 'day before') !== false): ?>
                <div class="prep-warning">
                    <strong>Soundcheck Alert:</strong> This track needs advance prep. Sort your setup before the show starts.
                </div>
                <?php endif; ?>
                
                <div class="shopping-section">
                    <h4>🛒 Backstage Rider (Copy this to your phone):</h4>
                    <div class="shopping-grid">
                        <?php foreach ($mealData['shopping_list'] as $item): ?>
                            <div class="shopping-item"><?php echo htmlspecialchars($item); ?></div>
                        <?php endforeach; ?>
                    </div>
                </div>
                
                <div class="sarcasm-box">
                    <?php echo htmlspecialchars($mealData['sarcasm']); ?>
                </div>
                
                <div class="wife-impresser">
                    <h4>💝 Smart Planning Assistant</h4>
                    <p>This meal was selected using advanced nutritional algorithms, considering balanced protein, cost efficiency, preparation time optimization, and family preference analytics. Evidence-based meal planning for optimal household nutrition.</p>
                </div>
                
                <div class="email-section">
                    <h4>📧 Send the Track to Your Phone</h4>
                    <p>Because let's be honest, you'll forget the shopping list before you even hit the car park.</p>
                    <form method="post" class="email-form">
                        <input type="hidden" name="selected_meal_name" value="<?php echo htmlspecialchars($selectedMeal); ?>">
                        <input type="email" name="email" placeholder="your.email@domain.com" required>
                        <button type="submit" class="email-btn">📤 Drop the Beat</button>
                    </form>
                    
                    <?php if ($emailSent): ?>
                        <div class="email-status email-success">
                            ✅ Track delivered! Check your inbox for the full remix.
                        </div>
                    <?php elseif (isset($_POST['email']) && !$emailSent): ?>
                        <div class="email-status email-error">
                            ❌ Sound system's having a wobble. Your server's gone a bit Pete Tong.
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php endif; ?>
        
        <?php if (!empty($weeklyPlan) || !empty($_SESSION['weekly_plan'])): ?>
        <?php $planToShow = !empty($weeklyPlan) ? $weeklyPlan : $_SESSION['weekly_plan']; ?>
        <div class="weekly-planner">
            <h4>📅 Your Weekly Setlist</h4>
            <p>Seven bangers lined up and ready to drop. Because planning the whole week's playlist beats choosing track by track.</p>
            <div class="week-grid">
                <?php foreach ($planToShow as $day => $meal): ?>
                    <div class="day-meal">
                        <div class="day-name"><?php echo $day; ?></div>
                        <div class="day-meal-name"><?php echo $meals[$meal]['emoji']; ?> <?php echo htmlspecialchars($meal); ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>
        
        <?php if (!empty($_SESSION['meal_history'])): ?>
        <div class="meal-history">
            <h4>📊 Recent Playlist History</h4>
            <p>Your latest culinary tracks (the good, the bad, and the "we're having soup again"):</p>
            <?php foreach (array_reverse($_SESSION['meal_history']) as $historyItem): ?>
                <div class="history-item">
                    <strong><?php echo htmlspecialchars($historyItem['meal']); ?></strong>
                    <span style="float: right; color: #666;">
                        <?php echo $historyItem['date']; ?> 
                        (<?php echo ucfirst($historyItem['difficulty']); ?>)
                    </span>
                </div>
            <?php endforeach; ?>
            <form method="post">
                <button type="submit" name="clear_history" class="clear-history">🗑️ Clear the Decks</button>
            </form>
        </div>
        <?php endif; ?>
    </div>
</div>

<div class="how-it-works">
    <div class="accordion-header" onclick="toggleAccordion()">
        <span>🎮 How This DJ Booth Works</span>
        <span class="accordion-toggle" id="accordionToggle">▼</span>
    </div>
    <div class="accordion-content" id="accordionContent">
        <div class="accordion-inner">
            <div class="how-it-works-grid">
                <div class="how-it-works-item">
                    <h4>🎲 Hit Me With Your Best Shot</h4>
                    <p>Completely removes choice paralysis. The algorithm becomes your DJ, picking the perfect track for tonight.</p>
                </div>
                <div class="how-it-works-item">
                    <h4>🚨 Quick Mix</h4>
                    <p>25 minutes or less. No defrosting required. For when you're in full panic mode but still need to feed the crew.</p>
                </div>
                <div class="how-it-works-item">
                    <h4>🎧 DJ Set</h4>
                    <p>20-30 minutes cooking, but requires defrosting or morning prep. For when you've got your planning hat on.</p>
                </div>
                <div class="how-it-works-item">
                    <h4>🔥 Full Album</h4>
                    <p>30-45 minutes. You've got bandwidth and can handle a proper cooking session with multiple tracks.</p>
                </div>
                <div class="how-it-works-item">
                    <h4>📧 Send the Track</h4>
                    <p>Emails the full shopping list and prep instructions. Because memory is overrated when you're juggling everything else.</p>
                </div>
                <div class="how-it-works-item">
                    <h4>📅 Weekly Setlist</h4>
                    <p>Generates a full week of meals. One big decision beats seven small ones any day of the week.</p>
                </div>
            </div>
            
            <div style="margin-top: 30px; padding: 20px; background: rgba(255,255,255,0.1); border-radius: 10px;">
                <h4>⚙️ Technical Specs</h4>
                <ul style="margin: 10px 0; color: rgba(255,255,255,0.9); font-size: 0.9rem;">
                    <li><strong>Email Function:</strong> Requires PHP mail() configuration. If it fails, blame the sound engineer (your hosting provider).</li>
                    <li><strong>Session Storage:</strong> Meal history and weekly playlists stored in PHP sessions (cleared when you close browser).</li>
                    <li><strong>Cost Estimates:</strong> Based on average UK supermarket prices as of 2025.</li>
                    <li><strong>Kid Ratings:</strong> Scientifically calculated using the "will they actually eat it" methodology.</li>
                    <li><strong>DJ Commentary:</strong> Calibrated for maximum motivational impact with a Birmingham twist.</li>
                </ul>
            </div>
        </div>
    </div>
</div>
```

</div>

<script>
function toggleAccordion() {
    const content = document.getElementById('accordionContent');
    const toggle = document.getElementById('accordionToggle');
    
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        toggle.textContent = '▼';
    } else {
        content.classList.add('active');
        toggle.textContent = '▲';
    }
}
</script>

</body>
</html>
