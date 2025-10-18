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

// Local recipe generation with Pexels images (optimized with priority loading)
export const generateRecipesWithImages = async (
  availableIngredients: string[] | undefined | null,
  maxRecipes: number = 8,
  minMatchPercentage: number = 30,
  priorityCount: number = 3 // Only fetch first N images immediately
): Promise<GeneratedRecipe[]> => {
  const recipes = generateRecipes(availableIngredients, maxRecipes, minMatchPercentage);
  
  // Split recipes into priority (first 3) and lazy load (rest)
  const priorityRecipes = recipes.slice(0, priorityCount);
  const lazyRecipes = recipes.slice(priorityCount);
  
  // Fetch images for priority recipes immediately
  const recipesWithPriorityImages = await Promise.all(
    priorityRecipes.map(async (recipe) => {
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

  // Return priority recipes immediately with placeholders for lazy recipes
  const recipesWithPlaceholders = [
    ...recipesWithPriorityImages,
    ...lazyRecipes.map(recipe => ({
      ...recipe,
      image: recipe.image && !recipe.image.startsWith('figma:') ? recipe.image : 'placeholder',
      _imageLoading: true
    }))
  ];

  // Lazy load remaining images in the background (non-blocking)
  setTimeout(async () => {
    const lazyImages = await Promise.all(
      lazyRecipes.map(async (recipe) => {
        try {
          if (recipe.image && !recipe.image.startsWith('figma:')) {
            return recipe.image;
          }
          return await fetchFoodImage(cleanRecipeNameForSearch(recipe.name), 'landscape');
        } catch (error) {
          console.error(`Failed to fetch lazy image for ${recipe.name}:`, error);
          return recipe.image;
        }
      })
    );
    // Images are cached, so next re-render will use them
    console.log(`✅ Lazy loaded ${lazyImages.length} additional recipe images`);
  }, 100);

  return recipesWithPlaceholders;
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
    // Shortened, more concise prompt for faster response
    const prompt = `Generate ${maxRecipes} recipes using: ${availableIngredients.join(", ")}. Return JSON only:
{"recipes":[{"name":"Recipe Name","image":"placeholder.jpg","time":"20 min","difficulty":"Easy","calories":300,"nutritionBenefits":"Brief benefit","usedIngredients":["ing1","ing2"],"ingredients":["1 cup ing1"],"instructions":[{"title":"Step 1","detail":"Instructions"}]}]}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 1500, // Reduced from 2000 for faster response
        temperature: 0.8 // Slightly increased for more creativity with shorter prompt
      }),
      signal: AbortSignal.timeout(15000) // 15 second timeout to prevent hanging
    });

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

    // Fetch images for first 3 recipes immediately, lazy-load rest
    const priorityCount = 3;
    const priorityRecipes = validRecipes.slice(0, priorityCount);
    const lazyRecipes = validRecipes.slice(priorityCount);

    // Fetch priority images immediately
    const recipesWithPriorityImages = await Promise.all(
      priorityRecipes.map(async (recipe) => {
        try {
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

    // Add lazy recipes with placeholders
    const recipesWithImages = [
      ...recipesWithPriorityImages,
      ...lazyRecipes.map(recipe => ({ ...recipe, _imageLoading: true }))
    ];

    // Lazy load remaining images in background
    setTimeout(async () => {
      await Promise.all(
        lazyRecipes.map(async (recipe) => {
          try {
            await fetchFoodImage(cleanRecipeNameForSearch(recipe.name), 'landscape');
          } catch (error) {
            console.error(`Failed to lazy load image for ${recipe.name}:`, error);
          }
        })
      );
      console.log(`✅ Lazy loaded ${lazyRecipes.length} additional OpenAI recipe images`);
    }, 100);

    // Filter similar recipes to keep at most 2 per similarity group
    const filteredRecipes = filterSimilarRecipes(recipesWithImages, 0.8, 2);

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
  maxRecipes: number = 8,
  minMatchPercentage: number = 30,
  onProgress?: (stage: string, percent: number) => void
): Promise<GeneratedRecipe[]> => {
  try {
    if (apiKey) {
      onProgress?.('Generating recipes with AI...', 20);
      const openAiRecipes = await generateRecipesOpenAI(
        Array.isArray(availableIngredients) ? availableIngredients : [],
        apiKey,
        maxRecipes
      );
      if (openAiRecipes.length > 0) {
        onProgress?.('Recipes generated!', 100);
        return openAiRecipes;
      }
      console.warn('OpenAI recipe generation returned no valid recipes, falling back to local generation');
    }
    onProgress?.('Fetching recipe images...', 50);
    const recipes = await generateRecipesWithImages(availableIngredients, maxRecipes, minMatchPercentage);
    onProgress?.('Complete!', 100);
    return recipes;
  } catch (error) {
    console.error('Recipe generation error:', error);
    onProgress?.('Error occurred, using fallback...', 60);
    // Fallback to local generation without images on error
    return generateRecipes(availableIngredients, maxRecipes, minMatchPercentage);
  }
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
