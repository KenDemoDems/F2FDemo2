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
      { title: "Cook vegetables", detail: "Add harder vegetables first (carrots, broccoli), then softer ones. Stir-fry for 3-5 minutes until crisp-tender." },
      { title: "Add sauce", detail: "Pour in soy sauce, oyster sauce, and cornstarch mixture. Stir until sauce thickens." },
      { title: "Serve", detail: "Garnish with green onions and serve hot over rice if desired." }
    ]
  },
  // Add more recipes here if you have them from the full database
];

// Helper function to calculate match percentage
function calculateMatchPercentage(recipeIngredients: string[], availableIngredients: string[]): number {
  const availableLower = new Set(availableIngredients.map(i => i.toLowerCase()));
  const matching = recipeIngredients.filter(ing => availableLower.has(ing.toLowerCase()));
  return Math.round((matching.length / (recipeIngredients.length || 1)) * 100);
}

// Helper function to find missing ingredients
function findMissingIngredients(recipeIngredients: string[], availableIngredients: string[]): string[] {
  const availableLower = new Set(availableIngredients.map(i => i.toLowerCase()));
  return recipeIngredients.filter(ing => !availableLower.has(ing.toLowerCase()));
}

// Local recipe generation based on ingredient matching
export const generateRecipes = (
  availableIngredients: string[] | undefined | null,
  maxRecipes: number = 8,
  minMatchPercentage: number = 30
): GeneratedRecipe[] => {
  if (!Array.isArray(availableIngredients) || availableIngredients.length === 0) return [];

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

  return generatedRecipes
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, maxRecipes);
};

// OpenAI-powered recipe generation
export const generateRecipesOpenAI = async (
  availableIngredients: string[],
  apiKey: string,
  maxRecipes: number = 8
): Promise<GeneratedRecipe[]> => {
  // Defensive: Ensure availableIngredients is an array
  if (!Array.isArray(availableIngredients) || availableIngredients.length === 0) return [];
  try {
    const prompt = `Suggest ${maxRecipes} creative recipes primarily using these ingredients: ${availableIngredients.join(", ")}. 
    Prioritize recipes that use as many of the provided ingredients as possible, but you can suggest minor additional common pantry items if needed.
    For each recipe, provide exactly these fields:
    - name: string (recipe title)
    - image: string (use a placeholder like 'placeholder.jpg')
    - time: string (e.g., '20 min')
    - difficulty: string (e.g., 'Easy')
    - calories: number (approximate total calories)
    - nutritionBenefits: string (brief benefits, e.g., 'High in protein')
    - usedIngredients: string[] (array of ingredients from the provided list that are used)
    - ingredients: string[] (full list of ingredients with quantities)
    - instructions: Array<{title: string, detail: string}> (step-by-step instructions as array of objects)
    
    Output only a valid JSON object with a key "recipes" containing an array of these objects. No extra text.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Valid, cost-effective model with JSON support
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 2000, // Increased for detailed responses
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(text);
    let recipes: GeneratedRecipe[] = parsed.recipes || [];

    // Post-process to add matchPercentage and missingIngredients
    recipes = recipes.map((recipe: any) => ({
      ...recipe,
      matchPercentage: calculateMatchPercentage(recipe.usedIngredients, availableIngredients),
      missingIngredients: findMissingIngredients(recipe.ingredients, availableIngredients) // Assuming ingredients is the full list
    }));

    return recipes.slice(0, maxRecipes);
  } catch (error) {
    console.error('OpenAI recipe generation failed:', error);
    return [];
  }
};

// Smart recipe generation: uses OpenAI if API key is present, otherwise local
export const generateRecipesSmart = async (
  availableIngredients: string[] | undefined | null,
  apiKey?: string,
  maxRecipes: number = 8,
  minMatchPercentage: number = 30
): Promise<GeneratedRecipe[]> => {
  if (apiKey) {
    return await generateRecipesOpenAI(Array.isArray(availableIngredients) ? availableIngredients : [], apiKey, maxRecipes);
  }
  return generateRecipes(availableIngredients, maxRecipes, minMatchPercentage);
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