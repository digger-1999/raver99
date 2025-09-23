import React, { useState, useEffect } from 'react';
import { 
  Shuffle, Clock, Users, Zap, Star, ChefHat, Calendar, 
  ShoppingCart, History, Settings, Heart, X, Plus, 
  CheckCircle, RotateCcw, Download, Upload, Trash2,
  Filter, Search, BookOpen, Timer, AlertCircle
} from 'lucide-react';

const MealPlannerApp = () => {
  // Core state
  const [currentMeal, setCurrentMeal] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('shuffle');
  
  // Advanced features state
  const [weeklyPlan, setWeeklyPlan] = useState({});
  const [mealHistory, setMealHistory] = useState([]);
  const [favourites, setFavourites] = useState(new Set());
  const [shoppingList, setShoppingList] = useState([]);
  const [customMeals, setCustomMeals] = useState([]);
  const [preferences, setPreferences] = useState({
    excludeIngredients: [],
    dietaryRestrictions: [],
    cookingTimeLimit: 120,
    servingSize: 4
  });
  
  // UI state
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const meals = [
    // Core 11 Kid-Friendly Mains
    {
      id: 1,
      name: "Spaghetti Bolognese",
      type: "core",
      prep: "Double batch sauce, freeze half",
      time: 45,
      servings: 4,
      difficulty: "easy",
      tags: ["quick", "batch-friendly", "italian"],
      ingredients: [
        { item: "beef mince", amount: "500g", essential: true },
        { item: "spaghetti", amount: "400g", essential: true },
        { item: "onions", amount: "2 large", essential: true },
        { item: "tinned tomatoes", amount: "800g", essential: true },
        { item: "garlic", amount: "3 cloves", essential: false },
        { item: "carrots", amount: "2 medium", essential: false }
      ],
      method: "Brown mince, add veg and tomatoes, simmer 30 mins",
      nutrition: { calories: 520, protein: 28, carbs: 65, fat: 18 },
      cost: 8.50
    },
    {
      id: 2,
      name: "Chicken Curry (Mild Korma/Tikka)",
      type: "core",
      prep: "Slow cooker method",
      time: 20,
      servings: 4,
      difficulty: "easy",
      tags: ["slow-cooker", "planned", "indian", "mild"],
      ingredients: [
        { item: "chicken breast", amount: "600g", essential: true },
        { item: "curry paste", amount: "3 tbsp", essential: true },
        { item: "coconut milk", amount: "400ml", essential: true },
        { item: "basmati rice", amount: "300g", essential: true },
        { item: "onion", amount: "1 large", essential: false }
      ],
      method: "Slow cooker: 4 hours low. Hob: 25 mins simmer",
      nutrition: { calories: 485, protein: 35, carbs: 45, fat: 20 },
      cost: 12.00
    },
    {
      id: 3,
      name: "Grilled Salmon with Rice & Broccoli",
      type: "core",
      prep: "Quick midweek option",
      time: 25,
      servings: 4,
      difficulty: "easy",
      tags: ["luxury", "quick", "healthy", "omega-3"],
      ingredients: [
        { item: "salmon fillets", amount: "4 portions", essential: true },
        { item: "basmati rice", amount: "300g", essential: true },
        { item: "broccoli", amount: "400g", essential: true },
        { item: "lemon", amount: "1 whole", essential: false }
      ],
      method: "Steam rice, grill salmon 12 mins, steam broccoli",
      nutrition: { calories: 420, protein: 32, carbs: 35, fat: 18 },
      cost: 16.00
    },
    {
      id: 4,
      name: "Turkey or Chicken Meatballs with Tomato Pasta",
      type: "core",
      prep: "Kids help with rolling",
      time: 35,
      servings: 4,
      difficulty: "medium",
      tags: ["batch-friendly", "kid-involvement", "protein"],
      ingredients: [
        { item: "turkey mince", amount: "500g", essential: true },
        { item: "pasta shapes", amount: "400g", essential: true },
        { item: "tomato sauce", amount: "600ml", essential: true },
        { item: "herbs", amount: "mixed", essential: false }
      ],
      method: "Roll meatballs, brown, simmer in sauce 20 mins",
      nutrition: { calories: 465, protein: 30, carbs: 55, fat: 12 },
      cost: 9.50
    },
    {
      id: 5,
      name: "Soup & a Toastie",
      type: "core",
      prep: "Batch soup Sunday, reheat midweek",
      time: 10,
      servings: 4,
      difficulty: "easy",
      tags: ["rush", "comfort", "quick"],
      ingredients: [
        { item: "pre-made soup", amount: "800ml", essential: true },
        { item: "bread", amount: "8 slices", essential: true },
        { item: "cheese", amount: "200g", essential: true },
        { item: "butter", amount: "50g", essential: true }
      ],
      method: "Reheat soup, grill toasties",
      nutrition: { calories: 380, protein: 18, carbs: 45, fat: 16 },
      cost: 6.00
    },
    {
      id: 6,
      name: "Chicken Fajitas",
      type: "core",
      prep: "Pre-cut vegetables Monday evening",
      time: 30,
      servings: 4,
      difficulty: "easy",
      tags: ["planned", "interactive", "mexican"],
      ingredients: [
        { item: "chicken strips", amount: "500g", essential: true },
        { item: "peppers", amount: "3 mixed", essential: true },
        { item: "onions", amount: "2 large", essential: true },
        { item: "tortillas", amount: "8 wraps", essential: true }
      ],
      method: "Fry chicken and veg, warm tortillas, serve with toppings",
      nutrition: { calories: 445, protein: 32, carbs: 50, fat: 14 },
      cost: 10.50
    },
    {
      id: 7,
      name: "Homemade-Style Burgers",
      type: "core",
      prep: "Kids help with burger assembly",
      time: 25,
      servings: 4,
      difficulty: "easy",
      tags: ["weekend", "kid-involvement", "comfort"],
      ingredients: [
        { item: "beef mince", amount: "600g", essential: true },
        { item: "burger buns", amount: "4 buns", essential: true },
        { item: "cheese slices", amount: "4 slices", essential: false },
        { item: "oven chips", amount: "600g", essential: true }
      ],
      method: "Form patties, grill 8 mins, oven chips 20 mins",
      nutrition: { calories: 580, protein: 35, carbs: 45, fat: 28 },
      cost: 11.00
    },
    {
      id: 8,
      name: "Mild Chilli con Carne",
      type: "core",
      prep: "Use bolognese base",
      time: 35,
      servings: 4,
      difficulty: "easy",
      tags: ["batch-friendly", "comfort", "mexican"],
      ingredients: [
        { item: "beef mince", amount: "500g", essential: true },
        { item: "kidney beans", amount: "800g tinned", essential: true },
        { item: "long grain rice", amount: "300g", essential: true },
        { item: "mild spices", amount: "packet", essential: true }
      ],
      method: "Brown mince, add beans and spices, simmer 25 mins",
      nutrition: { calories: 495, protein: 32, carbs: 58, fat: 15 },
      cost: 8.00
    }
  ];

  // Filters configuration
  const filters = [
    { id: 'all', label: 'All Meals', icon: ChefHat },
    { id: 'rush', label: 'In a Rush', icon: Zap },
    { id: 'planned', label: 'Have Plan Time', icon: Clock },
    { id: 'quick', label: 'Quick & Simple', icon: Users },
    { id: 'luxury', label: 'Weekend Luxury', icon: Star }
  ];

  // Days of the week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('mealPlannerData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setWeeklyPlan(data.weeklyPlan || {});
      setMealHistory(data.mealHistory || []);
      setFavourites(new Set(data.favourites || []));
      setShoppingList(data.shoppingList || []);
      setCustomMeals(data.customMeals || []);
      setPreferences(data.preferences || preferences);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      weeklyPlan,
      mealHistory,
      favourites: Array.from(favourites),
      shoppingList,
      customMeals,
      preferences
    };
    localStorage.setItem('mealPlannerData', JSON.stringify(dataToSave));
  }, [weeklyPlan, mealHistory, favourites, shoppingList, customMeals, preferences]);

  // Get all meals (default + custom)
  const getAllMeals = () => [...meals, ...customMeals];

  // Filter meals based on selected filter and search
  const getFilteredMeals = () => {
    let filteredMeals = getAllMeals();
    
    if (selectedFilter !== 'all') {
      filteredMeals = filteredMeals.filter(meal => meal.tags.includes(selectedFilter));
    }
    
    if (searchTerm) {
      filteredMeals = filteredMeals.filter(meal => 
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        meal.ingredients.some(ing => ing.item.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filteredMeals;
  };

  // Shuffle meal with smart suggestions
  const shuffleMeal = () => {
    const filteredMeals = getFilteredMeals();
    if (filteredMeals.length === 0) return;
    
    // Smart filtering: avoid recent meals, prefer favourites occasionally
    let availableMeals = filteredMeals.filter(meal => 
      !mealHistory.slice(-5).some(historyMeal => historyMeal.id === meal.id)
    );
    
    if (availableMeals.length === 0) availableMeals = filteredMeals;
    
    // 30% chance to pick from favourites if available
    const favouriteMeals = availableMeals.filter(meal => favourites.has(meal.id));
    if (favouriteMeals.length > 0 && Math.random() < 0.3) {
      availableMeals = favouriteMeals;
    }
    
    const randomIndex = Math.floor(Math.random() * availableMeals.length);
    const selectedMeal = availableMeals[randomIndex];
    
    setCurrentMeal(selectedMeal);
    
    // Add to history
    const historyEntry = {
      ...selectedMeal,
      selectedAt: new Date().toISOString(),
      filter: selectedFilter
    };
    setMealHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50
  };

  // Toggle favourite
  const toggleFavourite = (mealId) => {
    setFavourites(prev => {
      const newFavourites = new Set(prev);
      if (newFavourites.has(mealId)) {
        newFavourites.delete(mealId);
      } else {
        newFavourites.add(mealId);
      }
      return newFavourites;
    });
  };

  // Add meal to weekly plan
  const addToWeeklyPlan = (meal, day) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [day]: meal
    }));
  };

  // Generate shopping list
  const generateShoppingList = () => {
    const plannedMeals = Object.values(weeklyPlan);
    const allIngredients = [];
    
    plannedMeals.forEach(meal => {
      if (meal && meal.ingredients) {
        meal.ingredients.forEach(ingredient => {
          const existing = allIngredients.find(item => item.item === ingredient.item);
          if (existing) {
            existing.meals.push(meal.name);
          } else {
            allIngredients.push({
              ...ingredient,
              meals: [meal.name],
              checked: false,
              id: Date.now() + Math.random()
            });
          }
        });
      }
    });
    
    setShoppingList(allIngredients);
    setActiveTab('shopping');
  };

  // Auto-plan week
  const autoPlanWeek = () => {
    const availableMeals = getAllMeals();
    const newPlan = {};
    
    days.forEach((day, index) => {
      let mealPool = availableMeals;
      
      // Smart planning logic
      if (index < 5) { // Weekdays
        mealPool = availableMeals.filter(meal => 
          meal.tags.includes('quick') || meal.tags.includes('planned') || meal.time <= 45
        );
      } else { // Weekends
        mealPool = availableMeals.filter(meal => 
          meal.tags.includes('luxury') || meal.tags.includes('weekend') || meal.time > 30
        );
      }
      
      // Avoid repetition
      const usedMeals = Object.values(newPlan);
      const availablePool = mealPool.filter(meal => 
        !usedMeals.some(used => used && used.id === meal.id)
      );
      
      if (availablePool.length > 0) {
        const randomMeal = availablePool[Math.floor(Math.random() * availablePool.length)];
        newPlan[day] = randomMeal;
      }
    });
    
    setWeeklyPlan(newPlan);
    setActiveTab('weekly');
  };

  // Time color coding
  const getTimeColor = (time) => {
    if (time <= 20) return 'text-green-600';
    if (time <= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // Difficulty badge
  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-orange-100 text-orange-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || colors.easy;
  };

  // Render meal card
  const renderMealCard = (meal, showActions = true, day = null) => (
    <div key={meal.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{meal.name}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
            <span className={`flex items-center gap-1 ${getTimeColor(meal.time)}`}>
              <Clock size={14} />
              {meal.time} mins
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyBadge(meal.difficulty)}`}>
              {meal.difficulty}
            </span>
            <span className="text-gray-500">£{meal.cost?.toFixed(2)}</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-3">
            {meal.tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavourite(meal.id)}
              className={`p-2 rounded-lg transition-colors ${
                favourites.has(meal.id) 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-gray-50'
              }`}
            >
              <Heart size={16} fill={favourites.has(meal.id) ? 'currentColor' : 'none'} />
            </button>
            
            {day && (
              <button
                onClick={() => setWeeklyPlan(prev => ({ ...prev, [day]: null }))}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-gray-700 text-sm mb-3">{meal.prep}</p>
      <p className="text-gray-600 text-sm mb-4">{meal.method}</p>
      
      <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div>
          <span className="font-medium">Serves:</span> {meal.servings}
        </div>
        <div>
          <span className="font-medium">Calories:</span> {meal.nutrition?.calories || 'N/A'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Family Meal Planner</h1>
        <p className="text-gray-600">Strategic meal planning for busy families</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {[
          { id: 'shuffle', label: 'Meal Shuffle', icon: Shuffle },
          { id: 'weekly', label: 'Weekly Plan', icon: Calendar },
          { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
          { id: 'history', label: 'History', icon: History },
          { id: 'recipes', label: 'All Recipes', icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Meal Shuffle Tab */}
      {activeTab === 'shuffle' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {filters.map(filter => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    selectedFilter === filter.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <Icon size={16} />
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search meals, ingredients, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Shuffle Button */}
          <div className="text-center mb-8">
            <button
              onClick={shuffleMeal}
              className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Shuffle size={24} />
              Get Tonight's Meal
            </button>
            <p className="text-sm text-gray-500 mt-2">
              {getFilteredMeals().length} meals available with current filters
            </p>
          </div>

          {/* Current Meal Display */}
          {currentMeal && (
            <div className="max-w-4xl mx-auto mb-8">
              {renderMealCard(currentMeal)}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => addToWeeklyPlan(currentMeal, 'Monday')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add to Weekly Plan
                </button>
                <button
                  onClick={() => setCurrentMeal(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Plan Tab */}
      {activeTab === 'weekly' && (
        <div>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            <button
              onClick={autoPlanWeek}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Auto-Plan Week
            </button>
            <button
              onClick={generateShoppingList}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Generate Shopping List
            </button>
            <button
              onClick={() => setWeeklyPlan({})}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Week
            </button>
          </div>

          <div className="grid gap-4">
            {days.map(day => (
              <div key={day} className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{day}</h3>
                {weeklyPlan[day] ? (
                  renderMealCard(weeklyPlan[day], true, day)
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <p className="text-gray-500 mb-2">No meal planned</p>
                    <button
                      onClick={() => {
                        const availableMeals = getAllMeals();
                        const randomMeal = availableMeals[Math.floor(Math.random() * availableMeals.length)];
                        addToWeeklyPlan(randomMeal, day);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Random Meal
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shopping List Tab */}
      {activeTab === 'shopping' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Shopping List</h2>
              <button
                onClick={() => setShoppingList([])}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Clear List
              </button>
            </div>
            
            {shoppingList.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 mb-4">No items in shopping list</p>
                <button
                  onClick={generateShoppingList}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generate from Weekly Plan
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {shoppingList.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => {
                        setShoppingList(prev => 
                          prev.map(i => i.id === item.id ? { ...i, checked: e.target.checked } : i)
                        );
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <div className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {item.item} - {item.amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        For: {item.meals.join(', ')}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.essential ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.essential ? 'Essential' : 'Optional'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Meal History</h2>
            
            {mealHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No meal history yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mealHistory.slice(0, 20).map((meal, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{meal.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(meal.selectedAt).toLocaleDateString()} • 
                        Filter: {meal.filter} • 
                        {meal.time} mins
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentMeal(meal)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Select Again
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Recipes Tab */}
      {activeTab === 'recipes' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Recipes</h2>
            <button
              onClick={() => setShowAddMeal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Add Custom Meal
            </button>
          </div>

          {/* Search and Filter for All Recipes */}
          <div className="mb-6 space-y-4">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search all recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {filters.map(filter => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all text-sm ${
                      selectedFilter === filter.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <Icon size={14} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredMeals().map(meal => (
              <div key={meal.id} className="relative">
                {renderMealCard(meal)}
                {meal.type === 'custom' && (
                  <button
                    onClick={() => {
                      setCustomMeals(prev => prev.filter(m => m.id !== meal.id));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Custom Meal</h3>
              <button
                onClick={() => setShowAddMeal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const newMeal = {
                id: Date.now(),
                name: formData.get('name'),
                prep: formData.get('prep'),
                method: formData.get('method'),
                time: parseInt(formData.get('time')),
                servings: parseInt(formData.get('servings')),
                difficulty: formData.get('difficulty'),
                cost: parseFloat(formData.get('cost')),
                type: 'custom',
                tags: formData.get('tags').split(',').map(tag => tag.trim()),
                ingredients: [
                  { item: formData.get('ingredient1'), amount: formData.get('amount1'), essential: true },
                  { item: formData.get('ingredient2'), amount: formData.get('amount2'), essential: true },
                  { item: formData.get('ingredient3'), amount: formData.get('amount3'), essential: false }
                ].filter(ing => ing.item),
                nutrition: {
                  calories: parseInt(formData.get('calories')) || 0,
                  protein: parseInt(formData.get('protein')) || 0,
                  carbs: parseInt(formData.get('carbs')) || 0,
                  fat: parseInt(formData.get('fat')) || 0
                }
              };
              
              setCustomMeals(prev => [...prev, newMeal]);
              setShowAddMeal(false);
            }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name</label>
                  <input
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., My Special Pasta"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Time (mins)</label>
                  <input
                    name="time"
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                  <input
                    name="servings"
                    type="number"
                    required
                    defaultValue="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost (£)</label>
                  <input
                    name="cost"
                    type="number"
                    step="0.50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8.50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  name="tags"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="quick, comfort, italian"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Notes</label>
                <textarea
                  name="prep"
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Quick prep tips..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                <textarea
                  name="method"
                  rows="3"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Step by step cooking method..."
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Key Ingredients</label>
                {[1, 2, 3].map(num => (
                  <div key={num} className="grid grid-cols-2 gap-2">
                    <input
                      name={`ingredient${num}`}
                      placeholder={`Ingredient ${num}`}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      name={`amount${num}`}
                      placeholder="Amount"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Calories</label>
                  <input
                    name="calories"
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Protein (g)</label>
                  <input
                    name="protein"
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Carbs (g)</label>
                  <input
                    name="carbs"
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Fat (g)</label>
                  <input
                    name="fat"
                    type="number"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="15"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Meal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMeal(false)}
                  className="px-6 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <Settings size={24} />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Serving Size
                </label>
                <input
                  type="number"
                  value={preferences.servingSize}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    servingSize: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Cooking Time (minutes)
                </label>
                <input
                  type="number"
                  value={preferences.cookingTimeLimit}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    cookingTimeLimit: parseInt(e.target.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div className="pt-4 space-y-2">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify({
                      weeklyPlan,
                      mealHistory,
                      favourites: Array.from(favourites),
                      shoppingList,
                      customMeals,
                      preferences
                    });
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'meal-planner-backup.json';
                    link.click();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} />
                  Export Data
                </button>
                
                <button
                  onClick={() => {
                    if (confirm('This will clear all your data. Are you sure?')) {
                      localStorage.removeItem('mealPlannerData');
                      location.reload();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <div className="flex flex-wrap justify-center gap-6">
          <span>Total Meals: {getAllMeals().length}</span>
          <span>Favourites: {favourites.size}</span>
          <span>History: {mealHistory.length}</span>
          <span>Planned: {Object.keys(weeklyPlan).length}/7 days</span>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerApp;
