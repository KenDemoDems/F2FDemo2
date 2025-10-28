import { Recipe } from './firebase';
import { fetchFoodImage, cleanRecipeNameForSearch } from './pexelsService';

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
];

// Helper function to calculate Jaccard similarity between two ingredient lists
function calculateRecipeSimilarity(ingredients1: string[], ingredients2: string[]): number {
  const set1 = new Set(ingredients1.map(i => i.toLowerCase()));
  const set2 = new Set(ingredients2.map(i => i.toLowerCase()));
  const intersection = new Set([...set1].filter(i => set2.has(i)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

// Helper function to filter similar recipes
function filterSimilarRecipes(recipes: GeneratedRecipe[], similarityThreshold: number = 0.8, maxSimilar: number = 2): GeneratedRecipe[] {
  const selectedRecipes: GeneratedRecipe[] = [];
  const usedIngredientsSets: Set<string>[] = [];

  // Sort by matchPercentage to prioritize better matches
  const sortedRecipes = [...recipes].sort((a, b) => b.matchPercentage - a.matchPercentage);

  for (const recipe of sortedRecipes) {
    const currentIngredientsSet = new Set(recipe.usedIngredients.map(i => i.toLowerCase()));
    let isSimilar = false;

    // Check if recipe is similar to any already selected recipe
    for (let i = 0; i < usedIngredientsSets.length; i++) {
      const similarity = calculateRecipeSimilarity(
        Array.from(currentIngredientsSet),
        Array.from(usedIngredientsSets[i])
      );
      if (similarity >= similarityThreshold) {
        // Count how many similar recipes are already selected
        const similarCount = usedIngredientsSets.filter((set, idx) => {
          const sim = calculateRecipeSimilarity(
            Array.from(currentIngredientsSet),
            Array.from(set)
          );
          return sim >= similarityThreshold;
        }).length;
        if (similarCount < maxSimilar) {
          selectedRecipes.push(recipe);
          usedIngredientsSets.push(currentIngredientsSet);
        }
        isSimilar = true;
        break;
      }
    }

    // If not similar to any selected recipe, add it
    if (!isSimilar) {
      selectedRecipes.push(recipe);
      usedIngredientsSets.push(currentIngredientsSet);
    }
  }

  return selectedRecipes;
}

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

  // Filter similar recipes to keep at most 2 per similarity group
  const filteredRecipes = filterSimilarRecipes(generatedRecipes, 0.8, 2);

  return filteredRecipes
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, maxRecipes);
};

// Local recipe generation with Pexels images
export const generateRecipesWithImages = async (
  availableIngredients: string[] | undefined | null,
  maxRecipes: number = 8,
  minMatchPercentage: number = 30
): Promise<GeneratedRecipe[]> => {
  const recipes = generateRecipes(availableIngredients, maxRecipes, minMatchPercentage);

  // Fetch images from Pexels for each recipe
  const recipesWithImages = await Promise.all(
    recipes.map(async (recipe) => {
      try {
        // Skip if recipe already has a valid image URL (not a figma asset)
        if (recipe.image && !recipe.image.startsWith('figma:')) {
          return recipe;
        }
        const imageUrl = await fetchFoodImage(cleanRecipeNameForSearch(recipe.name), 'landscape');
        return {
          ...recipe,
          image: imageUrl
        };
      } catch (error) {
        console.error(`Failed to fetch image for ${recipe.name}:`, error);
        return recipe;
      }
    })
  );

  return recipesWithImages;
};

// OpenAI-powered recipe generation
export const generateRecipesOpenAI = async (
  availableIngredients: string[],
  apiKey: string,
  maxRecipes: number = 6 // 6 recipes for 8-12 second generation
): Promise<GeneratedRecipe[]> => {
  // Defensive: Ensure availableIngredients is an array
  if (!Array.isArray(availableIngredients) || availableIngredients.length === 0) return [];
  
  const startTime = performance.now();
  console.log(`⏱️ Starting OpenAI recipe generation for ${maxRecipes} recipes...`);
  
  try {
    const prompt = `Create ${maxRecipes} recipes using: ${availableIngredients.join(", ")}. 

JSON format: {"recipes": [...]}
Each recipe:
- name: string
- image: "placeholder.jpg"  
- time: string (e.g., "20 min")
- difficulty: "Easy"|"Medium"|"Hard"
- calories: number
- nutritionBenefits: string
- usedIngredients: string[]
- ingredients: string[] (with amounts)
- instructions: [{title: string, detail: string}] (3-4 steps)`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // FASTEST model tested
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1400, // Enough for 4 recipes
        temperature: 0.5 // Lower = faster generation
      })
    });
    
    const apiTime = performance.now() - startTime;
    console.log(`⏱️ OpenAI API responded in ${(apiTime / 1000).toFixed(2)} seconds`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      console.error('OpenAI API returned empty content');
      return [];
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response:', text);
      return [];
    }

    const recipes: GeneratedRecipe[] = parsed.recipes || [];
    if (!Array.isArray(recipes)) {
      console.error('OpenAI response "recipes" is not an array:', parsed);
      return [];
    }

    // Validate and post-process recipes
    const validRecipes = recipes
      .filter(recipe => {
        const isValid = recipe.name && recipe.time && recipe.difficulty && typeof recipe.calories === 'number' &&
          recipe.nutritionBenefits && Array.isArray(recipe.usedIngredients) && Array.isArray(recipe.ingredients) &&
          Array.isArray(recipe.instructions) && recipe.instructions.every((inst: any) => inst.title && inst.detail);
        if (!isValid) {
          console.warn('Invalid recipe format:', recipe);
        }
        return isValid;
      })
      .map((recipe: any, index: number) => ({
        ...recipe,
        image: recipe.image || 'placeholder.jpg',
        matchPercentage: calculateMatchPercentage(recipe.usedIngredients, availableIngredients),
        missingIngredients: findMissingIngredients(recipe.ingredients, availableIngredients),
        id: recipe.id || `openai-recipe-${index}`
      }));

    // Fetch images from Pexels in parallel - NO timeout, maximum speed!
    console.log(`📸 Fetching Pexels images for ${validRecipes.length} recipes...`);
    const recipesWithImages = await Promise.all(
      validRecipes.map(async (recipe) => {
        try {
          const imageUrl = await fetchFoodImage(cleanRecipeNameForSearch(recipe.name), 'landscape');
          console.log(`✅ Pexels image loaded: "${recipe.name}"`);
          return {
            ...recipe,
            image: imageUrl
          };
        } catch (error) {
          // Fallback to Unsplash CDN on error
          console.warn(`⚠️ Pexels failed for "${recipe.name}", using Unsplash`);
          const fallbackId = ['wtmOw4XdZU8', 'ZuIDLSz3XLg', 'IGfIGP5ONV0', 'CLMpC9UhyTo', '4_jhDO54BYg', 'jpkfc5_d-DI'][Math.floor(Math.random() * 6)];
          return {
            ...recipe,
            image: `https://images.unsplash.com/photo-${fallbackId}?w=400&h=300&fit=crop&auto=format`
          };
        }
      })
    );
    
    console.log(`✅ All ${recipesWithImages.length} images ready`);

    // Filter similar recipes to keep at most 2 per similarity group
    const filteredRecipes = filterSimilarRecipes(recipesWithImages, 0.8, 2);

    const totalTime = performance.now() - startTime;
    console.log(`⏱️ Total generation time: ${(totalTime / 1000).toFixed(2)} seconds for ${filteredRecipes.length} recipes`);
    
    return filteredRecipes.slice(0, maxRecipes);
  } catch (error) {
    console.error('OpenAI recipe generation failed:', error);
    return [];
  }
};

// Smart recipe generation: uses OpenAI if API key is present, otherwise local
export const generateRecipesSmart = async (
  availableIngredients: string[] | undefined | null,
  apiKey?: string,
  maxRecipes: number = 6, // 6 recipes for optimal speed
  minMatchPercentage: number = 30
): Promise<GeneratedRecipe[]> => {
  if (apiKey) {
    const openAiRecipes = await generateRecipesOpenAI(
      Array.isArray(availableIngredients) ? availableIngredients : [],
      apiKey,
      maxRecipes
    );
    if (openAiRecipes.length > 0) {
      return openAiRecipes;
    }
    console.warn('OpenAI recipe generation returned no valid recipes, falling back to local generation');
  }
  return generateRecipesWithImages(availableIngredients, maxRecipes, minMatchPercentage);
};

// Batch recipe generation: Generates recipes in batches for faster perceived performance
// Returns a callback to get the next batch
export const generateRecipesInBatches = async (
  availableIngredients: string[],
  apiKey: string,
  batchSize: number = 4,
  totalBatches: number = 3
): Promise<{
  firstBatch: GeneratedRecipe[];
  getNextBatch: () => Promise<GeneratedRecipe[]>;
  allBatches: Promise<GeneratedRecipe[]>;
}> => {
  const allRecipes: GeneratedRecipe[] = [];
  let currentBatch = 0;

  // Generate first batch immediately
  console.log(`📦 Generating batch 1/${totalBatches} (${batchSize} recipes)...`);
  const firstBatch = await generateRecipesOpenAI(availableIngredients, apiKey, batchSize);
  allRecipes.push(...firstBatch);
  currentBatch++;

  // Function to get next batch
  const getNextBatch = async (): Promise<GeneratedRecipe[]> => {
    if (currentBatch >= totalBatches) {
      return [];
    }
    
    currentBatch++;
    console.log(`📦 Generating batch ${currentBatch}/${totalBatches} (${batchSize} recipes)...`);
    const batch = await generateRecipesOpenAI(availableIngredients, apiKey, batchSize);
    allRecipes.push(...batch);
    return batch;
  };

  // Promise for all remaining batches
  const allBatches = (async () => {
    const remainingBatches = totalBatches - 1;
    for (let i = 0; i < remainingBatches; i++) {
      await getNextBatch();
    }
    return allRecipes;
  })();

  return {
    firstBatch,
    getNextBatch,
    allBatches
  };
};

// Alternative: Generate recipes progressively with callback
export const generateRecipesProgressive = async (
  availableIngredients: string[],
  apiKey: string,
  totalRecipes: number = 12,
  batchSize: number = 4,
  onBatchComplete?: (batch: GeneratedRecipe[], batchNumber: number, totalBatches: number) => void
): Promise<GeneratedRecipe[]> => {
  const totalBatches = Math.ceil(totalRecipes / batchSize);
  const allRecipes: GeneratedRecipe[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const batchNumber = i + 1;
    console.log(`📦 Generating batch ${batchNumber}/${totalBatches}...`);
    
    const batch = await generateRecipesOpenAI(availableIngredients, apiKey, batchSize);
    allRecipes.push(...batch);
    
    // Call callback if provided
    if (onBatchComplete) {
      onBatchComplete(batch, batchNumber, totalBatches);
    }
  }

  return allRecipes;
};

// Generate recipes based on dietary preferences
export const generateRecipesByDiet = (
  availableIngredients: string[],
  dietaryPreferences: string[] = [],
  maxRecipes: number = 8
): GeneratedRecipe[] => {
  let filteredDatabase = RECIPE_DATABASE;

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

  // Filter similar recipes to keep at most 2 per similarity group
  const filteredRecipes = filterSimilarRecipes(generatedRecipes, 0.8, 2);

  return filteredRecipes
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

  // Filter similar recipes to keep at most 2 per similarity group
  const filteredRecipes = filterSimilarRecipes(generatedRecipes, 0.8, 2);

  return filteredRecipes.sort((a, b) => b.matchPercentage - a.matchPercentage);
};

// Get shopping list from missing ingredients
export const generateShoppingList = (recipes: GeneratedRecipe[]): string[] => {
  const allMissing = recipes.flatMap(recipe => recipe.missingIngredients);
  return [...new Set(allMissing)].sort();
};

export default generateRecipes;
