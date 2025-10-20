import React, { useState, useEffect } from 'react';
import { Upload, Camera, Apple, Carrot, Fish, Loader2, ChefHat, Clock, Refrigerator, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { FloatingElement } from '../components/common/FloatingElement';
import {
  getUserIngredients,
  saveDetectedIngredients,
  getUserRecipes,
  saveGeneratedRecipes,
  updateInventory,
  addManualIngredient,
  Ingredient
} from '../lib/firebase';
import { generateRecipes, generateRecipesWithImages, generateRecipesSmart } from '../lib/recipeGenerator';
import { db, addDoc, collection, Timestamp, updateDoc } from '../lib/firebase';

interface DetectedIngredient {
  name: string;
  confidence: number;
  category: string;
  detectionMethod?: string;
}

interface AuthState {
  user: { uid: string; email?: string } | null;
  isLoggedIn: boolean;
}

interface HomePageProps {
  onNavigate?: (page: string) => void;
  auth: AuthState;
  sharedRecipes?: any[];
  setSharedRecipes?: (recipes: any[]) => void;
  sharedIngredients?: string[];
  setSharedIngredients?: (ingredients: string[]) => void;
}

function HomePage({ onNavigate, auth, sharedRecipes = [], setSharedRecipes, sharedIngredients = [], setSharedIngredients }: HomePageProps) {
  // Convert shared ingredients array to ingredient map with quantities
  const initializeIngredientMap = (ingredients: string[]) => {
    const map: Record<string, number> = {};
    ingredients.forEach(ing => {
      map[ing] = (map[ing] || 0) + 1;
    });
    return map;
  };

  const [ingredientMap, setIngredientMap] = useState<Record<string, number>>(initializeIngredientMap(sharedIngredients));
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>(sharedRecipes);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientQuantity, setNewIngredientQuantity] = useState('1');

  // Helper to convert ingredient map to array for Firebase/API calls
  const ingredientMapToArray = (map: Record<string, number>) => {
    const arr: string[] = [];
    Object.entries(map).forEach(([name, qty]) => {
      for (let i = 0; i < qty; i++) {
        arr.push(name);
      }
    });
    return arr;
  };

  // Sync local state to parent state
  useEffect(() => {
    if (setSharedIngredients) {
      setSharedIngredients(ingredientMapToArray(ingredientMap));
    }
  }, [ingredientMap, setSharedIngredients]);

  useEffect(() => {
    if (setSharedRecipes) {
      setSharedRecipes(generatedRecipes);
    }
  }, [generatedRecipes, setSharedRecipes]);

  const handleImageUpload = async (file: File) => {
    try {
      if (!auth.user?.uid) {
        console.error('User not authenticated');
        return;
      }
      setIsUploadingImage(true);
      console.log('🔍 Processing image for ingredient detection...');

      const { analyzeImageWithGoogleVision } = await import('../lib/googleVision');
      const visionResult = await analyzeImageWithGoogleVision(file, auth.user.uid);
      if (visionResult.error) {
        console.error('Vision API Error:', visionResult.error);
        setIsUploadingImage(false);
        return;
      }

      const newIngredientNames = visionResult.ingredients.map((ing: DetectedIngredient) => ing.name);
      console.log('🔍 Newly detected ingredients:', newIngredientNames);

      // Merge with existing ingredients (stacking behavior)
      const updatedMap = { ...ingredientMap };
      newIngredientNames.forEach(name => {
        updatedMap[name] = (updatedMap[name] || 0) + 1;
      });

      const firebaseIngredients: Ingredient[] = visionResult.ingredients.map((ing: DetectedIngredient) => ({
        id: '',
        name: ing.name,
        detectedAt: new Date(),
        addedManually: false,
        confidence: ing.confidence,
        category: ing.category || 'detected',
      }));

      // Save to Firebase (all operations)
      await saveDetectedIngredients(auth.user.uid, firebaseIngredients);
      await updateInventory(auth.user.uid, newIngredientNames);

      // Update local state with merged ingredients
      setIngredientMap(updatedMap);

      console.log('✅ Successfully detected and merged ingredients. Total unique:', Object.keys(updatedMap).length);
      console.log('💡 Click "Generate Recipe" button to create recipes from your ingredients');
      setShowUploadOptions(false);

      // Only stop loading AFTER all ingredients are in the state
      setIsUploadingImage(false);
    } catch (error) {
      console.error('❌ Error analyzing image:', error);
      setIsUploadingImage(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleNextRecipes = () => {
    if (currentRecipeIndex + recipesPerPage < generatedRecipes.length) {
      setCurrentRecipeIndex(currentRecipeIndex + recipesPerPage);
    }
  };

  const handlePrevRecipes = () => {
    if (currentRecipeIndex > 0) {
      setCurrentRecipeIndex(Math.max(0, currentRecipeIndex - recipesPerPage));
    }
  };

  const recipesPerPage = 4;
  const totalPages = Math.ceil(generatedRecipes.length / recipesPerPage);
  const currentPageRecipes = generatedRecipes.slice(
    currentRecipeIndex,
    currentRecipeIndex + recipesPerPage
  );

  const selectedRecipe = generatedRecipes.find(r => r.id === selectedRecipeId) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950/20 dark:to-teal-950/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 dark:floating-orb-1 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/20 dark:floating-orb-2 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <Apple className="absolute top-1/4 left-1/6 w-6 h-6 text-emerald-400/40" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <Carrot className="absolute top-1/3 right-1/4 w-5 h-5 text-orange-400/40" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <Fish className="absolute bottom-1/3 left-1/3 w-6 h-6 text-blue-400/40" />
        </FloatingElement>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-12">
          <Card
            className={`max-w-lg mx-auto border-2 border-dashed transition-all duration-300 hover:shadow-xl ${
              isDragOver
                ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-lg'
                : 'border-gray-300 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-400 bg-white/80 dark:glass backdrop-blur-lg'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <CardContent className="p-8 flex flex-col items-center">
              {isUploadingImage ? (
                <>
                  <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-emerald-100 mb-4">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-emerald-700 font-semibold text-lg">
                      Analyzing Your Image...
                    </span>
                    <p className="text-gray-500 text-sm text-center">
                      Detecting ingredients with AI • This may take a moment
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 mb-4 ${
                    isDragOver ? 'bg-emerald-100 scale-110' : 'bg-gray-100'
                  }`}>
                    {isDragOver ? (
                      <Refrigerator className="w-10 h-10 text-emerald-600" />
                    ) : (
                      <Camera className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-emerald-700 font-semibold text-lg">
                      {isDragOver ? 'Drop your fridge photo!' : 'Upload Your Fridge Photo'}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2 mb-4">
                    Drag and drop or click to browse
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            id="homepage-file-upload"
                            disabled={isUploadingImage}
                          />
                          <Button
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => document.getElementById('homepage-file-upload')?.click()}
                            disabled={isUploadingImage}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 dark:glass backdrop-blur-lg shadow-xl border-0 dark:border dark:border-white/10 mb-12">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ingredients Found:</h2>
              <Badge className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30">
                {Object.keys(ingredientMap).length} unique items
              </Badge>
            </div>
            {Object.keys(ingredientMap).length === 0 ? (
              <p className="text-gray-500 text-center py-4">No ingredients detected yet. Upload a photo to get started!</p>
            ) : (
              <div className="flex flex-wrap gap-3 mb-6">
                {Object.entries(ingredientMap).map(([ingredient, quantity], index) => (
                  <motion.div
                    key={ingredient}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-1"
                  >
                    <Badge
                      className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-4 py-2 text-sm hover:bg-emerald-200 dark:hover:bg-emerald-500/30 transition-colors cursor-pointer transform hover:scale-105 border border-emerald-200 dark:border-emerald-500/30"
                    >
                      {ingredient} {quantity > 1 && <span className="font-bold ml-1">×{quantity}</span>}
                    </Badge>
                    <button
                      className="ml-1 px-2 py-0.5 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 transition"
                      title="Remove ingredient"
                      onClick={async () => {
                        if (!auth.user?.uid) {
                          console.error('User not authenticated');
                          return;
                        }
                        try {
                          const updatedMap = { ...ingredientMap };
                          delete updatedMap[ingredient];
                          setIngredientMap(updatedMap);

                          // Update Firebase with new ingredient list
                          const newIngredientArray = ingredientMapToArray(updatedMap);
                          await updateInventory(auth.user.uid, newIngredientArray);

                          console.log(`✅ Removed ingredient: ${ingredient}`);
                        } catch (error) {
                          console.error(`❌ Error removing ingredient ${ingredient}:`, error);
                        }
                      }}
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
                <Badge
                  variant="outline"
                  className="border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 cursor-pointer"
                  onClick={() => setShowAddIngredientModal(true)}
                >
                  + Add More
                </Badge>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 w-full sm:w-auto"
                onClick={() => onNavigate?.('inventory')}
              >
                View Full Inventory
              </Button>
              <Button
                variant="outline"
                className="border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                onClick={async () => {
                  setIsGeneratingRecipes(true);
                  try {
                    const baseIngredients = ['oil', 'salt', 'pepper'];
                    const userIngredients = ingredientMapToArray(ingredientMap);
                    const allIngredients = Array.from(new Set([...userIngredients, ...baseIngredients]));
                    if (allIngredients.length === 0) {
                      console.warn('No ingredients available to generate recipes');
                      return;
                    }
                    console.log('🍳 Generating recipes with', allIngredients.length, 'ingredients:', allIngredients);
                    const { getEnvVar } = await import('../lib/env');
                    const apiKey = getEnvVar('VITE_OPENAI_API_KEY', '');
                    const recipeResult = await generateRecipesSmart(allIngredients, apiKey, 20, apiKey ? 30 : 10);
                    console.log('✅ Generated', recipeResult.length, 'recipes:', recipeResult.map(r => r.name));
                    if (!Array.isArray(recipeResult)) {
                      console.error('generateRecipesSmart did not return an array:', recipeResult);
                      return;
                    }
                    const savedRecipes = [];
                    for (const recipe of recipeResult) {
                      const docRef = await addDoc(collection(db, 'generatedRecipes'), {
                        ...recipe,
                        userId: auth.user?.uid,
                        createdAt: Timestamp.now(),
                      });
                      await updateDoc(docRef, { id: docRef.id });
                      savedRecipes.push({
                        ...recipe,
                        id: docRef.id,
                        createdAt: new Date(),
                      });
                    }
                    setGeneratedRecipes(savedRecipes);
                    if (setSharedRecipes) setSharedRecipes(savedRecipes);
                    setCurrentRecipeIndex(0);
                    if (savedRecipes.length > 0) {
                      setSelectedRecipeId(savedRecipes[0].id);
                    } else {
                      console.warn('No recipes generated');
                    }
                  } catch (error) {
                    console.error('Error generating recipes:', error);
                  } finally {
                    setIsGeneratingRecipes(false);
                  }
                }}
                disabled={(Object.keys(ingredientMap).length === 0 && !auth.user) || isGeneratingRecipes}
              >
                {isGeneratingRecipes ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Recipe'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-8">
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-4xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Generated Recipes
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {generatedRecipes.length} personalized recipes based on your ingredients
            </p>
          </div>

          {isGeneratingRecipes ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
              <span className="text-emerald-700 font-semibold">Generating recipes...</span>
              <p className="text-gray-500 text-sm mt-2">Finding the best recipes for your ingredients</p>
            </div>
          ) : generatedRecipes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recipes generated yet. Add ingredients to see suggestions!</p>
          ) : (
            <div className="grid lg:grid-cols-4 gap-4 lg:gap-8">
              <div className="lg:col-span-1 order-2 lg:order-1">
                <div className="mb-6">
                  <div className="flex flex-col items-center space-y-4 mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
                      Generated Recipes
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {Math.floor(currentRecipeIndex / recipesPerPage) + 1} of {totalPages}
                      </span>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevRecipes}
                          disabled={currentRecipeIndex === 0}
                          className="w-8 h-8 p-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextRecipes}
                          disabled={currentRecipeIndex + recipesPerPage >= generatedRecipes.length}
                          className="w-8 h-8 p-0 border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowLeft className="w-3 h-3 rotate-180" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {currentPageRecipes.map((recipe, index) => (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Card
                          className={`overflow-hidden cursor-pointer transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-lg hover:shadow-xl hover:scale-102 ${
                            selectedRecipeId === recipe.id
                              ? 'ring-2 ring-emerald-500/50 bg-emerald-50/80 shadow-xl scale-102'
                              : ''
                          }`}
                          onClick={() => setSelectedRecipeId(recipe.id)}
                        >
                          <div className="relative">
                            <img
                              src={recipe.image}
                              alt={recipe.name}
                              loading="lazy"
                              className="w-full h-24 object-cover transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                            <div className="absolute bottom-1 left-1 right-1">
                              <Badge className="bg-white/90 text-gray-800 text-xs">
                                {recipe.difficulty}
                              </Badge>
                            </div>
                            {selectedRecipeId === recipe.id && (
                              <motion.div
                                className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                  <ChefHat className="w-3 h-3 text-white" />
                                </div>
                              </motion.div>
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h3 className={`font-semibold text-sm mb-1 transition-colors ${
                              selectedRecipeId === recipe.id ? 'text-emerald-800' : 'text-gray-900'
                            }`}>
                              {recipe.name}
                            </h3>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>🕒 {recipe.time}</span>
                              <span>{recipe.calories} cal</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          Math.floor(currentRecipeIndex / recipesPerPage) === index
                            ? 'bg-emerald-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 order-1 lg:order-2">
                {selectedRecipe ? (
                  <motion.div
                    key={selectedRecipe.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <Card className="bg-white/90 dark:glass-strong backdrop-blur-lg shadow-xl border-0 dark:border dark:border-white/10 overflow-hidden">
                      <CardContent className="p-4 sm:p-6 lg:p-8">
                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                          <div>
                            <motion.img
                              src={selectedRecipe.image}
                              alt={selectedRecipe.name}
                              loading="lazy"
                              className="w-full h-64 object-cover rounded-lg mb-6 shadow-lg"
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            />
                            <motion.div
                              className="text-center"
                              initial={{ y: 10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                                {selectedRecipe.name}
                              </h3>
                              <div className="flex flex-col items-center space-y-2">
                                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                                  <span>🕒 {selectedRecipe.time}</span>
                                  <Badge className="bg-emerald-100 text-emerald-700">
                                    {selectedRecipe.difficulty}
                                  </Badge>
                                </div>
                                <div className="text-center space-y-1">
                                  <div className="flex items-center justify-center space-x-4 text-sm">
                                    <span className="font-medium text-emerald-600">
                                      {selectedRecipe.calories} cal
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500 italic">
                                    {selectedRecipe.nutritionBenefits}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                          <div className="space-y-6">
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.3 }}
                            >
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <ChefHat className="w-4 h-4 mr-2 text-emerald-600" />
                                Ingredients:
                              </h4>
                              <ul className="text-sm space-y-1 text-gray-700">
                                {selectedRecipe.ingredients?.map((ingredient: string, index: number) => (
                                  <motion.li
                                    key={index}
                                    className="flex items-start"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.2, delay: 0.4 + (index * 0.05) }}
                                  >
                                    <span className="text-emerald-500 mr-2">•</span>
                                    <span>{ingredient}</span>
                                  </motion.li>
                                )) || (
                                  <li className="text-gray-500">No ingredients available</li>
                                )}
                              </ul>
                            </motion.div>
                            <motion.div
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                            >
                              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                                Instructions:
                              </h4>
                              <ol className="text-sm space-y-2 text-gray-700">
                                {selectedRecipe.instructions?.map((instruction: { title: string; detail: string }, index: number) => (
                                  <motion.li
                                    key={index}
                                    className="space-y-1"
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
                                  >
                                    <div className="flex items-start space-x-2">
                                      <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900">{instruction.title}</div>
                                        <div className="text-gray-600 text-xs mt-1">{instruction.detail}</div>
                                      </div>
                                    </div>
                                  </motion.li>
                                )) || (
                                  <li className="text-gray-500">No instructions available</li>
                                )}
                              </ol>
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Select a recipe to view details</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Ingredient Modal */}
      <Dialog open={showAddIngredientModal} onOpenChange={setShowAddIngredientModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-emerald-700">Add Ingredient</DialogTitle>
            <DialogDescription>
              Add a new ingredient to your list with quantity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ingredient-name" className="text-sm font-medium">
                Ingredient Name
              </Label>
              <Input
                id="ingredient-name"
                placeholder="e.g., Tomato, Onion, Garlic..."
                value={newIngredientName}
                onChange={(e) => setNewIngredientName(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ingredient-quantity" className="text-sm font-medium">
                Quantity
              </Label>
              <Input
                id="ingredient-quantity"
                type="number"
                min="1"
                placeholder="1"
                value={newIngredientQuantity}
                onChange={(e) => setNewIngredientQuantity(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddIngredientModal(false);
                setNewIngredientName('');
                setNewIngredientQuantity('1');
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
              onClick={async () => {
                if (newIngredientName.trim() && auth.user?.uid) {
                  try {
                    const quantity = parseInt(newIngredientQuantity) || 1;
                    const ingredientName = newIngredientName.trim();

                    // Add ingredient to Firebase
                    await addManualIngredient(auth.user.uid, ingredientName);

                    // Add to local state (update quantity)
                    const updatedMap = { ...ingredientMap };
                    updatedMap[ingredientName] = (updatedMap[ingredientName] || 0) + quantity;
                    setIngredientMap(updatedMap);

                    // Update inventory with quantity
                    const ingredientsToAdd = Array(quantity).fill(ingredientName);
                    await updateInventory(auth.user.uid, ingredientsToAdd);

                    console.log(`✅ Manual ingredient added: ${ingredientName} (x${quantity})`);
                    console.log('💡 Click "Generate Recipe" button to create recipes with your ingredients');

                    // Reset and close modal
                    setShowAddIngredientModal(false);
                    setNewIngredientName('');
                    setNewIngredientQuantity('1');
                  } catch (error) {
                    console.error('❌ Failed to add ingredient:', error);
                  }
                }
              }}
              disabled={!newIngredientName.trim()}
            >
              Add Ingredient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HomePage;
