// Google Vision API Integration for Ingredient Detection
import { uploadImageToStorage } from './firebase';
import { getEnvVar } from './env';

// Types for Google Vision API
interface VisionLabel {
  description: string;
  score: number;
  confidence: number;
}

interface VisionResponse {
  labelAnnotations: VisionLabel[];
}

interface DetectedIngredient {
  name: string;
  confidence: number;
  category: string;
}

// Food-related keywords for filtering Vision API results
const FOOD_KEYWORDS = [
  // Fruits
  'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 
  'blackberry', 'cherry', 'peach', 'pear', 'plum', 'apricot', 'kiwi', 'mango', 
  'pineapple', 'watermelon', 'cantaloupe', 'honeydew', 'lemon', 'lime', 'grapefruit',
  
  // Vegetables
  'tomato', 'potato', 'onion', 'garlic', 'carrot', 'celery', 'lettuce', 'spinach',
  'broccoli', 'cauliflower', 'cabbage', 'pepper', 'cucumber', 'zucchini', 'eggplant',
  'mushroom', 'corn', 'peas', 'green bean', 'asparagus', 'artichoke', 'avocado',
  'radish', 'turnip', 'beet', 'sweet potato', 'squash', 'pumpkin',
  
  // Proteins
  'chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna', 'shrimp', 'crab',
  'lobster', 'egg', 'tofu', 'beans', 'lentils', 'chickpeas', 'nuts', 'almonds',
  'walnuts', 'peanuts', 'cashews', 'pistachios',
  
  // Dairy
  'milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese',
  'mozzarella', 'cheddar', 'parmesan', 'swiss', 'feta', 'goat cheese',
  
  // Grains & Bread
  'bread', 'rice', 'pasta', 'noodles', 'quinoa', 'oats', 'cereal', 'flour',
  'bagel', 'croissant', 'muffin', 'tortilla', 'crackers',
  
  // Herbs & Spices
  'basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro', 'dill', 'mint',
  'sage', 'bay leaf', 'ginger', 'turmeric', 'cumin', 'paprika', 'cinnamon',
  
  // Condiments & Oils
  'olive oil', 'vegetable oil', 'vinegar', 'soy sauce', 'hot sauce', 'ketchup',
  'mustard', 'mayonnaise', 'salad dressing', 'honey', 'maple syrup', 'jam',
  
  // Beverages
  'juice', 'wine', 'beer', 'coffee', 'tea', 'soda', 'water'
];

// Categories for ingredients
const INGREDIENT_CATEGORIES = {
  fruits: ['apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'cherry', 'peach', 'pear', 'mango', 'pineapple', 'watermelon', 'lemon', 'lime'],
  vegetables: ['tomato', 'potato', 'onion', 'garlic', 'carrot', 'celery', 'lettuce', 'spinach', 'broccoli', 'cauliflower', 'pepper', 'cucumber', 'mushroom', 'corn'],
  proteins: ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'egg', 'tofu', 'beans', 'nuts'],
  dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
  grains: ['bread', 'rice', 'pasta', 'quinoa', 'oats', 'cereal'],
  condiments: ['olive oil', 'vinegar', 'soy sauce', 'honey', 'jam']
};

// Get ingredient category
const getIngredientCategory = (ingredient: string): string => {
  const lowerIngredient = ingredient.toLowerCase();
  
  for (const [category, items] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (items.some(item => lowerIngredient.includes(item))) {
      return category;
    }
  }
  
  return 'other';
};

// Filter and process Vision API results to extract food ingredients
const processVisionResults = (visionResponse: VisionResponse): DetectedIngredient[] => {
  if (!visionResponse.labelAnnotations) {
    return [];
  }

  const detectedIngredients: DetectedIngredient[] = [];
  const processedNames = new Set<string>();

  visionResponse.labelAnnotations.forEach((label) => {
    const description = label.description.toLowerCase();
    const confidence = label.score || label.confidence || 0;

    // Check if the label matches any food keywords
    const matchedKeywords = FOOD_KEYWORDS.filter(keyword => 
      description.includes(keyword) || keyword.includes(description)
    );

    matchedKeywords.forEach(keyword => {
      // Avoid duplicates
      if (!processedNames.has(keyword)) {
        processedNames.add(keyword);
        
        detectedIngredients.push({
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          confidence: confidence,
          category: getIngredientCategory(keyword)
        });
      }
    });

    // Also check for direct food matches with high confidence
    if (confidence > 0.7 && FOOD_KEYWORDS.includes(description)) {
      const capitalizedName = description.charAt(0).toUpperCase() + description.slice(1);
      if (!processedNames.has(description)) {
        processedNames.add(description);
        
        detectedIngredients.push({
          name: capitalizedName,
          confidence: confidence,
          category: getIngredientCategory(description)
        });
      }
    }
  });

  // Sort by confidence and return top results
  return detectedIngredients
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 15); // Limit to top 15 ingredients
};

// Main function to analyze image with Google Vision API
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

    // Upload image to Firebase Storage first
    const uploadResult = await uploadImageToStorage(file, userId);
    if (uploadResult.error) {
      throw new Error(`Image upload failed: ${uploadResult.error}`);
    }

    // Convert file to base64 for Vision API
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // Prepare Vision API request
    const visionRequest = {
      requests: [
        {
          image: {
            content: base64
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 50
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 20
            }
          ]
        }
      ]
    };

    // Call Google Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visionRequest)
      }
    );

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.responses && data.responses[0]) {
      const visionResponse = data.responses[0];
      const ingredients = processVisionResults(visionResponse);
      
      console.log('🔍 Vision API Results:', {
        totalLabels: visionResponse.labelAnnotations?.length || 0,
        detectedIngredients: ingredients.length,
        ingredients: ingredients.map(i => `${i.name} (${Math.round(i.confidence * 100)}%)`)
      });

      return { ingredients, error: null };
    } else {
      throw new Error('No response from Vision API');
    }

  } catch (error: any) {
    console.error('❌ Google Vision API Error:', error);
    
    // Return mock data for development/demo purposes
    const mockIngredients: DetectedIngredient[] = [
      { name: 'Apple', confidence: 0.95, category: 'fruits' },
      { name: 'Tomato', confidence: 0.89, category: 'vegetables' },
      { name: 'Cheese', confidence: 0.82, category: 'dairy' },
      { name: 'Milk', confidence: 0.78, category: 'dairy' },
      { name: 'Bread', confidence: 0.74, category: 'grains' }
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
    // Fetch the image from URL
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return analyzeImageBlob(blob, userId);
  } catch (error: any) {
    return { ingredients: [], error: error.message };
  }
};

// Utility function to validate if detected ingredient is food-related
export const isValidFoodIngredient = (ingredient: string): boolean => {
  const lowerIngredient = ingredient.toLowerCase();
  return FOOD_KEYWORDS.some(keyword => 
    lowerIngredient.includes(keyword) || keyword.includes(lowerIngredient)
  );
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