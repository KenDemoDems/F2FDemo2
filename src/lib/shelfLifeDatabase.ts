// Shelf Life Database for Common Ingredients
// Data based on USDA FoodKeeper guidelines and food safety standards

export const SHELF_LIFE_DAYS: Record<string, number> = {
  // DAIRY & EGGS (7-60 days)
  'egg': 21,
  'duck egg': 21,
  'quail egg': 21,
  'milk': 7,
  'soy milk': 7,
  'almond milk': 10,
  'oat milk': 7,
  'butter': 60,
  'vegan butter': 60,
  'margarine': 60,
  'cheese': 21,
  'vegan cheese': 14,
  'yogurt': 10,
  'cream': 7,
  'sour cream': 10,
  'cottage cheese': 10,
  'whipping cream': 7,
  'heavy cream': 7,
  'cream cheese': 10,
  'paneer': 7,
  'ricotta': 7,
  'mozzarella': 10,
  'parmesan': 30,
  'feta': 7,
  'goat cheese': 7,
  'swiss cheese': 21,
  'cheddar cheese': 21,
  'gouda': 21,
  'provolone': 21,
  'brie': 7,
  'camembert': 7,

  // MEAT & POULTRY (2-7 days refrigerated)
  'chicken': 2,
  'chicken breast': 2,
  'chicken thigh': 2,
  'whole chicken': 2,
  'ground chicken': 2,
  'beef': 3,
  'beef steak': 3,
  'ground beef': 2,
  'beef ribs': 3,
  'pork': 3,
  'pork chop': 3,
  'ground pork': 2,
  'pork belly': 3,
  'bacon': 7,
  'ham': 7,
  'lamb chop': 3,
  'ground lamb': 2,
  'duck meat': 3,
  'turkey': 2,
  'turkey meat': 3,

  // SEAFOOD (2-5 days)
  'fish': 2,
  'fish fillet': 2,
  'salmon': 2,
  'smoked salmon': 5,
  'tuna': 2,
  'tilapia': 2,
  'cod': 2,
  'anchovy': 7,
  'sardine': 7,
  'shrimp': 2,
  'squid': 2,
  'crab': 3,
  'lobster': 3,
  'clam': 2,
  'clam meat': 3,
  'mussels': 2,
  'scallop': 3,
  'sea cucumber': 3,
  'crayfish': 3,

  // TOFU & SOY PRODUCTS (5-7 days)
  'tofu': 5,
  'tempeh': 7,

  // GRAINS & RICE (999 days for dry, 7 days for cooked)
  'rice': 999,
  'brown rice': 999,
  'jasmine rice': 999,
  'basmati rice': 999,
  'barley': 999,
  'corn': 7,
  'oats': 90,
  'pasta': 365,

  // FLOUR & BAKING (180 days)
  'flour': 180,
  'wheat flour': 180,
  'corn flour': 180,
  'all purpose flour': 180,
  'bread flour': 180,
  'whole wheat flour': 180,
  'bread': 7,

  // ROOT VEGETABLES (14-60 days)
  'potato': 30,
  'sweet potato': 30,
  'carrot': 14,
  'beetroot': 14,
  'turnip': 14,
  'radish': 10,
  'onion': 30,
  'garlic': 60,
  'ginger': 30,

  // LEAFY GREENS & HERBS (3-14 days)
  'leek': 7,
  'celery': 7,
  'cabbage': 14,
  'lettuce': 5,
  'spinach': 3,
  'kale': 5,
  'bok choy': 5,
  'parsley': 5,
  'cilantro': 5,
  'basil': 5,
  'mint': 5,
  'rosemary': 14,
  'thyme': 14,
  'oregano': 14,
  'sage': 10,
  'chives': 5,
  'dill': 5,
  'tarragon': 7,
  'marjoram': 7,
  'curry leaves': 7,
  'green onion': 7,
  'spring onion': 7,
  'lime leaves': 10,
  'lemongrass': 14,

  // CRUCIFEROUS & OTHER VEGETABLES (5-14 days)
  'broccoli': 5,
  'cauliflower': 5,
  'zucchini': 7,
  'eggplant': 5,
  'cucumber': 7,
  'bell pepper': 7,
  'chili pepper': 14,
  'green beans': 7,
  'peas': 7,
  'asparagus': 5,
  'okra': 5,
  'snow peas': 5,
  'pumpkin': 30,
  'chayote': 7,
  'bitter gourd': 5,
  'tomato': 5,
  'cherry tomato': 7,
  'mushroom': 5,

  // FRUITS (5-30 days)
  'avocado': 5,
  'apple': 30,
  'pear': 14,
  'banana': 5,
  'mango': 7,
  'pineapple': 5,
  'watermelon': 7,
  'cantaloupe': 7,
  'honeydew': 7,
  'grapes': 7,
  'berries': 5,
  'strawberry': 5,
  'blueberry': 10,
  'raspberry': 5,
  'blackberry': 5,
  'cherry': 7,
  'orange': 14,
  'lemon': 14,
  'lime': 14,
  'papaya': 5,
  'kiwi': 7,
  'guava': 7,
  'passion fruit': 10,
  'dragon fruit': 7,
  'pomegranate': 30,
  'coconut': 30,

  // SPICES & DRY SEASONINGS (180-999 days)
  'bay leaf': 90,
  'cinnamon': 180,
  'cinnamon stick': 180,
  'cinnamon powder': 180,
  'turmeric': 30,
  'ground turmeric': 180,
  'cumin': 180,
  'coriander': 180,
  'cardamom': 180,
  'clove': 180,
  'star anise': 180,
  'nutmeg': 180,
  'paprika': 180,
  'black pepper': 999,
  'white pepper': 999,
  'chili flakes': 180,
  'chili powder': 180,
  'curry powder': 180,
  'garlic powder': 180,
  'onion powder': 180,
  'mustard seed': 180,
  'fennel seed': 180,
  'fenugreek': 180,
  'anise': 180,
  'saffron': 180,

  // SWEETENERS & BASIC SEASONINGS (365-999 days)
  'salt': 999,
  'sugar': 365,
  'brown sugar': 365,
  'honey': 999,
  'molasses': 180,

  // CONDIMENTS & SAUCES (30-365 days)
  'vinegar': 365,
  'soy sauce': 90,
  'fish sauce': 90,
  'oyster sauce': 60,
  'worcestershire sauce': 90,
  'ketchup': 60,
  'mustard': 60,
  'mayonnaise': 30,
  'bbq sauce': 60,
  'hot sauce': 90,

  // OILS & FATS (120-180 days)
  'sesame oil': 120,
  'olive oil': 120,
  'vegetable oil': 180,
  'canola oil': 180,
  'corn oil': 180,
  'sunflower oil': 180,
  'coconut oil': 180,

  // NUT BUTTERS & SPREADS (60 days)
  'peanut butter': 60,
  'almond butter': 60,
  'tahini': 60,

  // SEEDS & NUTS (60-180 days)
  'toasted sesame seeds': 60,
  'chia seeds': 180,
  'flax seeds': 180,
  'pumpkin seeds': 180,
  'sunflower seeds': 180,
  'cashew': 180,
  'almond': 180,
  'peanut': 180,
  'pistachio': 180,
  'walnut': 180,
  'hazelnut': 180,
  'macadamia': 180,
  'chestnut': 30,

  // DRIED FRUITS (180 days)
  'raisin': 180,
  'dried apricot': 180,
  'dried fig': 180,
  'dried mango': 180,
  'dried banana': 180,
  'dried cranberry': 180,
  'dried date': 180,

  // ASIAN INGREDIENTS (30-90 days)
  'seaweed': 60,
  'toasted nori': 60,
  'miso paste': 90,
  'kimchi': 30,
  'sauerkraut': 30,
  'pickles': 60,
};

/**
 * Calculate expiry date and days left for an ingredient
 * @param ingredientName - Name of the ingredient
 * @param addedDate - Date when ingredient was added (defaults to now)
 * @returns Object containing expiry date and days remaining
 */
export const calculateExpiryDate = (
  ingredientName: string, 
  addedDate: Date = new Date()
): { expiryDate: Date; daysLeft: number; shelfLife: number } => {
  const lowerName = ingredientName.toLowerCase().trim();
  
  // Try exact match first
  let shelfLifeDays = SHELF_LIFE_DAYS[lowerName];
  
  // Try partial match if no exact match found
  if (!shelfLifeDays) {
    const matchedKey = Object.keys(SHELF_LIFE_DAYS).find(key => 
      lowerName.includes(key) || key.includes(lowerName)
    );
    shelfLifeDays = matchedKey ? SHELF_LIFE_DAYS[matchedKey] : 14; // Default: 2 weeks
  }
  
  // Calculate expiry date
  const expiryDate = new Date(addedDate);
  expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);
  
  // Calculate days left (normalized to midnight for accurate day counting)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryMidnight = new Date(expiryDate);
  expiryMidnight.setHours(0, 0, 0, 0);
  
  const daysLeft = Math.ceil((expiryMidnight.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return { 
    expiryDate, 
    daysLeft: Math.max(0, daysLeft), // Never negative
    shelfLife: shelfLifeDays 
  };
};

/**
 * Get shelf life category for an ingredient
 * @param daysLeft - Days until expiry
 * @returns Urgency category
 */
export const getUrgencyLevel = (daysLeft: number): 'critical' | 'urgent' | 'warning' | 'normal' => {
  if (daysLeft <= 1) return 'critical';
  if (daysLeft <= 3) return 'urgent';
  if (daysLeft <= 7) return 'warning';
  return 'normal';
};

/**
 * Get recommended storage type for an ingredient
 * @param ingredientName - Name of the ingredient
 * @returns Storage recommendation
 */
export const getStorageRecommendation = (ingredientName: string): 'refrigerated' | 'frozen' | 'pantry' => {
  const lowerName = ingredientName.toLowerCase();
  
  // Proteins and most fresh items need refrigeration
  const refrigerated = ['chicken', 'beef', 'fish', 'milk', 'cheese', 'yogurt', 'egg', 'butter',
                        'lettuce', 'spinach', 'mushroom', 'basil', 'tomato', 'cucumber', 
                        'broccoli', 'carrot', 'celery'];
  
  // Pantry items
  const pantry = ['rice', 'pasta', 'flour', 'sugar', 'salt', 'bread', 'onion', 'potato', 
                  'garlic', 'oil', 'honey', 'vinegar'];
  
  if (refrigerated.some(item => lowerName.includes(item))) return 'refrigerated';
  if (pantry.some(item => lowerName.includes(item))) return 'pantry';
  
  return 'refrigerated'; // Default to refrigerated for safety
};

/**
 * Check if ingredient should be in database but isn't
 * @param ingredientName - Name of the ingredient
 * @returns Whether ingredient was found in database
 */
export const isKnownIngredient = (ingredientName: string): boolean => {
  const lowerName = ingredientName.toLowerCase();
  return Object.keys(SHELF_LIFE_DAYS).some(key => 
    lowerName === key || lowerName.includes(key) || key.includes(lowerName)
  );
};

/**
 * Get storage tips for an ingredient
 * @param ingredientName - Name of the ingredient
 * @returns Storage tip or null
 */
export const getStorageTip = (ingredientName: string): string | null => {
  const tips: Record<string, string> = {
    'banana': 'Keep separate from other fruits - produces ethylene gas',
    'apple': 'Store in crisper drawer, produces ethylene',
    'lettuce': 'Keep in crisper drawer, away from ethylene-producing fruits',
    'mushroom': 'Store in paper bag, not plastic',
    'tomato': 'Store at room temp for best flavor',
    'potato': 'Store in cool, dark place. Keep away from onions',
    'onion': 'Store in cool, dry place. Keep away from potatoes',
    'bread': 'Freeze for long-term storage (refrigeration causes staleness)',
    'basil': 'Store stems in water like flowers',
    'chicken': 'CRITICAL: Keep at 40°F or below, freeze if not using within 2 days',
    'beef': 'Store on bottom shelf to prevent cross-contamination',
    'fish': 'Use within 1-2 days or freeze immediately',
  };
  
  const lowerName = ingredientName.toLowerCase();
  const matchedKey = Object.keys(tips).find(key => lowerName.includes(key));
  return matchedKey ? tips[matchedKey] : null;
};

export default {
  SHELF_LIFE_DAYS,
  calculateExpiryDate,
  getUrgencyLevel,
  getStorageRecommendation,
  isKnownIngredient,
  getStorageTip
};
