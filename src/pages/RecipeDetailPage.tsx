import React from 'react';
import { ArrowLeft, Users, Clock, ChefHat } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';

interface Recipe {
  name: string;
  image: string;
  difficulty: string;
}

interface RecipeDetailPageProps {
  recipe: Recipe;
  onBack: () => void;
}

interface RecipeDetails {
  servings: number;
  prepTime: string;
  cookTime: string;
  ingredients: string[];
  instructions: string[];
}

function RecipeDetailPage({ recipe, onBack }: RecipeDetailPageProps) {
  const recipeDetails: Record<string, RecipeDetails> = {
    'Egg Bowl': {
      servings: 2,
      prepTime: '10 min',
      cookTime: '5 min',
      ingredients: ['2 large eggs', '1 tbsp butter', '1/4 cup cheese', '2 slices bread', 'Salt and pepper to taste', '1 green onion (chopped)'],
      instructions: [
        'Crack eggs into a bowl and whisk with salt and pepper.',
        'Heat butter in a non-stick pan over medium heat.',
        'Pour in eggs and gently scramble until almost set.',
        'Add cheese and fold gently.',
        'Toast bread slices until golden.',
        'Serve eggs over toasted bread, garnish with green onion.'
      ]
    },
    'Fresh Salad': {
      servings: 1,
      prepTime: '10 min',
      cookTime: '0 min',
      ingredients: ['2 cups mixed lettuce', '1 tomato (diced)', '1/4 cucumber (sliced)', '2 tbsp olive oil', '1 tbsp lemon juice', '1/4 red onion (thinly sliced)', 'Salt and pepper to taste'],
      instructions: [
        'Wash and dry lettuce leaves thoroughly.',
        'Dice tomato and slice cucumber.',
        'Combine lettuce, tomato, cucumber, and red onion in a large bowl.',
        'Whisk olive oil and lemon juice together.',
        'Drizzle dressing over salad and toss gently.',
        'Season with salt and pepper to taste.'
      ]
    },
    'Cheese Omelette': {
      servings: 1,
      prepTime: '5 min',
      cookTime: '7 min',
      ingredients: ['3 large eggs', '2 tbsp butter', '1/3 cup shredded cheese', '2 tbsp milk', 'Salt and pepper to taste', '1 tbsp fresh chives (chopped)'],
      instructions: [
        'Beat eggs with milk, salt, and pepper in a bowl.',
        'Heat butter in a non-stick omelette pan over medium heat.',
        'Pour egg mixture into the pan.',
        'As eggs start to set, gently pull edges toward center.',
        'When almost set, add cheese to one half of omelette.',
        'Fold omelette in half and slide onto plate.',
        'Garnish with fresh chives and serve immediately.'
      ]
    }
  };

  const details = recipeDetails[recipe.name as keyof typeof recipeDetails];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-emerald-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Recipes
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <div>
              <img
                src={recipe.image}
                alt={recipe.name}
                loading="lazy"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{recipe.name}</h1>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {recipe.difficulty}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Users className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <div className="font-semibold">{details.servings}</div>
                  <div className="text-sm text-gray-600">Servings</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <div className="font-semibold">{details.prepTime}</div>
                  <div className="text-sm text-gray-600">Prep Time</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <ChefHat className="w-6 h-6 mx-auto mb-2 text-emerald-600" />
                  <div className="font-semibold">{details.cookTime}</div>
                  <div className="text-sm text-gray-600">Cook Time</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Ingredients</h3>
                <ul className="space-y-2">
                  {details.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Instructions</h3>
                <ol className="space-y-3">
                  {details.instructions.map((instruction, index) => (
                    <li key={index} className="flex space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
