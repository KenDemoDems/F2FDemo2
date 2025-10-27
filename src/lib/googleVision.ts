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
  detectionMethod?: 'TEXT' | 'OBJECT' | 'LABEL' | 'CONTEXT' | 'CONTAINER' | 'INFERRED' | 'DEMO';
  containerType?: 'jar' | 'can' | 'bottle' | 'box' | 'carton' | 'package' | 'fresh';
  quantity?: string;
  brand?: string;
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
  dill: {
    aliases: ['dill', 'dill weed', 'fresh dill', 'dill pickle'],
    category: 'herbs'
  },
  sage: {
    aliases: ['sage', 'fresh sage', 'dried sage', 'garden sage'],
    category: 'herbs'
  },
  chives: {
    aliases: ['chives', 'chive', 'fresh chives', 'garlic chives'],
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
    aliases: ['chili powder', 'chilli powder', 'red chili powder', 'cayenne powder', 'red pepper powder'],
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
  'bay leaf': {
    aliases: ['bay leaf', 'bay leaves', 'dried bay leaf', 'laurel leaf'],
    category: 'spices'
  },
  cardamom: {
    aliases: ['cardamom', 'cardamon', 'green cardamom', 'cardamom pod'],
    category: 'spices'
  },
  cloves: {
    aliases: ['cloves', 'clove', 'whole cloves', 'ground cloves'],
    category: 'spices'
  },
  nutmeg: {
    aliases: ['nutmeg', 'ground nutmeg', 'whole nutmeg'],
    category: 'spices'
  },
  coriander: {
    aliases: ['coriander seed', 'ground coriander', 'coriander powder'],
    category: 'spices'
  },
  'curry powder': {
    aliases: ['curry powder', 'curry', 'madras curry', 'curry seasoning'],
    category: 'spices'
  },

  // Vegetables (Fresh)
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
  asparagus: {
    aliases: ['asparagus', 'asparagus spear', 'green asparagus', 'white asparagus'],
    category: 'vegetables'
  },
  'green beans': {
    aliases: ['green beans', 'green bean', 'string beans', 'snap beans'],
    category: 'vegetables'
  },
  peas: {
    aliases: ['peas', 'green peas', 'garden peas', 'sweet peas', 'snap peas'],
    category: 'vegetables'
  },
  kale: {
    aliases: ['kale', 'curly kale', 'lacinato kale', 'dinosaur kale'],
    category: 'vegetables'
  },
  cabbage: {
    aliases: ['cabbage', 'green cabbage', 'red cabbage', 'napa cabbage'],
    category: 'vegetables'
  },
  'brussels sprouts': {
    aliases: ['brussels sprouts', 'brussel sprouts', 'brussels sprout'],
    category: 'vegetables'
  },
  radish: {
    aliases: ['radish', 'radishes', 'red radish', 'daikon'],
    category: 'vegetables'
  },
  'green onion': {
    aliases: ['green onion', 'green onions', 'scallion', 'scallions', 'spring onion'],
    category: 'vegetables'
  },
  arugula: {
    aliases: ['arugula', 'rocket', 'rocket salad', 'fresh arugula'],
    category: 'vegetables'
  },
  'mixed greens': {
    aliases: ['mixed greens', 'salad mix', 'spring mix', 'mesclun', 'salad greens'],
    category: 'vegetables'
  },

  // Canned/Jarred Vegetables
  pickles: {
    aliases: ['pickles', 'pickle', 'dill pickle', 'kosher pickle', 'bread and butter pickle', 'gherkin', 'pickled cucumber'],
    category: 'vegetables'
  },
  'canned tomatoes': {
    aliases: ['canned tomatoes', 'tinned tomatoes', 'diced tomatoes', 'crushed tomatoes', 'tomato puree', 'tomato paste'],
    category: 'vegetables'
  },
  'canned corn': {
    aliases: ['canned corn', 'tinned corn', 'sweet corn can'],
    category: 'vegetables'
  },
  olives: {
    aliases: ['olives', 'olive', 'black olives', 'green olives', 'kalamata', 'kalamata olives', 'stuffed olives'],
    category: 'vegetables'
  },
  'roasted peppers': {
    aliases: ['roasted peppers', 'roasted red peppers', 'jarred peppers', 'pimentos'],
    category: 'vegetables'
  },
  artichokes: {
    aliases: ['artichokes', 'artichoke', 'marinated artichokes', 'artichoke hearts'],
    category: 'vegetables'
  },

  // Fruits (Fresh)
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
  strawberry: {
    aliases: ['strawberry', 'strawberries', 'fresh strawberries'],
    category: 'fruits'
  },
  blueberry: {
    aliases: ['blueberry', 'blueberries', 'fresh blueberries'],
    category: 'fruits'
  },
  raspberry: {
    aliases: ['raspberry', 'raspberries', 'fresh raspberries'],
    category: 'fruits'
  },
  grapes: {
    aliases: ['grapes', 'grape', 'red grapes', 'green grapes', 'seedless grapes'],
    category: 'fruits'
  },
  watermelon: {
    aliases: ['watermelon', 'water melon', 'seedless watermelon'],
    category: 'fruits'
  },
  mango: {
    aliases: ['mango', 'mangoes', 'fresh mango', 'ripe mango'],
    category: 'fruits'
  },
  pineapple: {
    aliases: ['pineapple', 'fresh pineapple', 'pineapple chunks'],
    category: 'fruits'
  },
  peach: {
    aliases: ['peach', 'peaches', 'fresh peach', 'ripe peach'],
    category: 'fruits'
  },
  pear: {
    aliases: ['pear', 'pears', 'bartlett pear', 'anjou pear', 'bosc pear'],
    category: 'fruits'
  },
  avocado: {
    aliases: ['avocado', 'avocados', 'hass avocado', 'ripe avocado'],
    category: 'fruits'
  },

  // Canned/Jarred Fruits
  'canned peaches': {
    aliases: ['canned peaches', 'tinned peaches', 'peach can', 'peaches can'],
    category: 'fruits'
  },
  'canned pineapple': {
    aliases: ['canned pineapple', 'pineapple chunks', 'pineapple rings', 'tinned pineapple'],
    category: 'fruits'
  },
  'fruit cocktail': {
    aliases: ['fruit cocktail', 'mixed fruit', 'canned fruit mix'],
    category: 'fruits'
  },
  applesauce: {
    aliases: ['applesauce', 'apple sauce', 'unsweetened applesauce'],
    category: 'fruits'
  },
  jam: {
    aliases: ['jam', 'jelly', 'preserve', 'strawberry jam', 'grape jelly', 'marmalade'],
    category: 'condiments'
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
  flour: {
    aliases: ['flour', 'all purpose flour', 'wheat flour', 'bread flour', 'cake flour', 'white flour'],
    category: 'baking'
  },
  oats: {
    aliases: ['oats', 'oatmeal', 'rolled oats', 'quick oats', 'steel cut oats'],
    category: 'grains'
  },
  quinoa: {
    aliases: ['quinoa', 'white quinoa', 'red quinoa', 'tri-color quinoa'],
    category: 'grains'
  },
  couscous: {
    aliases: ['couscous', 'moroccan couscous', 'israeli couscous'],
    category: 'grains'
  },

  // Baking Ingredients
  sugar: {
    aliases: ['sugar', 'white sugar', 'granulated sugar', 'cane sugar', 'refined sugar'],
    category: 'baking'
  },
  'brown sugar': {
    aliases: ['brown sugar', 'light brown sugar', 'dark brown sugar'],
    category: 'baking'
  },
  'baking powder': {
    aliases: ['baking powder', 'baking soda', 'sodium bicarbonate'],
    category: 'baking'
  },
  yeast: {
    aliases: ['yeast', 'active dry yeast', 'instant yeast', 'bakers yeast'],
    category: 'baking'
  },
  vanilla: {
    aliases: ['vanilla', 'vanilla extract', 'pure vanilla', 'vanilla essence'],
    category: 'baking'
  },
  'cocoa powder': {
    aliases: ['cocoa powder', 'cocoa', 'dutch cocoa', 'unsweetened cocoa'],
    category: 'baking'
  },
  chocolate: {
    aliases: ['chocolate', 'chocolate chips', 'dark chocolate', 'milk chocolate', 'baking chocolate'],
    category: 'baking'
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
  'coconut oil': {
    aliases: ['coconut oil', 'virgin coconut oil', 'refined coconut oil'],
    category: 'condiments'
  },
  'sesame oil': {
    aliases: ['sesame oil', 'toasted sesame oil', 'asian sesame oil'],
    category: 'condiments'
  },
  vinegar: {
    aliases: ['vinegar', 'white vinegar', 'apple cider vinegar', 'balsamic vinegar', 'red wine vinegar'],
    category: 'condiments'
  },
  'soy sauce': {
    aliases: ['soy sauce', 'soya sauce', 'tamari', 'light soy sauce', 'dark soy sauce'],
    category: 'condiments'
  },
  'worcestershire sauce': {
    aliases: ['worcestershire sauce', 'worcestershire', 'lea perrins'],
    category: 'condiments'
  },
  'hot sauce': {
    aliases: ['hot sauce', 'tabasco', 'sriracha', 'chili sauce', 'pepper sauce'],
    category: 'condiments'
  },
  ketchup: {
    aliases: ['ketchup', 'catsup', 'tomato ketchup'],
    category: 'condiments'
  },
  mustard: {
    aliases: ['mustard', 'yellow mustard', 'dijon mustard', 'whole grain mustard'],
    category: 'condiments'
  },
  mayonnaise: {
    aliases: ['mayonnaise', 'mayo', 'real mayonnaise'],
    category: 'condiments'
  },
  water: {
    aliases: ['water', 'drinking water', 'filtered water', 'h2o', 'topo chico', 'sparkling water', 'mineral water'],
    category: 'beverages'
  },
  wine: {
    aliases: ['wine', 'red wine', 'white wine', 'rosé', 'rose wine', 'vino', 'chardonnay', 'cabernet', 'merlot', 'pinot'],
    category: 'beverages'
  },
  beer: {
    aliases: ['beer', 'lager', 'ale', 'ipa', 'craft beer', 'cerveza'],
    category: 'beverages'
  },
  juice: {
    aliases: ['juice', 'orange juice', 'apple juice', 'cranberry juice', 'grape juice', 'fruit juice'],
    category: 'beverages'
  },
  hummus: {
    aliases: ['hummus', 'houmous', 'humus', 'chickpea dip'],
    category: 'condiments'
  },
  guacamole: {
    aliases: ['guacamole', 'guac', 'avocado dip'],
    category: 'condiments'
  },
  pesto: {
    aliases: ['pesto', 'basil pesto', 'pesto sauce'],
    category: 'condiments'
  },
  'ranch dressing': {
    aliases: ['ranch', 'ranch dressing', 'ranch dip'],
    category: 'condiments'
  },

  // Canned Goods
  'canned beans': {
    aliases: ['canned beans', 'black beans', 'kidney beans', 'pinto beans', 'navy beans', 'cannellini beans', 'garbanzo beans', 'chickpeas'],
    category: 'legumes'
  },
  'canned soup': {
    aliases: ['canned soup', 'soup can', 'tomato soup', 'chicken soup', 'vegetable soup', 'cream of mushroom soup'],
    category: 'canned'
  },
  tuna: {
    aliases: ['tuna', 'canned tuna', 'tuna fish', 'albacore tuna', 'chunk light tuna'],
    category: 'proteins'
  },
  salmon: {
    aliases: ['salmon', 'canned salmon', 'pink salmon', 'red salmon'],
    category: 'proteins'
  },

  // Dairy & Eggs
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
  yogurt: {
    aliases: ['yogurt', 'yoghurt', 'greek yogurt', 'plain yogurt', 'vanilla yogurt'],
    category: 'dairy'
  },
  'sour cream': {
    aliases: ['sour cream', 'soured cream', 'crema'],
    category: 'dairy'
  },
  'cream cheese': {
    aliases: ['cream cheese', 'philadelphia', 'soft cheese'],
    category: 'dairy'
  },
  cream: {
    aliases: ['cream', 'heavy cream', 'whipping cream', 'double cream', 'half and half'],
    category: 'dairy'
  },
  egg: {
    aliases: ['egg', 'eggs', 'chicken egg', 'whole egg', 'beaten egg', 'egg carton', 'dozen eggs', 'half dozen'],
    category: 'proteins'
  },

  // Proteins
  chicken: {
    aliases: ['chicken', 'chicken breast', 'chicken thigh', 'chicken wing', 'poultry', 'rotisserie chicken'],
    category: 'proteins'
  },
  beef: {
    aliases: ['beef', 'ground beef', 'steak', 'beef roast', 'brisket', 'ribeye', 'sirloin'],
    category: 'proteins'
  },
  pork: {
    aliases: ['pork', 'pork chop', 'pork loin', 'pork shoulder', 'bacon', 'ham', 'sausage'],
    category: 'proteins'
  },
  turkey: {
    aliases: ['turkey', 'turkey breast', 'ground turkey', 'turkey leg'],
    category: 'proteins'
  },
  fish: {
    aliases: ['fish', 'white fish', 'cod', 'tilapia', 'halibut', 'sea bass'],
    category: 'proteins'
  },
  shrimp: {
    aliases: ['shrimp', 'prawns', 'jumbo shrimp', 'cocktail shrimp'],
    category: 'proteins'
  },
  tofu: {
    aliases: ['tofu', 'bean curd', 'silken tofu', 'firm tofu', 'extra firm tofu'],
    category: 'proteins'
  },

  // Nuts & Seeds
  almonds: {
    aliases: ['almonds', 'almond', 'sliced almonds', 'almond slivers'],
    category: 'nuts'
  },
  walnuts: {
    aliases: ['walnuts', 'walnut', 'walnut halves', 'chopped walnuts'],
    category: 'nuts'
  },
  peanuts: {
    aliases: ['peanuts', 'peanut', 'roasted peanuts', 'salted peanuts'],
    category: 'nuts'
  },
  'peanut butter': {
    aliases: ['peanut butter', 'peanutbutter', 'creamy peanut butter', 'crunchy peanut butter'],
    category: 'condiments'
  },
  cashews: {
    aliases: ['cashews', 'cashew', 'roasted cashews'],
    category: 'nuts'
  },
  'sunflower seeds': {
    aliases: ['sunflower seeds', 'sunflower seed', 'shelled sunflower seeds'],
    category: 'nuts'
  },
  'chia seeds': {
    aliases: ['chia seeds', 'chia seed'],
    category: 'nuts'
  },
  'flax seeds': {
    aliases: ['flax seeds', 'flaxseed', 'ground flaxseed'],
    category: 'nuts'
  },

  // International/Asian Ingredients
  'coconut milk': {
    aliases: ['coconut milk', 'coconut cream', 'canned coconut milk'],
    category: 'condiments'
  },
  'fish sauce': {
    aliases: ['fish sauce', 'nam pla', 'nuoc mam', 'asian fish sauce'],
    category: 'condiments'
  },
  'oyster sauce': {
    aliases: ['oyster sauce', 'oyster flavored sauce'],
    category: 'condiments'
  },
  miso: {
    aliases: ['miso', 'miso paste', 'white miso', 'red miso'],
    category: 'condiments'
  },
  'rice vinegar': {
    aliases: ['rice vinegar', 'rice wine vinegar', 'seasoned rice vinegar'],
    category: 'condiments'
  },
  'hoisin sauce': {
    aliases: ['hoisin sauce', 'hoisin', 'chinese barbecue sauce'],
    category: 'condiments'
  },
  tahini: {
    aliases: ['tahini', 'sesame paste', 'tahina'],
    category: 'condiments'
  },
  'tomato sauce': {
    aliases: ['tomato sauce', 'marinara', 'pasta sauce', 'spaghetti sauce'],
    category: 'condiments'
  },
  salsa: {
    aliases: ['salsa', 'salsa verde', 'pico de gallo', 'red salsa', 'jarred salsa'],
    category: 'condiments'
  },
  honey: {
    aliases: ['honey', 'raw honey', 'pure honey', 'wildflower honey'],
    category: 'condiments'
  },
  'maple syrup': {
    aliases: ['maple syrup', 'pure maple syrup', 'pancake syrup'],
    category: 'condiments'
  }
};

// Container type indicators
const CONTAINER_INDICATORS = {
  jar: ['jar', 'jarred', 'mason jar', 'glass jar', 'pickle jar', 'jam jar', 'preserve jar'],
  can: ['can', 'tin', 'canned', 'tinned', 'metal can', 'aluminum can', 'soup can'],
  bottle: ['bottle', 'bottled', 'glass bottle', 'plastic bottle', 'sauce bottle', 'oil bottle'],
  box: ['box', 'boxed', 'carton', 'package', 'packaged', 'pasta box', 'cereal box'],
  carton: ['carton', 'egg carton', 'egg tray', 'egg box', 'dozen eggs', 'half dozen', '6 pack', '12 pack', '18 pack'],
  package: ['package', 'pack', 'wrapped', 'packaging', 'sealed']
};

// Brand names to filter out (common food brands)
const BRAND_NAMES = [
  'kraft', 'heinz', 'nestle', 'campbells', 'dole', 'del monte', 'hunts',
  'progresso', 'chef boyardee', 'hormel', 'tyson', 'perdue', 'oscar mayer',
  'hellmanns', 'best foods', 'french', 'hidden valley', 'wishbone',
  'vlasic', 'claussen', 'mt olive', 'bubbies', 'kirkland', 'great value',
  'market pantry', 'simple truth', 'organic', '365', 'trader joe',
  'whole foods', 'safeway', 'kroger', 'albertsons', 'tacodeli', 'topo chico',
  'milko', 'kala', 'kitehill', 'kite hill', "rao's", 'raos', 'redhot', 'red hot',
  'horizon', 'culina', 'nopsa', 'vila', 'pasture', 'grassfed', 'elderbees'
];

// Terms to completely ignore (too generic or non-food)
const IGNORE_TERMS = [
  'food', 'ingredient', 'dish', 'meal', 'cuisine', 'recipe', 'cooking',
  'fresh', 'organic', 'natural', 'healthy', 'produce', 'grocery',
  'vegetable', 'fruit', 'meat', 'dairy', 'grain', 'spice', 'condiment',
  'leaf vegetable', 'whole food', 'plant', 'staple food', 'vegan',
  'tableware', 'dishware', 'kitchen', 'refrigerator', 'shelf', 'storage',
  'bowl', 'plate', 'cutting board', 'knife', 'wood', 'table', 'surface',
  'label', 'nutrition', 'calories', 'serving',
  // Additional brand/packaging terms
  'syrup', 'original', 'raised', 'broth', 'verded', 'arra', 'elderbes',
  'grassfed', 'pasture', 'while'
];

// Detect container type from text and labels
const detectContainerType = (allDetections: string[]): 'jar' | 'can' | 'bottle' | 'box' | 'carton' | 'package' | 'fresh' | null => {
  const detectionText = allDetections.join(' ').toLowerCase();
  
  // Check for specific container types with priority
  for (const [containerType, indicators] of Object.entries(CONTAINER_INDICATORS)) {
    if (indicators.some(indicator => detectionText.includes(indicator))) {
      return containerType as 'jar' | 'can' | 'bottle' | 'box' | 'carton' | 'package';
    }
  }
  
  // Check if it's a refrigerator/kitchen scene
  if (detectionText.includes('refrigerator') || detectionText.includes('fridge') || 
      detectionText.includes('shelf') || detectionText.includes('kitchen')) {
    return null; // Will analyze mixed containers
  }
  
  return 'fresh';
};

// Extract better text from labels - filter noise and brand names
const extractCleanText = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  
  // Remove brand names first
  let cleanText = lowerText;
  BRAND_NAMES.forEach(brand => {
    cleanText = cleanText.replace(new RegExp(brand, 'gi'), '');
  });
  
  // Split into words and filter
  return cleanText
    .split(/[\s,.-]+/)
    .filter(word => word.length > 2)
    .filter(word => !IGNORE_TERMS.includes(word));
};

// Improved: Check if text looks like a real ingredient vs. partial brand text
const isLikelyIngredient = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  
  // Too short or numbers only = likely noise
  if (text.length < 3 || /^\d+$/.test(text)) return false;
  
  // Check if it's in our database with fuzzy matching
  for (const [ingredient, data] of Object.entries(INGREDIENT_DATABASE)) {
    // Direct match or contains
    if (data.aliases.some(alias => {
      return lowerText === alias || 
             lowerText.includes(alias) || 
             alias.includes(lowerText) ||
             (lowerText.length > 3 && alias.length > 3 && 
              (lowerText.startsWith(alias.substring(0, 4)) || alias.startsWith(lowerText.substring(0, 4))))
    })) {
      return true;
    }
  }
  
  // If we can't find it in database, allow it through for further processing
  // The matchIngredient function will do the final filtering
  return true;
};

// Extract quantity information from text
const extractQuantity = (text: string): string | undefined => {
  const lowerText = text.toLowerCase();
  
  // Look for egg carton quantities
  const eggMatch = lowerText.match(/(\d+)\s*(pack|eggs?|count|ct)/i);
  if (eggMatch) return eggMatch[1] + ' eggs';
  
  // Look for standard quantities
  const quantityPatterns = [
    /(\d+\.?\d*)\s*(oz|ounce|ounces)/i,
    /(\d+\.?\d*)\s*(lb|lbs|pound|pounds)/i,
    /(\d+\.?\d*)\s*(g|gram|grams)/i,
    /(\d+\.?\d*)\s*(kg|kilogram|kilograms)/i,
    /(\d+\.?\d*)\s*(ml|milliliter|milliliters)/i,
    /(\d+\.?\d*)\s*(l|liter|liters)/i,
    /(\d+)\s*(pack|count|ct|piece|pieces)/i
  ];
  
  for (const pattern of quantityPatterns) {
    const match = text.match(pattern);
    if (match) return match[1] + match[2];
  }
  
  return undefined;
};

// Filter out brand names from detected text
const filterBrandNames = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  return !BRAND_NAMES.some(brand => lowerText.includes(brand));
};

// Enhanced matching function with container awareness
const matchIngredient = (detectedText: string, containerType?: string): string | null => {
  const lowerText = detectedText.toLowerCase().trim();

  // Ignore generic terms
  if (IGNORE_TERMS.some(term => lowerText === term)) {
    return null;
  }

  // Skip very short fragments
  if (lowerText.length < 4) { // Increased from 3 to 4
    return null;
  }
  
  // Filter out known brand names
  if (BRAND_NAMES.some(brand => lowerText.includes(brand) || brand.includes(lowerText))) {
    return null;
  }

  // Try exact match first (highest priority)
  for (const [ingredient, data] of Object.entries(INGREDIENT_DATABASE)) {
    if (data.aliases.some(alias => lowerText === alias)) {
      return ingredient;
    }
  }

  // Try full word match (medium priority)
  const words = lowerText.split(/[\s,.-]+/).filter(w => w.length > 3);

  for (const [ingredient, data] of Object.entries(INGREDIENT_DATABASE)) {
    for (const alias of data.aliases) {
      const aliasWords = alias.split(/[\s,.-]+/).filter(w => w.length > 3);
      
      // Exact word match - word from text matches word in alias
      if (words.some(word => aliasWords.includes(word))) {
        return ingredient;
      }
    }
  }

  // Try full contains match - THE TEXT must contain THE ALIAS (not the other way around!)
  // This prevents "SYRUP" from matching "peaches in syrup"
  for (const [ingredient, data] of Object.entries(INGREDIENT_DATABASE)) {
    for (const alias of data.aliases) {
      // The detected text must contain the full alias
      if (alias.length >= 5 && lowerText.includes(alias) && lowerText.length >= alias.length) {
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
  
  // Debug: Show what objects were detected
  if (visionResponse.localizedObjectAnnotations && visionResponse.localizedObjectAnnotations.length > 0) {
    console.log('🎯 Objects found:', visionResponse.localizedObjectAnnotations.map(o => `${o.name} (${(o.score || 0).toFixed(2)})`));
  } else {
    console.log('⚠️ No localized objects detected by Vision API');
  }

  // Build all detections for container analysis
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

  // Detect container type
  const containerType = detectContainerType(allDetections);
  console.log(`📦 Container Type Detected: ${containerType}`);

  // Get context analysis
  const contextScores = analyzeIngredientContext(visionResponse);

  // METHOD 1: TEXT DETECTION (Priority: Highest for packaged/labeled items)
  if (visionResponse.textAnnotations && visionResponse.textAnnotations.length > 1) {
    console.log('📝 Processing TEXT_DETECTION...');

    // Collect all text for quantity extraction
    const fullText = visionResponse.textAnnotations[0]?.description || '';
    console.log(`📄 Full text available: ${fullText.substring(0, 100)}...`);

    // First, check full text for multi-word ingredients (like "Topo Chico")
    const fullTextMatched = matchIngredient(fullText, containerType || undefined);
    if (fullTextMatched && !detectedIngredients.has(fullTextMatched)) {
      const baseConfidence = 0.85;
      const contextBoost = contextScores.get(fullTextMatched) || 0;
      const quantity = extractQuantity(fullText);

      detectedIngredients.set(fullTextMatched, {
        name: fullTextMatched.charAt(0).toUpperCase() + fullTextMatched.slice(1),
        confidence: Math.min(0.95, baseConfidence + contextBoost),
        category: getIngredientCategory(fullTextMatched),
        detectionMethod: 'TEXT',
        containerType: containerType || 'fresh',
        quantity: quantity
      });
      console.log(`✅ TEXT (full): ${fullTextMatched} (from full text) [${containerType}]`);
    }

    // Skip first annotation (full text block) and process individual text segments
    for (let i = 1; i < visionResponse.textAnnotations.length; i++) {
      const text = visionResponse.textAnnotations[i].description;
      
      // Skip very short text (likely noise or partial words)
      if (text.length < 3) {
        console.log(`⏭️ Skipped (too short): "${text}"`);
        continue;
      }
      
      const matched = matchIngredient(text, containerType || undefined);

      if (matched) {
        if (!detectedIngredients.has(matched)) {
          const baseConfidence = 0.80;
          const contextBoost = contextScores.get(matched) || 0;
          const quantity = extractQuantity(fullText);

          detectedIngredients.set(matched, {
            name: matched.charAt(0).toUpperCase() + matched.slice(1),
            confidence: Math.min(0.95, baseConfidence + contextBoost),
            category: getIngredientCategory(matched),
            detectionMethod: 'TEXT',
            containerType: containerType || 'fresh',
            quantity: quantity
          });
          console.log(`✅ TEXT: ${matched} (from: "${text}") [${containerType}]${quantity ? ` - ${quantity}` : ''}`);
        } else {
          console.log(`⏭️ Already detected: ${matched} (from: "${text}")`);
        }
      } else {
        console.log(`❌ No match: "${text}"`);
      }
    }
  }

  // METHOD 2: OBJECT LOCALIZATION (Priority: High for visible items)
  if (visionResponse.localizedObjectAnnotations) {
    console.log('🎯 Processing OBJECT_LOCALIZATION...');

    visionResponse.localizedObjectAnnotations.forEach(obj => {
      console.log(`🔎 Checking object: "${obj.name}" (confidence: ${(obj.score || 0).toFixed(2)})`);
      const matched = matchIngredient(obj.name, containerType || undefined);
      const confidence = obj.score || 0;

      if (matched && confidence >= 0.45) { // Lower threshold for objects
        if (!detectedIngredients.has(matched)) {
          const contextBoost = contextScores.get(matched) || 0;

          detectedIngredients.set(matched, {
            name: matched.charAt(0).toUpperCase() + matched.slice(1),
            confidence: Math.min(0.95, confidence + contextBoost + 0.10), // Boost for object detection
            category: getIngredientCategory(matched),
            detectionMethod: 'OBJECT',
            containerType: containerType || 'fresh'
          });
          console.log(`✅ OBJECT: ${matched} (${obj.name}, ${confidence.toFixed(2)}) [${containerType}]`);
        } else {
          // Boost existing detection
          const existing = detectedIngredients.get(matched)!;
          existing.confidence = Math.min(0.98, existing.confidence + 0.15);
          console.log(`📈 OBJECT boosted: ${matched} → ${(existing.confidence * 100).toFixed(0)}%`);
        }
      } else if (matched) {
        console.log(`⚠️ OBJECT low confidence: ${matched} (${confidence.toFixed(2)})`);
      }
    });
  }

  // METHOD 3: LABEL DETECTION (Priority: Medium for general identification)
  if (visionResponse.labelAnnotations) {
    console.log('🏷️ Processing LABEL_DETECTION...');

    // Smarter inference: Match what's visually present based on specific labels
    // Use high-level labels to infer what's commonly seen in those contexts
    const labelToIngredientMap: { [key: string]: string[] } = {
      'herb': ['parsley', 'cilantro', 'basil'],
      'fresh herbs': ['parsley', 'cilantro', 'basil'],
      'leafy vegetable': ['lettuce', 'spinach', 'mixed greens', 'kale', 'arugula'],
      'leafy green': ['lettuce', 'spinach', 'mixed greens', 'kale'],
      'salad greens': ['lettuce', 'mixed greens', 'arugula', 'spinach'],
      'leaf vegetable': ['lettuce', 'spinach', 'mixed greens', 'kale'],
      'berry': ['strawberry', 'blueberry', 'raspberry', 'blackberry'],
      'berries': ['strawberry', 'blueberry', 'raspberry'],
      'citrus': ['lemon', 'orange', 'lime'],
      'citrus fruit': ['lemon', 'orange', 'lime'],
      'egg': ['eggs'],
      'eggs': ['eggs'],
      'produce': ['lettuce', 'mixed greens', 'cucumber', 'bell pepper', 'cherry tomatoes', 'herbs', 'cabbage'],
      'vegetable': ['lettuce', 'cucumber', 'bell pepper', 'mixed greens', 'cabbage'],
      'condiment': ['mustard', 'ketchup', 'hot sauce', 'mayonnaise', 'ranch dressing'],
      'sauce': ['hot sauce', 'soy sauce', 'worcestershire sauce', 'salsa'],
      'bottle': ['wine', 'olive oil', 'vinegar', 'soy sauce', 'hot sauce'],
      'jar': ['pickles', 'olives', 'jam', 'salsa'],
      'beverage': ['wine', 'water', 'juice'],
      'drink': ['wine', 'water', 'juice'],
      'alcohol': ['wine', 'beer'],
      'wine': ['wine'],
      'food storage': ['lettuce', 'mixed greens', 'berries', 'herbs', 'prepared salad', 'cabbage'],
      'refrigerator': ['eggs', 'milk', 'butter', 'cheese', 'yogurt', 'wine', 'water'],
      'food': ['lettuce', 'eggs', 'cheese', 'herbs', 'berries', 'mixed greens', 'cucumber', 'bell pepper', 'wine', 'cabbage']
    };

    visionResponse.labelAnnotations.forEach(label => {
      const lowerLabel = label.description.toLowerCase();
      console.log(`🔎 Checking label: "${label.description}" (confidence: ${(label.score || 0).toFixed(2)})`);
      
      // Try direct match first
      const matched = matchIngredient(label.description, containerType || undefined);
      const confidence = label.score || 0;

      if (matched && confidence >= 0.55) {
        if (!detectedIngredients.has(matched)) {
          const contextBoost = contextScores.get(matched) || 0;

          detectedIngredients.set(matched, {
            name: matched.charAt(0).toUpperCase() + matched.slice(1),
            confidence: Math.min(0.92, confidence + contextBoost + 0.05),
            category: getIngredientCategory(matched),
            detectionMethod: 'LABEL',
            containerType: containerType || 'fresh'
          });
          console.log(`✅ LABEL: ${matched} (${label.description}, ${confidence.toFixed(2)}) [${containerType}]`);
        } else {
          const existing = detectedIngredients.get(matched)!;
          existing.confidence = Math.min(0.98, existing.confidence + 0.08);
          console.log(`📈 LABEL boosted: ${matched} → ${(existing.confidence * 100).toFixed(0)}%`);
        }
      } else if (matched) {
        console.log(`⚠️ LABEL low confidence: ${matched} (${label.description}, ${confidence.toFixed(2)})`);
      }
      
      // If no objects detected, infer ingredients from visual category labels
      // Use moderate threshold and smart limits based on what's visually likely
      if (!visionResponse.localizedObjectAnnotations || visionResponse.localizedObjectAnnotations.length === 0) {
        if (confidence >= 0.50) {
          for (const [labelKey, ingredients] of Object.entries(labelToIngredientMap)) {
            if (lowerLabel.includes(labelKey)) {
              // Smart limits: generic labels get fewer items, specific labels get more
              const maxItems = labelKey === 'food' ? 10 : // Very generic, but high confidence - increased to 10
                               labelKey.includes('refrigerator') ? 7 : // Increased for wine/water
                               labelKey.includes('produce') || labelKey.includes('vegetable') ? 5 : // Increased for cabbage
                               labelKey.includes('leafy') || labelKey.includes('salad') ? 5 :
                               labelKey.includes('berry') || labelKey.includes('herb') ? 4 :
                               labelKey.includes('bottle') || labelKey.includes('jar') ? 5 :
                               labelKey.includes('beverage') || labelKey.includes('drink') || labelKey.includes('alcohol') || labelKey === 'wine' ? 3 : 3;
              
              ingredients.slice(0, maxItems).forEach(ing => {
                if (!detectedIngredients.has(ing)) {
                  detectedIngredients.set(ing, {
                    name: ing.charAt(0).toUpperCase() + ing.slice(1),
                    confidence: Math.min(0.70, confidence - 0.15),
                    category: getIngredientCategory(ing),
                    detectionMethod: 'INFERRED',
                    containerType: 'fresh'
                  });
                  console.log(`💡 INFERRED from label "${label.description}": ${ing}`);
                }
              });
              break; // Only match one category per label
            }
          }
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
        detectionMethod: 'CONTEXT',
        containerType: 'fresh'
      });
      console.log(`✅ CONTEXT: ${ingredient}`);
    }
  });

  // METHOD 5: Container-specific detection (jars, cans, egg cartons)
  console.log('📦 Analyzing containers...');
  if (containerType === 'carton') {
    // Check for egg cartons specifically
    if (!detectedIngredients.has('egg')) {
      const eggDetection = allDetections.some(d => 
        d.includes('egg') || d.includes('dozen') || d.includes('grade a')
      );
      
      if (eggDetection) {
        const quantity = extractQuantity(allDetections.join(' '));
        detectedIngredients.set('egg', {
          name: 'Egg',
          confidence: 0.90,
          category: 'proteins',
          detectionMethod: 'CONTAINER',
          containerType: 'carton',
          quantity: quantity || '12 eggs'
        });
        console.log(`✅ CONTAINER: Egg carton detected - ${quantity || '12 eggs'}`);
      }
    }
  }

  if (containerType === 'jar' || containerType === 'can') {
    // Boost confidence for jarred/canned items
    detectedIngredients.forEach((ingredient, key) => {
      if (['pickles', 'olives', 'jam', 'canned tomatoes', 'canned corn', 'canned beans', 'canned soup', 'tuna', 'salmon'].includes(key)) {
        ingredient.confidence = Math.min(0.95, ingredient.confidence + 0.10);
        ingredient.containerType = containerType;
        console.log(`📈 ${containerType.toUpperCase()} boost: ${ingredient.name}`);
      }
    });
  }

  const results = Array.from(detectedIngredients.values());

  console.log('📊 Final Results:', {
    totalDetected: results.length,
    containerType: containerType,
    byMethod: {
      TEXT: results.filter(r => r.detectionMethod === 'TEXT').length,
      OBJECT: results.filter(r => r.detectionMethod === 'OBJECT').length,
      LABEL: results.filter(r => r.detectionMethod === 'LABEL').length,
      CONTEXT: results.filter(r => r.detectionMethod === 'CONTEXT').length,
      CONTAINER: results.filter(r => r.detectionMethod === 'CONTAINER').length,
      INFERRED: results.filter(r => r.detectionMethod === 'INFERRED').length
    },
    ingredients: results.map(r => `${r.name} (${r.detectionMethod}, ${(r.confidence * 100).toFixed(0)}%)${r.containerType ? ` [${r.containerType}]` : ''}${r.quantity ? ` - ${r.quantity}` : ''}`)
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

    // Enhanced demo data with container types and quantities
    const mockIngredients: DetectedIngredient[] = [
      { name: 'Pasta', confidence: 0.95, category: 'grains', detectionMethod: 'DEMO', containerType: 'box', quantity: '16 oz' },
      { name: 'Canned tomatoes', confidence: 0.92, category: 'vegetables', detectionMethod: 'DEMO', containerType: 'can', quantity: '28 oz' },
      { name: 'Basil', confidence: 0.88, category: 'herbs', detectionMethod: 'DEMO', containerType: 'fresh' },
      { name: 'Garlic', confidence: 0.85, category: 'spices', detectionMethod: 'DEMO', containerType: 'fresh' },
      { name: 'Onion', confidence: 0.82, category: 'vegetables', detectionMethod: 'DEMO', containerType: 'fresh' },
      { name: 'Olive oil', confidence: 0.80, category: 'condiments', detectionMethod: 'DEMO', containerType: 'bottle', quantity: '16.9 oz' },
      { name: 'Black pepper', confidence: 0.75, category: 'spices', detectionMethod: 'DEMO', containerType: 'jar' },
      { name: 'Cheese', confidence: 0.72, category: 'dairy', detectionMethod: 'DEMO', containerType: 'package', quantity: '8 oz' }
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
