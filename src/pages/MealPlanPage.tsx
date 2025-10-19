import React, { useState } from 'react';
import { Calendar, Clock, ChefHat, Apple, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { FloatingElement } from '../components/common/FloatingElement';
import imgImage6 from "../assets/2780e8169c075695ce0c5190b09759e545a810b6.png";
import imgImage7 from "../assets/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png";
import imgImage8 from "../assets/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png";

interface MealRecipe {
  name: string;
  image: string;
  time: string;
  difficulty?: string;
}

interface MealPlanData {
  [day: string]: {
    Breakfast: MealRecipe | null;
    Lunch: MealRecipe | null;
    Dinner: MealRecipe | null;
  };
}

interface MealPlanPageProps {
  recipes?: any[];
}

function MealPlanPage({ recipes = [] }: MealPlanPageProps) {
  const [selectedMeal, setSelectedMeal] = useState<{ day: string; type: string; meal: any } | null>(null);

  console.log('MealPlanPage: received recipes count =', recipes.length);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  const [mealPlan, setMealPlan] = useState<MealPlanData>({
    Monday: {
      Breakfast: { name: 'Cheese Omelette', image: imgImage8, time: '12 min' },
      Lunch: null,
      Dinner: { name: 'Egg Bowl', image: imgImage6, time: '15 min' }
    },
    Tuesday: {
      Breakfast: null,
      Lunch: { name: 'Fresh Salad', image: imgImage7, time: '10 min' },
      Dinner: null
    },
    Wednesday: { Breakfast: null, Lunch: null, Dinner: null },
    Thursday: { Breakfast: null, Lunch: null, Dinner: null },
    Friday: { Breakfast: null, Lunch: null, Dinner: null },
    Saturday: { Breakfast: null, Lunch: null, Dinner: null },
    Sunday: { Breakfast: null, Lunch: null, Dinner: null }
  });

  // Use recipes from props, fallback to hardcoded ones if empty
  const availableRecipes = recipes.length > 0
    ? recipes.map(recipe => ({
        name: recipe.name,
        image: recipe.image || imgImage6,
        time: recipe.time || '20 min',
        difficulty: recipe.difficulty || 'Medium'
      }))
    : [
        { name: 'Egg Bowl', image: imgImage6, time: '15 min', difficulty: 'Easy' },
        { name: 'Fresh Salad', image: imgImage7, time: '10 min', difficulty: 'Easy' },
        { name: 'Cheese Omelette', image: imgImage8, time: '12 min', difficulty: 'Medium' }
      ];

  const handleMealAssign = (day: string, mealType: string, recipe: MealRecipe) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: recipe
      }
    }));
    setSelectedMeal(null);
    console.log('MealPlan: assigned', recipe?.name, 'to', day, mealType);
  };

  const handleMealRemove = (day: string, mealType: string) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null
      }
    }));
    console.log('MealPlan: removed meal from', day, mealType);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 relative overflow-hidden">
      {/* Background animations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 20, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <Calendar className="absolute top-1/4 left-1/6 w-6 h-6 text-emerald-400/40" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <Clock className="absolute top-1/3 right-1/4 w-5 h-5 text-teal-400/40" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <ChefHat className="absolute bottom-1/3 left-1/3 w-6 h-6 text-orange-400/40" />
        </FloatingElement>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Weekly Meal Plan
            </span>
          </h1>
          <p className="text-gray-600">Plan your meals for the week and make cooking effortless</p>
        </div>

        {/* Meal Plan Grid */}
        <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 mb-8">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 lg:gap-6">
              {daysOfWeek.map((day) => (
                <div key={day} className="space-y-4">
                  <h3 className="font-bold text-gray-900 text-center pb-2 border-b border-gray-200 text-sm lg:text-base">
                    {day}
                  </h3>

                  {mealTypes.map((mealType) => (
                    <div key={`${day}-${mealType}`} className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-600">{mealType}</h4>

                      {mealPlan[day][mealType as keyof typeof mealPlan[typeof day]] ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <Card className="bg-gradient-to-r from-emerald-100 to-teal-100 border-0 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-2 sm:p-3">
                              <img
                                src={mealPlan[day][mealType as keyof typeof mealPlan[typeof day]]!.image}
                                alt={mealPlan[day][mealType as keyof typeof mealPlan[typeof day]]!.name}
                                loading="lazy"
                                className="w-full h-12 sm:h-16 object-cover rounded mb-1 sm:mb-2"
                              />
                              <h5 className="font-medium text-xs text-gray-900 mb-1 leading-tight">
                                {mealPlan[day][mealType as keyof typeof mealPlan[typeof day]]!.name}
                              </h5>
                              <p className="text-xs text-gray-600">
                                🕒 {mealPlan[day][mealType as keyof typeof mealPlan[typeof day]]!.time}
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 sm:h-6 sm:w-6 p-0"
                                onClick={() => handleMealRemove(day, mealType)}
                              >
                                <X className="h-2 w-2 sm:h-3 sm:w-3" />
                              </Button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ) : (
                        <Card
                          className="border-2 border-dashed border-gray-300 hover:border-emerald-300 transition-colors cursor-pointer bg-white/50"
                          onClick={() => setSelectedMeal({ day, type: mealType, meal: null })}
                        >
                          <CardContent className="p-3 sm:p-6 flex flex-col items-center justify-center text-center min-h-[80px] sm:min-h-[120px]">
                            <Plus className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400 mb-1 sm:mb-2" />
                            <span className="text-xs text-gray-500">Add {mealType}</span>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recipe Selection Modal */}
        {selectedMeal && (
          <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Select Recipe for {selectedMeal.day} {selectedMeal.type}
                </DialogTitle>
                <DialogDescription>
                  Choose a recipe from your available options to add to your meal plan.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                {availableRecipes.map((recipe) => (
                  <Card
                    key={recipe.name}
                    className="cursor-pointer hover:shadow-md transition-all duration-300 border-2 hover:border-emerald-300"
                    onClick={() => handleMealAssign(selectedMeal.day, selectedMeal.type, recipe)}
                  >
                    <CardContent className="p-4 flex items-center space-x-4">
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        loading="lazy"
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{recipe.name}</h4>
                        <p className="text-sm text-gray-600">🕒 {recipe.time}</p>
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          {recipe.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Weekly Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Total Cook Time</h3>
              <p className="text-2xl font-bold text-emerald-600">37 min</p>
              <p className="text-sm text-gray-600">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-6 text-center">
              <ChefHat className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Planned Meals</h3>
              <p className="text-2xl font-bold text-emerald-600">3 / 21</p>
              <p className="text-sm text-gray-600">Meals scheduled</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-6 text-center">
              <Apple className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Ingredients Needed</h3>
              <p className="text-2xl font-bold text-emerald-600">8</p>
              <p className="text-sm text-gray-600">Shopping list items</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MealPlanPage;
