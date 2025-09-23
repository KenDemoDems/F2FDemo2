// Recipe Generation Logic for FridgeToFork
import { Recipe } from './firebase';

// Types
interface GeneratedRecipe extends Omit<Recipe, 'id' | 'createdAt'> {
  matchPercentage: number;
  missingIngredients: string[];
}

// Extended recipe database with detailed information
const RECIPE_DATABASE: Omit<Recipe, 'id' | 'createdAt'>[] = [
  {
    name: "Egg Bowl",
    image: "figma:asset/2780e8169c075695ce0c5190b09759e545a810b6.png",
    time: '15 min',
    difficulty: 'Easy',
    calories: 420,
    nutritionBenefits: "High protein, rich in vitamins A & D",
    usedIngredients: ['egg', 'rice', 'cheese', 'onion'],
    ingredients: [
      "2 eggs (or 3 if you want it heartier)",
      "½ cup cooked rice (white, brown, or fried rice) OR cooked quinoa",
      "½ cup sautéed veggies (onions, bell peppers, spinach, mushrooms, etc.)",
      "2–3 slices of bacon OR sausage OR grilled chicken (optional protein)",
      "¼ cup shredded cheese (cheddar, mozzarella, or your choice)",
      "1 tbsp soy sauce (if using rice) or hot sauce (if you like spicy)",
      "Salt & pepper to taste",
      "Green onions or parsley for garnish"
    ],
    instructions: [
      { title: "Cook the base", detail: "If you're using rice or quinoa, reheat or cook it first. Place it in a bowl as the base." },
      { title: "Prepare the protein (optional)", detail: "Fry bacon/sausage OR cook chicken. Slice into bite-sized pieces." },
      { title: "Cook the eggs", detail: "Scramble: Beat eggs with a pinch of salt & pepper, then cook in a pan until soft and fluffy. Or sunny-side-up / poached: cook however you like best." },
      { title: "Sauté veggies", detail: "In a little oil, cook onions, peppers, and other veggies until tender." },
      { title: "Assemble the bowl", detail: "Base: rice or quinoa. Layer: sautéed veggies, cooked protein, and eggs on top. Sprinkle with cheese and let it melt." },
      { title: "Finish & serve", detail: "Drizzle soy sauce, sriracha, or hot sauce. Garnish with chopped green onions or parsley." }
    ]
  },
  {
    name: "Fresh Garden Salad",
    image: "figma:asset/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png",
    time: '10 min',
    difficulty: 'Easy',
    calories: 180,
    nutritionBenefits: "Low calorie, high fiber, antioxidants",
    usedIngredients: ['lettuce', 'tomato', 'cucumber', 'onion'],
    ingredients: [
      "2 cups mixed lettuce or spinach",
      "1 large tomato (diced)",
      "¼ cucumber (sliced)",
      "2 tbsp extra virgin olive oil",
      "1 tbsp fresh lemon juice",
      "¼ red onion (thinly sliced)",
      "Salt and pepper to taste",
      "Optional: feta cheese, olives, or nuts"
    ],
    instructions: [
      { title: "Prepare vegetables", detail: "Wash and dry lettuce leaves thoroughly. Dice tomato and slice cucumber into rounds." },
      { title: "Make dressing", detail: "In a small bowl, whisk together olive oil, lemon juice, salt, and pepper." },
      { title: "Assemble salad", detail: "In a large bowl, combine lettuce, tomato, cucumber, and red onion." },
      { title: "Finish & serve", detail: "Drizzle dressing over salad and toss gently. Add optional toppings if desired." }
    ]
  },
  {
    name: "Cheese Omelette",
    image: "figma:asset/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png",
    time: '12 min',
    difficulty: 'Medium',
    calories: 320,
    nutritionBenefits: "Protein-rich, calcium from cheese",
    usedIngredients: ['egg', 'cheese', 'milk'],
    ingredients: [
      "3 large eggs",
      "2 tbsp butter",
      "⅓ cup shredded cheese (cheddar, gruyere, or swiss)",
      "2 tbsp milk or cream",
      "Salt and pepper to taste",
      "1 tbsp fresh chives (chopped)",
      "Optional: herbs like parsley or dill"
    ],
    instructions: [
      { title: "Prepare eggs", detail: "Beat eggs with milk, salt, and pepper in a bowl until well combined." },
      { title: "Heat pan", detail: "Heat butter in a non-stick omelette pan over medium-low heat." },
      { title: "Cook omelette", detail: "Pour egg mixture into the pan. As eggs start to set, gently pull edges toward center with a spatula." },
      { title: "Add cheese", detail: "When eggs are almost set but still slightly wet on top, add cheese to one half of omelette." },
      { title: "Fold and serve", detail: "Carefully fold omelette in half and slide onto plate. Garnish with fresh chives." }
    ]
  },
  {
    name: "Vegetable Stir Fry",
    image: "figma:asset/3fedb2d27086faff5fd5d4e559738aa7837ac176.png",
    time: '20 min',
    difficulty: 'Easy',
    calories: 250,
    nutritionBenefits: "Rich in vitamins, low fat, high fiber",
    usedIngredients: ['broccoli', 'carrot', 'pepper', 'onion', 'garlic'],
    ingredients: [
      "2 cups mixed vegetables (broccoli, carrots, bell peppers, snap peas)",
      "2 cloves garlic (minced)",
      "1 inch fresh ginger (grated)",
      "2 tbsp vegetable oil or sesame oil",
      "2 tbsp soy sauce",
      "1 tbsp oyster sauce (optional)",
      "1 tsp cornstarch mixed with 2 tbsp water",
      "Green onions for garnish"
    ],
    instructions: [
      { title: "Prep vegetables", detail: "Cut all vegetables into uniform bite-sized pieces for even cooking." },
      { title: "Heat wok", detail: "Heat oil in a large wok or pan over high heat until smoking." },
      { title: "Add aromatics", detail: "Add garlic and ginger, stir-fry for 30 seconds until fragrant." },
      { title: "Cook vegetables", detail: "Add harder vegetables first (carrots, broccoli), then softer ones. Stir-fry for 3-5 minutes." },
      { title: "Season and finish", detail: "Add sauces and cornstarch mixture. Toss for 1 minute until glossy. Garnish with green onions." }
    ]
  },
  {
    name: "Tomato Basil Pasta",
    image: "figma:asset/2780e8169c075695ce0c5190b09759e545a810b6.png",
    time: '25 min',
    difficulty: 'Medium',
    calories: 380,
    nutritionBenefits: "Carbohydrates, lycopene from tomatoes, vitamin K",
    usedIngredients: ['pasta', 'tomato', 'garlic', 'basil', 'cheese'],
    ingredients: [
      "8 oz pasta (spaghetti, penne, or your choice)",
      "4 large ripe tomatoes (diced) or 1 can crushed tomatoes",
      "3 cloves garlic (minced)",
      "¼ cup fresh basil leaves",
      "3 tbsp extra virgin olive oil",
      "¼ cup grated Parmesan cheese",
      "Salt and pepper to taste",
      "Red pepper flakes (optional)"
    ],
    instructions: [
      { title: "Cook pasta", detail: "Boil pasta in salted water according to package directions until al dente." },
      { title: "Make sauce", detail: "Heat olive oil in a large pan. Sauté garlic for 1 minute, add tomatoes and cook for 10 minutes." },
      { title: "Combine", detail: "Drain pasta and add to sauce. Toss with fresh basil and Parmesan." },
      { title: "Serve", detail: "Season with salt, pepper, and red pepper flakes. Serve immediately." }
    ]
  },
  {
    name: "Apple Cinnamon Smoothie",
    image: "figma:asset/3fedb2d27086faff5fd5d4e559738aa7837ac176.png",
    time: '5 min',
    difficulty: 'Easy',
    calories: 150,
    nutritionBenefits: "Vitamin C, fiber, probiotics from yogurt",
    usedIngredients: ['apple', 'yogurt', 'milk', 'honey'],
    ingredients: [
      "1 large apple (cored and chopped)",
      "½ cup Greek yogurt",
      "½ cup milk (dairy or almond)",
      "1 tbsp honey or maple syrup",
      "½ tsp ground cinnamon",
      "¼ tsp vanilla extract",
      "6-8 ice cubes",
      "Optional: 1 tbsp oats for thickness"
    ],
    instructions: [
      { title: "Prepare apple", detail: "Core and roughly chop apple (leave skin on for extra fiber)." },
      { title: "Blend ingredients", detail: "Add all ingredients to blender and blend until smooth and creamy." },
      { title: "Adjust consistency", detail: "Add more milk if too thick, or more ice if too thin." },
      { title: "Serve", detail: "Pour into glass and sprinkle with extra cinnamon if desired." }
    ]
  },
  {
    name: "Grilled Cheese Sandwich",
    image: "figma:asset/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png",
    time: '8 min',
    difficulty: 'Easy',
    calories: 280,
    nutritionBenefits: "Protein, calcium, comfort food",
    usedIngredients: ['bread', 'cheese', 'butter'],
    ingredients: [
      "2 slices good quality bread",
      "2-3 slices cheese (cheddar, swiss, or gruyere)",
      "1 tbsp butter (softened)",
      "Optional: tomato slices, ham, or mustard"
    ],
    instructions: [
      { title: "Prepare sandwich", detail: "Butter one side of each bread slice. Place cheese between unbuttered sides." },
      { title: "Heat pan", detail: "Heat a non-stick pan or griddle over medium-low heat." },
      { title: "Cook first side", detail: "Place sandwich buttered-side down. Cook 2-3 minutes until golden brown." },
      { title: "Flip and finish", detail: "Flip carefully and cook another 2-3 minutes until cheese melts and both sides are golden." }
    ]
  },
  {
    name: "Fluffy Pancakes",
    image: "figma:asset/2780e8169c075695ce0c5190b09759e545a810b6.png",
    time: '18 min',
    difficulty: 'Medium',
    calories: 340,
    nutritionBenefits: "Carbohydrates, protein, calcium",
    usedIngredients: ['flour', 'milk', 'egg', 'butter'],
    ingredients: [
      "1 cup all-purpose flour",
      "1 cup milk",
      "1 large egg",
      "2 tbsp melted butter",
      "2 tbsp sugar",
      "1 tsp baking powder",
      "½ tsp salt",
      "Butter for cooking",
      "Maple syrup for serving"
    ],
    instructions: [
      { title: "Mix dry ingredients", detail: "In a bowl, whisk together flour, sugar, baking powder, and salt." },
      { title: "Combine wet ingredients", detail: "In another bowl, whisk milk, egg, and melted butter." },
      { title: "Make batter", detail: "Pour wet ingredients into dry ingredients. Mix until just combined (lumps are okay)." },
      { title: "Cook pancakes", detail: "Heat griddle over medium heat. Pour ¼ cup batter per pancake. Cook until bubbles form, flip, and cook until golden." }
    ]
  },
  {
    name: "Chicken Caesar Salad",
    image: "figma:asset/3fedb2d27086faff5fd5d4e559738aa7837ac176.png",
    time: '15 min',
    difficulty: 'Medium',
    calories: 420,
    nutritionBenefits: "High protein, vitamin K, healthy fats",
    usedIngredients: ['chicken', 'lettuce', 'cheese', 'bread'],
    ingredients: [
      "1 grilled chicken breast (sliced)",
      "1 head romaine lettuce (chopped)",
      "¼ cup grated Parmesan cheese",
      "2 tbsp Caesar dressing",
      "1 cup croutons",
      "Freshly ground black pepper"
    ],
    instructions: [
      { title: "Prepare chicken", detail: "Season and grill chicken breast until cooked through. Let rest, then slice." },
      { title: "Prepare salad", detail: "Wash and chop romaine lettuce. Place in large serving bowl." },
      { title: "Assemble", detail: "Add sliced chicken, croutons, and Parmesan cheese to lettuce." },
      { title: "Dress and serve", detail: "Toss with Caesar dressing and top with freshly ground pepper." }
    ]
  },
  {
    name: "Mushroom Risotto",
    image: "figma:asset/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png",
    time: '35 min',
    difficulty: 'Hard',
    calories: 380,
    nutritionBenefits: "Complex carbohydrates, umami flavors, B vitamins",
    usedIngredients: ['rice', 'mushroom', 'cheese', 'onion', 'garlic'],
    ingredients: [
      "1 cup Arborio rice",
      "8 oz mixed mushrooms (sliced)",
      "4 cups warm chicken or vegetable broth",
      "1 small onion (diced)",
      "2 cloves garlic (minced)",
      "½ cup white wine",
      "¼ cup grated Parmesan cheese",
      "2 tbsp butter",
      "2 tbsp olive oil"
    ],
    instructions: [
      { title: "Sauté mushrooms", detail: "Cook mushrooms in olive oil until golden. Remove and set aside." },
      { title: "Cook aromatics", detail: "In same pan, cook onion and garlic until translucent." },
      { title: "Toast rice", detail: "Add rice and stir for 2 minutes until edges are translucent." },
      { title: "Add liquid gradually", detail: "Add wine, then warm broth one ladle at a time, stirring constantly until absorbed." },
      { title: "Finish risotto", detail: "Stir in mushrooms, butter, and Parmesan. Season and serve immediately." }
    ]
  }
];

// Calculate ingredient match percentage
const calculateMatchPercentage = (recipeIngredients: string[], availableIngredients: string[]): number => {
  const available = availableIngredients.map(i => i.toLowerCase());
  const required = recipeIngredients.map(i => i.toLowerCase());
  
  let matchCount = 0;
  
  required.forEach(ingredient => {
    const hasMatch = available.some(available => 
      ingredient.includes(available) || 
      available.includes(ingredient) ||
      // Check for partial matches
      ingredient.split(' ').some(word => available.includes(word)) ||
      available.some(avail => ingredient.includes(avail))
    );
    
    if (hasMatch) {
      matchCount++;
    }
  });
  
  return Math.round((matchCount / required.length) * 100);
};

// Find missing ingredients
const findMissingIngredients = (recipeIngredients: string[], availableIngredients: string[]): string[] => {
  const available = availableIngredients.map(i => i.toLowerCase());
  
  return recipeIngredients.filter(ingredient => {
    const lowerIngredient = ingredient.toLowerCase();
    return !available.some(available => 
      lowerIngredient.includes(available) || 
      available.includes(lowerIngredient) ||
      lowerIngredient.split(' ').some(word => available.includes(word))
    );
  });
};

// Main recipe generation function
export const generateRecipes = (
  availableIngredients: string[],
  maxRecipes: number = 8,
  minMatchPercentage: number = 30
): GeneratedRecipe[] => {
  console.log('🍳 Generating recipes for ingredients:', availableIngredients);
  
  const generatedRecipes: GeneratedRecipe[] = [];
  
  RECIPE_DATABASE.forEach(recipe => {
    const matchPercentage = calculateMatchPercentage(recipe.usedIngredients, availableIngredients);
    const missingIngredients = findMissingIngredients(recipe.usedIngredients, availableIngredients);
    
    if (matchPercentage >= minMatchPercentage) {
      generatedRecipes.push({
        ...recipe,
        matchPercentage,
        missingIngredients
      });
    }
  });
  
  // Sort by match percentage (highest first) and take top results
  const sortedRecipes = generatedRecipes
    .sort((a, b) => {
      // Primary sort: match percentage
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      // Secondary sort: fewer missing ingredients
      return a.missingIngredients.length - b.missingIngredients.length;
    })
    .slice(0, maxRecipes);
  
  console.log('🎯 Generated recipes:', sortedRecipes.map(r => 
    `${r.name} (${r.matchPercentage}% match, ${r.missingIngredients.length} missing)`
  ));
  
  return sortedRecipes;
};

// Generate recipes based on dietary preferences
export const generateRecipesByDiet = (
  availableIngredients: string[],
  dietaryPreferences: string[] = [],
  maxRecipes: number = 8
): GeneratedRecipe[] => {
  let filteredDatabase = RECIPE_DATABASE;
  
  // Filter based on dietary preferences
  if (dietaryPreferences.includes('vegetarian')) {
    filteredDatabase = filteredDatabase.filter(recipe => 
      !recipe.usedIngredients.some(ingredient => 
        ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon'].includes(ingredient.toLowerCase())
      )
    );
  }
  
  if (dietaryPreferences.includes('vegan')) {
    filteredDatabase = filteredDatabase.filter(recipe => 
      !recipe.usedIngredients.some(ingredient => 
        ['egg', 'cheese', 'milk', 'butter', 'yogurt', 'chicken', 'beef', 'pork', 'turkey', 'fish'].includes(ingredient.toLowerCase())
      )
    );
  }
  
  if (dietaryPreferences.includes('low-carb')) {
    filteredDatabase = filteredDatabase.filter(recipe => 
      !recipe.usedIngredients.some(ingredient => 
        ['rice', 'pasta', 'bread', 'flour', 'potato'].includes(ingredient.toLowerCase())
      )
    );
  }
  
  // Generate recipes from filtered database
  const generatedRecipes: GeneratedRecipe[] = [];
  
  filteredDatabase.forEach(recipe => {
    const matchPercentage = calculateMatchPercentage(recipe.usedIngredients, availableIngredients);
    const missingIngredients = findMissingIngredients(recipe.usedIngredients, availableIngredients);
    
    if (matchPercentage >= 30) {
      generatedRecipes.push({
        ...recipe,
        matchPercentage,
        missingIngredients
      });
    }
  });
  
  return generatedRecipes
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, maxRecipes);
};

// Get recipe suggestions for meal planning
export const getRecipesForMealPlan = (
  availableIngredients: string[],
  mealType: 'Breakfast' | 'Lunch' | 'Dinner'
): GeneratedRecipe[] => {
  let suitableRecipes: string[] = [];
  
  switch (mealType) {
    case 'Breakfast':
      suitableRecipes = ['Egg Bowl', 'Cheese Omelette', 'Fluffy Pancakes', 'Apple Cinnamon Smoothie'];
      break;
    case 'Lunch':
      suitableRecipes = ['Fresh Garden Salad', 'Grilled Cheese Sandwich', 'Chicken Caesar Salad', 'Tomato Basil Pasta'];
      break;
    case 'Dinner':
      suitableRecipes = ['Vegetable Stir Fry', 'Tomato Basil Pasta', 'Mushroom Risotto', 'Chicken Caesar Salad'];
      break;
  }
  
  const filteredDatabase = RECIPE_DATABASE.filter(recipe => 
    suitableRecipes.includes(recipe.name)
  );
  
  const generatedRecipes: GeneratedRecipe[] = [];
  
  filteredDatabase.forEach(recipe => {
    const matchPercentage = calculateMatchPercentage(recipe.usedIngredients, availableIngredients);
    const missingIngredients = findMissingIngredients(recipe.usedIngredients, availableIngredients);
    
    generatedRecipes.push({
      ...recipe,
      matchPercentage,
      missingIngredients
    });
  });
  
  return generatedRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
};

// Get shopping list from missing ingredients
export const generateShoppingList = (recipes: GeneratedRecipe[]): string[] => {
  const allMissing = recipes.flatMap(recipe => recipe.missingIngredients);
  return [...new Set(allMissing)].sort();
};

export default generateRecipes;