
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChefHat, Apple, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { FloatingElement } from '../components/common/FloatingElement';
import imgImage6 from "../assets/2780e8169c075695ce0c5190b09759e545a810b6.png";
import imgImage7 from "../assets/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png";
import imgImage8 from "../assets/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png";
import { auth, db } from '../lib/firebase';
import { getUserRecipes, getUserLeftoverRecipes, getUserMealPlan, Recipe, MealPlanEntry } from '../lib/firebase';
import { addDoc, collection, deleteDoc, doc, Timestamp, getDoc } from 'firebase/firestore';

interface AssignedRecipe extends Recipe {
  entryId?: string;
}

interface MealPlanData {
  [day: string]: {
    Breakfast: AssignedRecipe | null;
    Lunch: AssignedRecipe | null;
    Dinner: AssignedRecipe | null;
  };
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

function getWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diffToMon);
  const dates: { [key: string]: Date } = {};
  daysOfWeek.forEach((day, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    dates[day] = d;
  });
  const sunday = dates['Sunday'];
  return { start: monday, end: sunday, dates };
}

function getCreatedAtTime(createdAt: Date | Timestamp): number {
  return createdAt instanceof Timestamp ? createdAt.toDate().getTime() : createdAt.getTime();
}

function MealPlanPage() {
  const [selectedMeal, setSelectedMeal] = useState<{ day: string; type: string; meal: any } | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlanData>(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: { Breakfast: null, Lunch: null, Dinner: null } }), {})
  );
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [weekDates, setWeekDates] = useState<{ [key: string]: Date }>({});
  const [totalCookTime, setTotalCookTime] = useState(0);
  const [plannedMeals, setPlannedMeals] = useState(0);
  const [ingredientsNeeded, setIngredientsNeeded] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const user = auth.currentUser;

      try {
        // Fetch week dates
        const { start, end, dates } = getWeekDates();
        setWeekDates(dates);

        if (!user) {
          // Fallback to hardcoded recipes if no user
          setAvailableRecipes([
            {
              id: '1',
              name: 'Egg Bowl',
              image: imgImage6,
              time: '15 min',
              difficulty: 'Easy',
              calories: 0,
              ingredients: [],
              instructions: [],
              nutritionBenefits: '',
              createdAt: new Date(),
              usedIngredients: []
            },
            {
              id: '2',
              name: 'Fresh Salad',
              image: imgImage7,
              time: '10 min',
              difficulty: 'Easy',
              calories: 0,
              ingredients: [],
              instructions: [],
              nutritionBenefits: '',
              createdAt: new Date(),
              usedIngredients: []
            },
            {
              id: '3',
              name: 'Cheese Omelette',
              image: imgImage8,
              time: '12 min',
              difficulty: 'Medium',
              calories: 0,
              ingredients: [],
              instructions: [],
              nutritionBenefits: '',
              createdAt: new Date(),
              usedIngredients: []
            }
          ]);
          setMealPlan(daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: { Breakfast: null, Lunch: null, Dinner: null } }), {}));
          setLoading(false);
          return;
        }

        // Fetch generated and leftover recipes
        const [genRecipesResult, leftRecipesResult] = await Promise.all([
          getUserRecipes(user.uid),
          getUserLeftoverRecipes(user.uid)
        ]);

        if (genRecipesResult.error || leftRecipesResult.error) {
          setError('Failed to load recipes: ' + (genRecipesResult.error || leftRecipesResult.error));
          setAvailableRecipes([]);
        } else {
          // Deduplicate recipes by ID, keeping the most recent one
          const recipeMap = new Map<string, Recipe>();
          [...(genRecipesResult.recipes || []), ...(leftRecipesResult.recipes || [])].forEach(recipe => {
            const existing = recipeMap.get(recipe.id);
            if (!existing || getCreatedAtTime(recipe.createdAt) > getCreatedAtTime(existing.createdAt)) {
              recipeMap.set(recipe.id, recipe);
            }
          });
          const combinedRecipes = Array.from(recipeMap.values()).sort(
            (a, b) => getCreatedAtTime(b.createdAt) - getCreatedAtTime(a.createdAt)
          );
          setAvailableRecipes(combinedRecipes);
        }

        // Fetch meal plan
        const { mealPlan: entries, error: mealPlanError } = await getUserMealPlan(user.uid, start, end);
        if (mealPlanError) {
          setError('Failed to load meal plan: ' + mealPlanError);
        } else {
          const newPlan = daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: { Breakfast: null, Lunch: null, Dinner: null } }), {}) as MealPlanData;
          entries.forEach((entry: MealPlanEntry) => {
            newPlan[entry.day][entry.mealType] = {
              ...entry.recipe,
              entryId: entry.id
            };
          });
          setMealPlan(newPlan);
        }
      } catch (err: any) {
        setError('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let totalTime = 0;
    let planned = 0;
    const ingredientsSet = new Set<string>();
    daysOfWeek.forEach(day => {
      mealTypes.forEach(type => {
        const meal = mealPlan[day][type as keyof typeof mealPlan[typeof day]];
        if (meal) {
          planned++;
          const timeMatch = meal.time.match(/(\d+)\s*min/);
          const timeNum = timeMatch ? parseInt(timeMatch[1]) : 0;
          totalTime += timeNum;
          meal.ingredients.forEach(ing => ingredientsSet.add(ing));
        }
      });
    });
    setTotalCookTime(totalTime);
    setPlannedMeals(planned);
    setIngredientsNeeded(ingredientsSet.size);
  }, [mealPlan]);

  const handleMealAssign = async (day: string, mealType: string, recipe: Recipe) => {
    setSelectedMeal(null);
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError('Please log in to assign meals');
      return;
    }

    try {
      const scheduledDate = weekDates[day];
      const docRef = await addDoc(collection(db, 'mealPlan'), {
        userId,
        day,
        mealType,
        recipe,
        scheduledDate: Timestamp.fromDate(scheduledDate)
      });

      setMealPlan(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [mealType]: { ...recipe, entryId: docRef.id }
        }
      }));
    } catch (error: any) {
      setError('Failed to assign meal: ' + error.message);
      console.error('Assign meal error:', error);
    }
  };

  const handleMealRemove = async (day: string, mealType: string) => {
    const entryId = mealPlan[day][mealType as keyof typeof mealPlan[typeof day]]?.entryId;
    if (entryId) {
      try {
        await deleteDoc(doc(db, 'mealPlan', entryId));
      } catch (error: any) {
        setError('Failed to remove meal: ' + error.message);
        console.error('Remove meal error:', error);
        return;
      }
    }

    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null
      }
    }));
  };

  const handleRecipeRemove = async (recipeId: string) => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      setError('Please log in to remove recipes');
      return;
    }

    try {
      // Check both generatedRecipes and leftoverRecipes concurrently
      const [genRecipeDoc, leftRecipeDoc] = await Promise.all([
        getDoc(doc(db, 'generatedRecipes', recipeId)),
        getDoc(doc(db, 'leftoverRecipes', recipeId))
      ]);

      // Delete from the appropriate collection if the recipe exists
      if (genRecipeDoc.exists()) {
        await deleteDoc(doc(db, 'generatedRecipes', recipeId));
      } else if (leftRecipeDoc.exists()) {
        await deleteDoc(doc(db, 'leftoverRecipes', recipeId));
      } else {
        // Log a warning with more context
        console.warn(`Recipe with ID ${recipeId} not found in either generatedRecipes or leftoverRecipes. This may indicate stale data in availableRecipes.`);
      }

      // Update availableRecipes state
      setAvailableRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));

      // Update mealPlan state to remove any assignments of this recipe
      setMealPlan(prev => {
        const updatedPlan = { ...prev };
        daysOfWeek.forEach(day => {
          mealTypes.forEach(type => {
            if (updatedPlan[day][type as keyof typeof updatedPlan[typeof day]]?.id === recipeId) {
              updatedPlan[day][type as keyof typeof updatedPlan[typeof day]] = null;
            }
          });
        });
        return updatedPlan;
      });
    } catch (error: any) {
      setError('Failed to remove recipe: ' + error.message);
      console.error('Remove recipe error:', error);
    }
  };

  const now = Date.now();
  const recentRecipes = availableRecipes.filter(r => now - getCreatedAtTime(r.createdAt) < 60 * 60 * 1000);
  const previousRecipes = availableRecipes.filter(r => now - getCreatedAtTime(r.createdAt) >= 60 * 60 * 1000);

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
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {loading && <p className="text-gray-500 text-sm mt-2">Loading meal plan...</p>}
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
                                variant="destructive"
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
        <AnimatePresence>
          {selectedMeal && (
            <Dialog open={!!selectedMeal} onOpenChange={() => setSelectedMeal(null)}>
              <DialogContent className="w-full max-w-md mx-auto my-8 p-4 rounded-lg max-h-[80vh] overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <DialogHeader>
                    <Button
                      variant="ghost"
                      className="absolute right-2 top-2 h-8 w-8 p-0 bg-gray-100 hover:bg-gray-200 transition-colors rounded-full"
                      onClick={() => setSelectedMeal(null)}
                    >
                      <X className="h-4 w-4 text-gray-600" />
                      <span className="sr-only">Close</span>
                    </Button>
                    <DialogTitle className="text-lg font-bold text-gray-900 pr-8">
                      Select Recipe for {selectedMeal.day} {selectedMeal.type}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600">
                      Choose a recipe from your collection to add to your meal plan.
                    </DialogDescription>
                  </DialogHeader>

                  <Tabs defaultValue="recent" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
                      <TabsTrigger
                        value="recent"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md text-sm font-medium text-gray-700"
                      >
                        Recent
                      </TabsTrigger>
                      <TabsTrigger
                        value="previous"
                        className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md text-sm font-medium text-gray-700"
                      >
                        Previous
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="recent">
                      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[40vh] mt-3 pr-1">
                        {recentRecipes.length === 0 ? (
                          <p className="text-gray-500 text-center col-span-2 text-sm">No recent recipes available.</p>
                        ) : (
                          recentRecipes.map((recipe, index) => (
                            <motion.div
                              key={`${recipe.id}-${index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative group"
                            >
                              <Card
                                className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-gray-200 hover:border-emerald-400 rounded-md"
                                onClick={() => handleMealAssign(selectedMeal.day, selectedMeal.type, recipe)}
                              >
                                <CardContent className="p-2">
                                  <img
                                    src={recipe.image || imgImage6}
                                    alt={recipe.name}
                                    loading="lazy"
                                    className="w-full h-12 object-cover rounded-md mb-1"
                                  />
                                  <h4 className="font-medium text-xs text-gray-900 truncate">{recipe.name}</h4>
                                  <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {recipe.time}
                                  </p>
                                  <Badge className="bg-emerald-100 text-emerald-700 text-xs mt-1">
                                    {recipe.difficulty}
                                  </Badge>
                                </CardContent>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 sm:h-6 sm:w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering meal assignment
                                    handleRecipeRemove(recipe.id);
                                  }}
                                >
                                  <X className="h-2 w-2 sm:h-3 sm:w-3" />
                                </Button>
                              </Card>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="previous">
                      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[40vh] mt-3 pr-1">
                        {previousRecipes.length === 0 ? (
                          <p className="text-gray-500 text-center col-span-2 text-sm">No previous recipes available.</p>
                        ) : (
                          previousRecipes.map((recipe, index) => (
                            <motion.div
                              key={`${recipe.id}-${index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative group"
                            >
                              <Card
                                className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-gray-200 hover:border-emerald-400 rounded-md"
                                onClick={() => handleMealAssign(selectedMeal.day, selectedMeal.type, recipe)}
                              >
                                <CardContent className="p-2">
                                  <img
                                    src={recipe.image || imgImage6}
                                    alt={recipe.name}
                                    loading="lazy"
                                    className="w-full h-12 object-cover rounded-md mb-1"
                                  />
                                  <h4 className="font-medium text-xs text-gray-900 truncate">{recipe.name}</h4>
                                  <p className="text-xs text-gray-600 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {recipe.time}
                                  </p>
                                  <Badge className="bg-emerald-100 text-emerald-700 text-xs mt-1">
                                    {recipe.difficulty}
                                  </Badge>
                                </CardContent>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-4 w-4 sm:h-6 sm:w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent triggering meal assignment
                                    handleRecipeRemove(recipe.id);
                                  }}
                                >
                                  <X className="h-2 w-2 sm:h-3 sm:w-3" />
                                </Button>
                              </Card>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Weekly Summary */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Total Cook Time</h3>
              <p className="text-2xl font-bold text-emerald-600">{totalCookTime} min</p>
              <p className="text-sm text-gray-600">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-6 text-center">
              <ChefHat className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Planned Meals</h3>
              <p className="text-2xl font-bold text-emerald-600">{plannedMeals} / 21</p>
              <p className="text-sm text-gray-600">Meals scheduled</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-6 text-center">
              <Apple className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Ingredients Needed</h3>
              <p className="text-2xl font-bold text-emerald-600">{ingredientsNeeded}</p>
              <p className="text-sm text-gray-600">Shopping list items</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default MealPlanPage;
