// Google Vision API Integration for Ingredient Detection
import { uploadImageToStorage } from './firebase';
import { getEnvVar } from './env';
import ImageAnnotatorClient from '@google-cloud/vision';

// Types for Google Vision API
interface VisionLabel {
  description: string;
  score: number;
  confidence: number;
}

interface VisionResponse {
  labelAnnotations?: VisionLabel[];
  localizedObjectAnnotations?: {
    name: string;
    score: number;
    boundingPoly?: {
      normalizedVertices?: { x: number; y: number }[];
    };
  }[];
  textAnnotations?: {
    description: string;
    score?: number;
  }[];
}

interface DetectedIngredient {
  name: string;
  confidence: number;
  category: string;
  detectionMethod?: string;
}

// Comprehensive ingredient database with aliases and variations
const INGREDIENT_DATABASE = {
  // Herbs & Leafy Greens
  basil: {
    aliases: ['basil', 'sweet basil', 'thai basil', 'holy basil', 'basil leaf', 'basil leaves', 'fresh basil'],
    category: 'herbs'
  },
  parsley: {
    aliases: ['parsley', 'italian parsley', 'flat leaf parsley', 'curly parsley', 'fresh parsley'],
    category: 'herbs'
  },
  cilantro: {
    aliases: ['cilantro', 'coriander', 'coriander leaf', 'fresh coriander', 'chinese parsley'],
    category: 'herbs'
  },
  mint: {
    aliases: ['mint', 'peppermint', 'spearmint', 'fresh mint', 'mint leaf'],
    category: 'herbs'
  },

  // Spices & Seasonings (small ingredients)
  garlic: {
    aliases: ['garlic', 'garlic clove', 'fresh garlic', 'minced garlic', 'garlic bulb', 'allium'],
    category: 'spices'
  },
  'garlic powder': {
    aliases: ['garlic powder', 'dried garlic', 'garlic seasoning'],
    category: 'spices'
  },
  ginger: {
    aliases: ['ginger', 'fresh ginger', 'ginger root', 'gingerroot'],
    category: 'spices'
  },
  'onion powder': {
    aliases: ['onion powder', 'dried onion', 'onion seasoning'],
    category: 'spices'
  },
  paprika: {
    aliases: ['paprika', 'sweet paprika', 'smoked paprika', 'hungarian paprika'],
    category: 'spices'
  },
  cumin: {
    aliases: ['cumin', 'cumin seed', 'ground cumin', 'jeera'],
    category: 'spices'
  },
  turmeric: {
    aliases: ['turmeric', 'turmeric powder', 'haldi', 'ground turmeric'],
    category: 'spices'
  },
  cinnamon: {
    aliases: ['cinnamon', 'cinnamon stick', 'ground cinnamon', 'ceylon cinnamon'],
    category: 'spices'
  },
  'black pepper': {
    aliases: ['black pepper', 'pepper', 'peppercorn', 'ground pepper', 'cracked pepper'],
    category: 'spices'
  },
  salt: {
    aliases: ['salt', 'sea salt', 'table salt', 'kosher salt', 'himalayan salt', 'rock salt'],
    category: 'spices'
  },
  'chili powder': {
    aliases: ['chili powder', 'chilli powder', 'red chili', 'cayenne', 'red pepper'],
    category: 'spices'
  },
  oregano: {
    aliases: ['oregano', 'dried oregano', 'fresh oregano', 'mexican oregano'],
    category: 'spices'
  },
  thyme: {
    aliases: ['thyme', 'fresh thyme', 'dried thyme', 'thyme sprig'],
    category: 'spices'
  },
  rosemary: {
    aliases: ['rosemary', 'fresh rosemary', 'dried rosemary', 'rosemary sprig'],
    category: 'spices'
  },

  // Vegetables
  tomato: {
    aliases: ['tomato', 'tomatoes', 'cherry tomato', 'grape tomato', 'roma tomato', 'plum tomato', 'beefsteak tomato', 'heirloom tomato', 'vine tomato'],
    category: 'vegetables'
  },
  onion: {
    aliases: ['onion', 'onions', 'yellow onion', 'white onion', 'red onion', 'sweet onion', 'vidalia onion', 'sliced onion', 'diced onion'],
    category: 'vegetables'
  },
  potato: {
    aliases: ['potato', 'potatoes', 'russet potato', 'red potato', 'yukon gold', 'sweet potato', 'new potato'],
    category: 'vegetables'
  },
  carrot: {
    aliases: ['carrot', 'carrots', 'baby carrot', 'carrot stick'],
    category: 'vegetables'
  },
  celery: {
    aliases: ['celery', 'celery stalk', 'celery stick'],
    category: 'vegetables'
  },
  lettuce: {
    aliases: ['lettuce', 'romaine', 'iceberg lettuce', 'butter lettuce', 'green leaf lettuce'],
    category: 'vegetables'
  },
  spinach: {
    aliases: ['spinach', 'baby spinach', 'fresh spinach', 'spinach leaf'],
    category: 'vegetables'
  },
  broccoli: {
    aliases: ['broccoli', 'broccoli floret', 'broccoli crown'],
    category: 'vegetables'
  },
  cauliflower: {
    aliases: ['cauliflower', 'cauliflower floret', 'white cauliflower'],
    category: 'vegetables'
  },
  'bell pepper': {
    aliases: ['bell pepper', 'pepper', 'sweet pepper', 'red pepper', 'green pepper', 'yellow pepper', 'orange pepper', 'capsicum'],
    category: 'vegetables'
  },
  cucumber: {
    aliases: ['cucumber', 'english cucumber', 'persian cucumber', 'pickling cucumber'],
    category: 'vegetables'
  },
  mushroom: {
    aliases: ['mushroom', 'button mushroom', 'portobello', 'shiitake', 'cremini', 'white mushroom'],
    category: 'vegetables'
  },
  corn: {
    aliases: ['corn', 'sweet corn', 'corn kernel', 'corn cob', 'maize'],
    category: 'vegetables'
  },
  zucchini: {
    aliases: ['zucchini', 'courgette', 'summer squash'],
    category: 'vegetables'
  },
  eggplant: {
    aliases: ['eggplant', 'aubergine', 'japanese eggplant', 'chinese eggplant'],
    category: 'vegetables'
  },

  // Fruits
  apple: {
    aliases: ['apple', 'apples', 'red apple', 'green apple', 'granny smith', 'fuji apple', 'gala apple'],
    category: 'fruits'
  },
  banana: {
    aliases: ['banana', 'bananas', 'plantain'],
    category: 'fruits'
  },
  orange: {
    aliases: ['orange', 'oranges', 'navel orange', 'blood orange', 'mandarin', 'tangerine'],
    category: 'fruits'
  },
  lemon: {
    aliases: ['lemon', 'lemons', 'meyer lemon', 'lemon wedge', 'lemon slice'],
    category: 'fruits'
  },
  lime: {
    aliases: ['lime', 'limes', 'key lime', 'persian lime', 'lime wedge'],
    category: 'fruits'
  },

  // Grains & Pasta
  pasta: {
    aliases: ['pasta', 'spaghetti', 'penne', 'fettuccine', 'linguine', 'rigatoni', 'macaroni', 'fusilli', 'angel hair', 'noodle', 'noodles'],
    category: 'grains'
  },
  rice: {
    aliases: ['rice', 'white rice', 'brown rice', 'jasmine rice', 'basmati rice', 'wild rice', 'arborio rice'],
    category: 'grains'
  },
  bread: {
    aliases: ['bread', 'loaf', 'baguette', 'sourdough', 'whole wheat bread', 'white bread'],
    category: 'grains'
  },

  // Oils & Liquids
  'olive oil': {
    aliases: ['olive oil', 'extra virgin olive oil', 'evoo', 'virgin olive oil'],
    category: 'condiments'
  },
  'vegetable oil': {
    aliases: ['vegetable oil', 'cooking oil', 'canola oil', 'sunflower oil'],
    category: 'condiments'
  },
  water: {
    aliases: ['water', 'drinking water', 'filtered water', 'h2o'],
    category: 'other'
  },

  // Dairy
  cheese: {
    aliases: ['cheese', 'parmesan', 'mozzarella', 'cheddar', 'feta', 'goat cheese', 'blue cheese', 'brie', 'swiss cheese', 'grated cheese', 'shredded cheese'],
    category: 'dairy'
  },
  milk: {
    aliases: ['milk', 'whole milk', 'skim milk', '2% milk', 'almond milk', 'soy milk'],
    category: 'dairy'
  },
  butter: {
    aliases: ['butter', 'unsalted butter', 'salted butter', 'clarified butter'],
    category: 'dairy'
  },

  // Proteins
  chicken: {
    aliases: ['chicken', 'chicken breast', 'chicken thigh', 'chicken wing', 'poultry'],
    category: 'proteins'
  },
  beef: {
    aliases: ['beef', 'ground beef', 'steak', 'beef roast', 'brisket'],
    category: 'proteins'
  },
  egg: {
    aliases: ['egg', 'eggs', 'chicken egg', 'whole egg', 'beaten egg'],
    category: 'proteins'
  }
};

// Terms to completely ignore (too generic or non-food)
const IGNORE_TERMS = [
  'food', 'ingredient', 'dish', 'meal', 'cuisine', 'recipe', 'cooking',
  'fresh', 'organic', 'natural', 'healthy', 'produce', 'grocery',
  'vegetable', 'fruit', 'meat', 'dairy', 'grain', 'spice', 'condiment',
  'leaf vegetable', 'whole food', 'plant', 'staple food', 'vegan',
  'container', 'bottle', 'package', 'jar', 'can', 'box', 'wrapper',
  'tableware', 'dishware', 'kitchen', 'refrigerator', 'shelf', 'storage',
  'bowl', 'plate', 'cutting board', 'knife', 'wood', 'table', 'surface'
];

// Enhanced matching function with fuzzy matching
const matchIngredient = (detectedText: string): string | null => {
  const lowerText = detectedText.toLowerCase().trim();

  // Ignore generic terms
  if (IGNORE_TERMS.some(term => lowerText === term)) {
    return null;
  }

  // Try exact match first
  for (const [ingredient, data] of Object.entries(INGREDIENT_DATABASE)) {
    if (data.aliases.some(alias => lowerText === alias)) {
      return ingredient;
    }
  }

  // Try partial match with word boundaries
  const words = lowerText.split(/[\s,.-]+/).filter(w => w.length > 2);

  for (const [ingredient, data] of Object.entries(INGREDIENT_DATABASE)) {
    for (const alias of data.aliases) {
      // Check if any word matches the alias
      if (words.some(word => word === alias || alias.includes(word) || word.includes(alias))) {
        return ingredient;
      }

      // Check if the full text contains the alias
      if (lowerText.includes(alias)) {
        return ingredient;
      }
    }
  }

  return null;
};

// Get ingredient category
const getIngredientCategory = (ingredient: string): string => {
  return INGREDIENT_DATABASE[ingredient as keyof typeof INGREDIENT_DATABASE]?.category || 'other';
};

// Advanced visual analysis for small ingredients
const detectSmallIngredients = (visionResponse: VisionResponse): Set<string> => {
  const smallIngredients = new Set<string>();
  const smallIngredientKeywords = ['garlic', 'herb', 'spice', 'seasoning', 'leaf', 'green', 'fresh'];

  // Analyze labels for small ingredient indicators
  if (visionResponse.labelAnnotations) {
    visionResponse.labelAnnotations.forEach(label => {
      const desc = label.description.toLowerCase();

      // If we detect keywords suggesting small ingredients, try to identify them
      if (smallIngredientKeywords.some(kw => desc.includes(kw))) {
        const matched = matchIngredient(desc);
        if (matched) {
          smallIngredients.add(matched);
        }
      }
    });
  }

  return smallIngredients;
};

// Context-aware ingredient detection
const analyzeIngredientContext = (visionResponse: VisionResponse): Map<string, number> => {
  const contextScores = new Map<string, number>();

  // Build context from all detections
  const allDetections: string[] = [];

  if (visionResponse.labelAnnotations) {
    allDetections.push(...visionResponse.labelAnnotations.map(l => l.description.toLowerCase()));
  }
  if (visionResponse.localizedObjectAnnotations) {
    allDetections.push(...visionResponse.localizedObjectAnnotations.map(o => o.name.toLowerCase()));
  }
  if (visionResponse.textAnnotations && visionResponse.textAnnotations.length > 0) {
    allDetections.push(...visionResponse.textAnnotations.slice(1).map(t => t.description.toLowerCase()));
  }

  // Look for cooking-related context
  const cookingContext = allDetections.some(d =>
    d.includes('cooking') || d.includes('kitchen') || d.includes('recipe') ||
    d.includes('food') || d.includes('ingredient')
  );

  // Boost scores for ingredients that appear in cooking context
  if (cookingContext) {
    for (const detection of allDetections) {
      const matched = matchIngredient(detection);
      if (matched) {
        contextScores.set(matched, (contextScores.get(matched) || 0) + 0.1);
      }
    }
  }

  return contextScores;
};

// Main processing function with multi-method detection
const processVisionResults = (visionResponse: VisionResponse): DetectedIngredient[] => {
  const detectedIngredients = new Map<string, DetectedIngredient>();

  console.log('🔍 Starting Enhanced Vision API Processing...');
  console.log('📊 Raw Data:', {
    labels: visionResponse.labelAnnotations?.length || 0,
    objects: visionResponse.localizedObjectAnnotations?.length || 0,
    text: visionResponse.textAnnotations?.length || 0
  });

  // Get context analysis
  const contextScores = analyzeIngredientContext(visionResponse);

  // METHOD 1: TEXT DETECTION (Priority: Highest for packaged/labeled items)
  if (visionResponse.textAnnotations && visionResponse.textAnnotations.length > 1) {
    console.log('📝 Processing TEXT_DETECTION...');

    // Skip first annotation (full text block)
    for (let i = 1; i < visionResponse.textAnnotations.length; i++) {
      const text = visionResponse.textAnnotations[i].description;
      const matched = matchIngredient(text);

      if (matched && !detectedIngredients.has(matched)) {
        const baseConfidence = 0.80;
        const contextBoost = contextScores.get(matched) || 0;

        detectedIngredients.set(matched, {
          name: matched.charAt(0).toUpperCase() + matched.slice(1),
          confidence: Math.min(0.95, baseConfidence + contextBoost),
          category: getIngredientCategory(matched),
          detectionMethod: 'TEXT'
        });
        console.log(`✅ TEXT: ${matched} (${text})`);
      }
    }
  }

  // METHOD 2: OBJECT LOCALIZATION (Priority: High for visible items)
  if (visionResponse.localizedObjectAnnotations) {
    console.log('🎯 Processing OBJECT_LOCALIZATION...');

    visionResponse.localizedObjectAnnotations.forEach(obj => {
      const matched = matchIngredient(obj.name);
      const confidence = obj.score || 0;

      if (matched && confidence >= 0.55) {
        if (!detectedIngredients.has(matched)) {
          const contextBoost = contextScores.get(matched) || 0;

          detectedIngredients.set(matched, {
            name: matched.charAt(0).toUpperCase() + matched.slice(1),
            confidence: Math.min(0.95, confidence + contextBoost),
            category: getIngredientCategory(matched),
            detectionMethod: 'OBJECT'
          });
          console.log(`✅ OBJECT: ${matched} (${obj.name}, ${confidence.toFixed(2)})`);
        } else {
          // Boost existing detection
          const existing = detectedIngredients.get(matched)!;
          existing.confidence = Math.min(0.98, existing.confidence + 0.1);
          console.log(`📈 OBJECT boosted: ${matched}`);
        }
      } else if (matched) {
        console.log(`⚠️ OBJECT low confidence: ${matched} (${confidence.toFixed(2)})`);
      }
    });
  }

  // METHOD 3: LABEL DETECTION (Priority: Medium for general identification)
  if (visionResponse.labelAnnotations) {
    console.log('🏷️ Processing LABEL_DETECTION...');

    visionResponse.labelAnnotations.forEach(label => {
      const matched = matchIngredient(label.description);
      const confidence = label.score || 0;

      if (matched && confidence >= 0.60) {
        if (!detectedIngredients.has(matched)) {
          const contextBoost = contextScores.get(matched) || 0;

          detectedIngredients.set(matched, {
            name: matched.charAt(0).toUpperCase() + matched.slice(1),
            confidence: Math.min(0.90, confidence + contextBoost),
            category: getIngredientCategory(matched),
            detectionMethod: 'LABEL'
          });
          console.log(`✅ LABEL: ${matched} (${label.description}, ${confidence.toFixed(2)})`);
        } else {
          // Boost existing detection
          const existing = detectedIngredients.get(matched)!;
          existing.confidence = Math.min(0.98, existing.confidence + 0.05);
          console.log(`📈 LABEL boosted: ${matched}`);
        }
      }
    });
  }

  // METHOD 4: Small ingredient detection
  console.log('🔬 Analyzing for small ingredients...');
  const smallIngredients = detectSmallIngredients(visionResponse);
  smallIngredients.forEach(ingredient => {
    if (!detectedIngredients.has(ingredient)) {
      detectedIngredients.set(ingredient, {
        name: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
        confidence: 0.70,
        category: getIngredientCategory(ingredient),
        detectionMethod: 'CONTEXT'
      });
      console.log(`✅ CONTEXT: ${ingredient}`);
    }
  });

  const results = Array.from(detectedIngredients.values());

  console.log('📊 Final Results:', {
    totalDetected: results.length,
    byMethod: {
      TEXT: results.filter(r => r.detectionMethod === 'TEXT').length,
      OBJECT: results.filter(r => r.detectionMethod === 'OBJECT').length,
      LABEL: results.filter(r => r.detectionMethod === 'LABEL').length,
      CONTEXT: results.filter(r => r.detectionMethod === 'CONTEXT').length
    },
    ingredients: results.map(r => `${r.name} (${r.detectionMethod}, ${(r.confidence * 100).toFixed(0)}%)`)
  });

  return results.sort((a, b) => b.confidence - a.confidence);
};

// Main image analysis function
export const analyzeImageWithGoogleVision = async (
  file: File,
  userId: string
): Promise<{ ingredients: DetectedIngredient[], error: string | null }> => {
  try {
    const apiKey = getEnvVar('VITE_GOOGLE_VISION_API_KEY');

    if (!apiKey || apiKey === 'demo-google-vision-key') {
      console.log('🔧 Google Vision API not configured, using demo data');
      throw new Error('Google Cloud Vision API key not configured');
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const visionRequest = {
      requests: [
        {
          image: { content: base64 },
          features: [
            { type: 'TEXT_DETECTION', maxResults: 100 },
            { type: 'OBJECT_LOCALIZATION', maxResults: 100 },
            { type: 'LABEL_DETECTION', maxResults: 100 }
          ],
          imageContext: {
            languageHints: ['en']
          }
        }
      ]
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visionRequest)
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Vision API error: ${response.status} ${response.statusText} - ${text}`);
    }

    const data = await response.json();

    if (data.responses && data.responses[0]) {
      const visionResponse = data.responses[0];
      const ingredients = processVisionResults(visionResponse);

      return { ingredients, error: null };
    } else {
      throw new Error('No response from Vision API');
    }
  } catch (error: any) {
    console.error('❌ Google Vision API Error:', error);

    // Enhanced demo data
    const mockIngredients: DetectedIngredient[] = [
      { name: 'Pasta', confidence: 0.95, category: 'grains', detectionMethod: 'DEMO' },
      { name: 'Tomato', confidence: 0.92, category: 'vegetables', detectionMethod: 'DEMO' },
      { name: 'Basil', confidence: 0.88, category: 'herbs', detectionMethod: 'DEMO' },
      { name: 'Garlic', confidence: 0.85, category: 'spices', detectionMethod: 'DEMO' },
      { name: 'Onion', confidence: 0.82, category: 'vegetables', detectionMethod: 'DEMO' },
      { name: 'Olive oil', confidence: 0.80, category: 'condiments', detectionMethod: 'DEMO' },
      { name: 'Black pepper', confidence: 0.75, category: 'spices', detectionMethod: 'DEMO' },
      { name: 'Cheese', confidence: 0.72, category: 'dairy', detectionMethod: 'DEMO' }
    ];

    return {
      ingredients: mockIngredients,
      error: `Vision API Error (using demo data): ${error.message}`
    };
  }
};

// Alternative function using blob URL for faster processing
export const analyzeImageBlob = async (
  blob: Blob,
  userId: string
): Promise<{ ingredients: DetectedIngredient[], error: string | null }> => {
  const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
  return analyzeImageWithGoogleVision(file, userId);
};

// Function to re-analyze stored image
export const reAnalyzeStoredImage = async (
  imageUrl: string,
  userId: string
): Promise<{ ingredients: DetectedIngredient[], error: string | null }> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return analyzeImageBlob(blob, userId);
  } catch (error: any) {
    return { ingredients: [], error: error.message };
  }
};

// Utility function to validate if detected ingredient is food-related
export const isValidFoodIngredient = (ingredient: string): boolean => {
  return ingredient.toLowerCase() in INGREDIENT_DATABASE;
};

// Function to suggest missing ingredients based on recipe requirements
export const findMissingIngredients = (
  recipeIngredients: string[],
  availableIngredients: string[]
): string[] => {
  const available = availableIngredients.map(i => i.toLowerCase());
  return recipeIngredients.filter(ingredient => {
    const lowerIngredient = ingredient.toLowerCase();
    return !available.some(available =>
      lowerIngredient.includes(available) || available.includes(lowerIngredient)
    );
  });
};

export default analyzeImageWithGoogleVision;
