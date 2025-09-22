const { useState } = React;
const { Shuffle, Clock, Users, Zap, Star, ChefHat } = lucide;

const MealRotationApp = () => {
  const [currentMeal, setCurrentMeal] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const meals = [
    // Core 11 Kid-Friendly Mains
    {
      id: 1,
      name: "Spaghetti Bolognese",
      type: "core",
      prep: "Double batch sauce, freeze half",
      time: 45,
      tags: ["quick", "batch-friendly"],
      ingredients: ["beef mince", "spaghetti", "onions", "tinned tomatoes"],
      method: "Brown mince, add veg and tomatoes, simmer 30 mins"
    },
    {
      id: 2,
      name: "Chicken Curry (Mild Korma/Tikka)",
      type: "core",
      prep: "Slow cooker method",
      time: 20,
      tags: ["slow-cooker", "planned"],
      ingredients: ["chicken breast", "curry paste", "coconut milk", "rice"],
      method: "Slow cooker: 4 hours low. Hob: 25 mins simmer"
    },
    {
      id: 3,
      name: "Grilled Salmon with Rice & Broccoli",
      type: "core",
      prep: "Quick midweek option",
      time: 25,
      tags: ["luxury", "quick"],
      ingredients: ["salmon fillets", "basmati rice", "broccoli"],
      method: "Steam rice, grill salmon 12 mins, steam broccoli"
    },
    {
      id: 4,
      name: "Turkey or Chicken Meatballs with Tomato Pasta",
      type: "core",
      prep: "Kids help with rolling",
      time: 35,
      tags: ["batch-friendly", "kid-involvement"],
      ingredients: ["turkey mince", "pasta", "tomato sauce", "herbs"],
      method: "Roll meatballs, brown, simmer in sauce 20 mins"
    },
    {
      id: 5,
      name: "Soup & a Toastie",
      type: "core",
      prep: "Batch soup Sunday, reheat midweek",
      time: 10,
      tags: ["rush", "comfort"],
      ingredients: ["pre-made soup", "bread", "cheese", "butter"],
      method: "Reheat soup, grill toasties"
    },
    {
      id: 6,
      name: "Chicken Fajitas",
      type: "core",
      prep: "Pre-cut vegetables Monday evening",
      time: 30,
      tags: ["planned", "interactive"],
      ingredients: ["chicken strips", "peppers", "onions", "tortillas"],
      method: "Fry chicken and veg, warm tortillas, serve with toppings"
    },
    {
      id: 7,
      name: "Homemade-Style Burgers",
      type: "core",
      prep: "Kids help with burger assembly",
      time: 25,
      tags: ["weekend", "kid-involvement"],
      ingredients: ["beef mince", "burger buns", "cheese", "chips"],
      method: "Form patties, grill 8 mins, oven chips 20 mins"
    },
    {
      id: 8,
      name: "Mild Chilli con Carne",
      type: "core",
      prep: "Use bolognese base",
      time: 35,
      tags: ["batch-friendly", "comfort"],
      ingredients: ["beef mince", "kidney beans", "rice", "mild spices"],
      method: "Brown mince, add beans and spices, simmer 25 mins"
    },
    {
      id: 9,
      name: "Tuna Pasta Bake",
      type: "core",
      prep: "Assemble morning, bake later",
      time: 40,
      tags: ["make-ahead", "comfort"],
      ingredients: ["pasta", "tuna", "cheese sauce", "sweetcorn"],
      method: "Cook pasta, mix with sauce, top with cheese, bake 25 mins"
    },
    {
      id: 10,
      name: "Sausages, Egg & Chips",
      type: "core",
      prep: "Simple weekend meal",
      time: 30,
      tags: ["weekend", "simple"],
      ingredients: ["sausages", "eggs", "potatoes", "peas"],
      method: "Oven chips 25 mins, grill sausages, fry eggs"
    },
    {
      id: 11,
      name: "Jacket Potato with Toppings",
      type: "core",
      prep: "Oven timing with Sunday prep",
      time: 60,
      tags: ["planned", "flexible"],
      ingredients: ["baking potatoes", "cheese", "beans", "tuna"],
      method: "Oven 200°C for 1 hour, serve with choice of toppings"
    },
    // Strategic Variations (Weeks 2-3)
    {
      id: 12,
      name: "Beef & Sweet Potato Bolognese",
      type: "variation",
      parent: "Spaghetti Bolognese",
      prep: "Sweet potato adds nutrition",
      time: 50,
      tags: ["luxury", "nutritious"],
      ingredients: ["beef mince", "sweet potato", "spaghetti", "tomatoes"],
      method: "Dice sweet potato, cook with mince, simmer 35 mins"
    },
    {
      id: 13,
      name: "Thai-Style Chicken Curry",
      type: "variation",
      parent: "Chicken Curry",
      prep: "Coconut milk base",
      time: 25,
      tags: ["luxury", "aromatic"],
      ingredients: ["chicken", "thai curry paste", "coconut milk", "jasmine rice"],
      method: "Fry paste, add chicken and coconut milk, simmer 20 mins"
    },
    {
      id: 14,
      name: "Cod & Potato Tray Bake",
      type: "variation",
      parent: "Grilled Salmon",
      prep: "One-tray convenience",
      time: 35,
      tags: ["planned", "minimal-washing"],
      ingredients: ["cod fillets", "new potatoes", "cherry tomatoes", "herbs"],
      method: "Roast potatoes 20 mins, add fish and tomatoes, 15 mins more"
    },
    {
      id: 15,
      name: "Pork & Apple Meatballs",
      type: "variation",
      parent: "Turkey Meatballs",
      prep: "Sweet and savoury combination",
      time: 40,
      tags: ["luxury", "seasonal"],
      ingredients: ["pork mince", "apple", "pasta", "sage"],
      method: "Mix apple into mince, roll balls, brown and simmer in sauce"
    },
    {
      id: 16,
      name: "Chicken Quesadillas",
      type: "variation",
      parent: "Chicken Fajitas",
      prep: "Quicker than fajitas",
      time: 15,
      tags: ["rush", "simple"],
      ingredients: ["cooked chicken", "tortillas", "cheese", "peppers"],
      method: "Fill tortillas, dry fry 3 mins each side until crispy"
    },
    {
      id: 17,
      name: "Lamb Kofta Burgers",
      type: "variation",
      parent: "Homemade Burgers",
      prep: "Mediterranean flavours",
      time: 30,
      tags: ["luxury", "weekend"],
      ingredients: ["lamb mince", "mint", "burger buns", "tzatziki"],
      method: "Mix herbs into mince, shape and grill 10 mins"
    },
    {
      id: 18,
      name: "Turkey Chilli",
      type: "variation",
      parent: "Mild Chilli",
      prep: "Leaner protein option",
      time: 35,
      tags: ["healthy", "batch-friendly"],
      ingredients: ["turkey mince", "kidney beans", "sweet potato", "mild spices"],
      method: "Brown turkey, add vegetables and beans, simmer 25 mins"
    },
    {
      id: 19,
      name: "Salmon Pasta Bake",
      type: "variation",
      parent: "Tuna Pasta Bake",
      prep: "Weekend luxury version",
      time: 45,
      tags: ["luxury", "make-ahead"],
      ingredients: ["salmon fillet", "pasta", "cream cheese", "spinach"],
      method: "Flake cooked salmon into pasta, top with cheese, bake 25 mins"
    },
    {
      id: 20,
      name: "Chicken Sausage & Mash",
      type: "variation",
      parent: "Sausages, Egg & Chips",
      prep: "Comfort food upgrade",
      time: 35,
      tags: ["comfort", "weekend"],
      ingredients: ["chicken sausages", "potatoes", "butter", "peas"],
      method: "Boil potatoes, grill sausages, mash with butter"
    },
    {
      id: 21,
      name: "Sweet Potato Jackets",
      type: "variation",
      parent: "Jacket Potato",
      prep: "Nutritious alternative",
      time: 50,
      tags: ["healthy", "planned"],
      ingredients: ["sweet potatoes", "black beans", "feta", "herbs"],
      method: "Oven 200°C for 45 mins, serve with healthy toppings"
    }
  ];

  const filters = [
    { id: 'all', label: 'All Meals', icon: ChefHat },
    { id: 'rush', label: 'In a Rush', icon: Zap },
    { id: 'planned', label: 'Have Plan Time', icon: Clock },
    { id: 'quick', label: 'Quick & Simple', icon: Users },
    { id: 'luxury', label: 'Weekend Luxury', icon: Star }
  ];

  const getFilteredMeals = () => {
    if (selectedFilter === 'all') return meals;
    return meals.filter(meal => meal.tags.includes(selectedFilter));
  };

  const shuffleMeal = () => {
    const filteredMeals = getFilteredMeals();
    if (filteredMeals.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * filteredMeals.length);
    setCurrentMeal(filteredMeals[randomIndex]);
  };

  const getTimeColor = (time) => {
    if (time <= 20) return 'text-green-600';
    if (time <= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return React.createElement('div', {
    className: "max-w-4xl mx-auto p-6 bg-white min-h-screen"
  }, [
    React.createElement('div', {
      className: "text-center mb-8",
      key: "header"
    }, [
      React.createElement('h1', {
        className: "text-3xl font-bold text-gray-900 mb-2",
        key: "title"
      }, "21-Meal Family Rotation"),
      React.createElement('p', {
        className: "text-gray-600",
        key: "subtitle"
      }, "Strategic meal planning for busy families")
    ]),

    React.createElement('div', {
      className: "flex flex-wrap gap-2 justify-center mb-8",
      key: "filters"
    }, filters.map(filter => 
      React.createElement('button', {
        key: filter.id,
        onClick: () => setSelectedFilter(filter.id),
        className: `flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
          selectedFilter === filter.id
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
        }`
      }, [
        React.createElement(filter.icon, { size: 16, key: "icon" }),
        filter.label
      ])
    )),

    React.createElement('div', {
      className: "text-center mb-8",
      key: "shuffle-section"
    }, [
      React.createElement('button', {
        onClick: shuffleMeal,
        className: "inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg",
        key: "shuffle-btn"
      }, [
        React.createElement(Shuffle, { size: 24, key: "shuffle-icon" }),
        "Get Tonight's Meal"
      ]),
      React.createElement('p', {
        className: "text-sm text-gray-500 mt-2",
        key: "count"
      }, `${getFilteredMeals().length} meals available with current filter`)
    ]),

    currentMeal && React.createElement('div', {
      className: "bg-gray-50 rounded-xl p-6 border border-gray-200",
      key: "meal-display"
    }, [
      React.createElement('div', {
        className: "flex items-start justify-between mb-4",
        key: "meal-header"
      }, React.createElement('div', {}, [
        React.createElement('h2', {
          className: "text-2xl font-bold text-gray-900 mb-1",
          key: "meal-name"
        }, currentMeal.name),
        currentMeal.type === 'variation' && React.createElement('p', {
          className: "text-sm text-blue-600 mb-2",
          key: "variation-note"
        }, `Variation of: ${currentMeal.parent}`),
        React.createElement('div', {
          className: "flex items-center gap-4 text-sm text-gray-600",
          key: "meal-meta"
        }, [
          React.createElement('span', {
            className: `flex items-center gap-1 ${getTimeColor(currentMeal.time)}`,
            key: "time"
          }, [
            React.createElement(Clock, { size: 14, key: "clock-icon" }),
            `${currentMeal.time} mins`
          ]),
          React.createElement('span', {
            className: "text-gray-500",
            key: "separator"
          }, "•"),
          React.createElement('span', {
            key: "tags"
          }, currentMeal.tags.join(', '))
        ])
      ])),

      React.createElement('div', {
        className: "grid md:grid-cols-2 gap-6",
        key: "meal-details"
      }, [
        React.createElement('div', {
          key: "prep-method"
        }, [
          React.createElement('h3', {
            className: "font-semibold text-gray-900 mb-2",
            key: "prep-title"
          }, "Preparation Notes"),
          React.createElement('p', {
            className: "text-gray-700 mb-4",
            key: "prep-text"
          }, currentMeal.prep),
          React.createElement('h3', {
            className: "font-semibold text-gray-900 mb-2",
            key: "method-title"
          }, "Method"),
          React.createElement('p', {
            className: "text-gray-700",
            key: "method-text"
          }, currentMeal.method)
        ]),
        React.createElement('div', {
          key: "ingredients"
        }, [
          React.createElement('h3', {
            className: "font-semibold text-gray-900 mb-2",
            key: "ingredients-title"
          }, "Key Ingredients"),
          React.createElement('div', {
            className: "flex flex-wrap gap-2",
            key: "ingredients-list"
          }, currentMeal.ingredients.map((ingredient, index) =>
            React.createElement('span', {
              key: index,
              className: "px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            }, ingredient)
          ))
        ])
      ])
    ]),

    !currentMeal && React.createElement('div', {
      className: "bg-gray-50 rounded-xl p-6 border border-gray-200",
      key: "quick-ref"
    }, [
      React.createElement('h3', {
        className: "font-semibold text-gray-900 mb-4",
        key: "ref-title"
      }, "Quick Reference"),
      React.createElement('div', {
        className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm",
        key: "ref-grid"
      }, [
        React.createElement('div', {
          key: "rush-ref"
        }, [
          React.createElement('span', {
            className: "font-medium text-green-600",
            key: "rush-label"
          }, "Rush (≤20 mins):"),
          React.createElement('p', {
            className: "text-gray-600",
            key: "rush-desc"
          }, "Soup & Toastie, Quesadillas")
        ]),
        React.createElement('div', {
          key: "quick-ref"
        }, [
          React.createElement('span', {
            className: "font-medium text-orange-600",
            key: "quick-label"
          }, "Quick (≤30 mins):"),
          React.createElement('p', {
            className: "text-gray-600",
            key: "quick-desc"
          }, "Salmon, Fajitas, Burgers")
        ]),
        React.createElement('div', {
          key: "planned-ref"
        }, [
          React.createElement('span', {
            className: "font-medium text-blue-600",
            key: "planned-label"
          }, "Planned:"),
          React.createElement('p', {
            className: "text-gray-600",
            key: "planned-desc"
          }, "Slow cooker, Make-ahead, Tray bakes")
        ]),
        React.createElement('div', {
          key: "luxury-ref"
        }, [
          React.createElement('span', {
            className: "font-medium text-purple-600",
            key: "luxury-label"
          }, "Luxury:"),
          React.createElement('p', {
            className: "text-gray-600",
            key: "luxury-desc"
          }, "Weekend variations, Premium proteins")
        ])
      ])
    ])
  ]);
};

ReactDOM.render(React.createElement(MealRotationApp), document.getElementById('root'));
