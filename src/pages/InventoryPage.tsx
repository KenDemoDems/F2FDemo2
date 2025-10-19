import React, { useState, useEffect } from 'react';
import { Apple, Carrot, Fish, Trash2, RotateCcw, Recycle, X, Loader2, ChefHat, Clock, Award, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { getUserInventory, updateInventory } from '../lib/firebase';
import { generateRecipesSmart } from '../lib/recipeGenerator';
import { sendSpoilingReminder, sendRecipeSuggestions } from '../lib/emailService';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AuthState {
  user: { uid: string; email?: string } | null;
  isLoggedIn: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  daysLeft?: number;
  category?: string;
  image?: string;
}

interface WasteItem {
  id: string;
  name: string;
  image: string;
  daysLeft: number;
}

interface InventoryPageProps {
  auth: AuthState;
}

const categoryIcons: { [key: string]: React.ReactElement } = {
  fruits: <Apple className="h-6 w-6 text-red-400" />,
  vegetables: <Carrot className="h-6 w-6 text-orange-400" />,
  proteins: <Fish className="h-6 w-6 text-blue-400" />,
  dairy: <span className="text-lg">🧀</span>,
  grains: <span className="text-lg">🌾</span>,
  general: <span className="text-lg">🥕</span>,
};

function InventoryPage({ auth }: InventoryPageProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [wasteManagementItems, setWasteManagementItems] = useState<WasteItem[]>([]);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showRecycleModal, setShowRecycleModal] = useState(false);
  const [leftoverRecipes, setLeftoverRecipes] = useState<any[]>([]);
  const [selectedLeftoverRecipe, setSelectedLeftoverRecipe] = useState<any | null>(null);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingredientImages, setIngredientImages] = useState<Record<string, string>>({}); // Store image URLs by ingredient name

  // Fetch inventory from Firestore
  const fetchInventory = async () => {
    if (!auth.user?.uid) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getUserInventory(auth.user.uid);
      if (result.error) {
        if (result.error.includes('index')) {
          setError(
            'Firestore query requires an index. Please create it in the Firebase Console and try again.'
          );
        } else {
          setError(result.error);
        }
      } else {
        setInventoryItems(result.inventory as InventoryItem[]);
        // Fetch images for all ingredients
        fetchIngredientImages(result.inventory.map((item: any) => item.name));
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch inventory';
      if (errorMessage.includes('index')) {
        setError(
          'Firestore query requires an index. Please create it in the Firebase Console.'
        );
      } else {
        setError(errorMessage);
      }
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch food-related images from Pexels API
  const fetchIngredientImages = async (ingredientNames: string[]) => {
    const { getEnvVar } = await import('../lib/env');
    const apiKey = getEnvVar('VITE_PEXELS_API_KEY', '');
    const uniqueNames = [...new Set(ingredientNames)]; // Avoid duplicate fetches

    for (const name of uniqueNames) {
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(`${name} food ingredient`)}&per_page=1`,
          {
            headers: {
              Authorization: apiKey || '',
            },
          }
        );
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          setIngredientImages(prev => ({
            ...prev,
            [name]: data.photos[0].src.medium,
          }));
        } else {
          console.warn(`No food-related image found for ${name}, using default`);
          setIngredientImages(prev => ({
            ...prev,
            [name]: '🥕',
          }));
        }
      } catch (error) {
        console.error(`Error fetching image for ${name}:`, error);
        setIngredientImages(prev => ({
          ...prev,
          [name]: '🥕',
        }));
      }
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [auth.user?.uid]);

  // Integrated Email Notification System for Spoiling Ingredients
  useEffect(() => {
    const checkForSpoilingIngredients = async () => {
      const spoilingSoonItems = inventoryItems.filter(item => item.daysLeft !== undefined && item.daysLeft <= 2);

      if (spoilingSoonItems.length > 0 && auth.user?.email) {
        console.log('🔔 EMAIL NOTIFICATION TRIGGER:', {
          spoilingItems: spoilingSoonItems,
          userEmail: auth.user.email,
          message: `You have ${spoilingSoonItems.length} ingredients expiring soon!`,
          items: spoilingSoonItems.map(item => `${item.name} (${item.daysLeft} days left)`).join(', '),
        });

        try {
          const emailResult = await sendSpoilingReminder(
            auth.user.email,
            spoilingSoonItems.map(item => ({
              name: item.name,
              daysLeft: item.daysLeft!,
            })),
          );

          if (emailResult.success) {
            console.log('✅ Spoiling reminder email sent successfully');
          } else {
            console.error('❌ Failed to send spoiling reminder:', emailResult.error);
          }
        } catch (error) {
          console.error('❌ Email notification error:', error);
        }
      }
    };

    checkForSpoilingIngredients();
    const notificationInterval = setInterval(checkForSpoilingIngredients, 12 * 60 * 60 * 1000);
    return () => clearInterval(notificationInterval);
  }, [inventoryItems, auth.user]);

  const handleDeleteFromInventory = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'inventory', itemId));
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));
      console.log('✅ Deleted item from inventory and Firestore:', itemId);
    } catch (err) {
      console.error('❌ Error deleting item from Firestore:', err);
      setError('Failed to delete item from inventory');
    }
  };

  const handleAddToBin = async (itemId: string) => {
    const itemToMove = inventoryItems.find(item => item.id === itemId);
    if (!itemToMove) return;

    try {
      const newWasteItem: WasteItem = {
        id: Date.now() + Math.random().toString(),
        name: itemToMove.name,
        image: (categoryIcons[itemToMove.category || 'general']?.props as any)?.children || '🥕',
        daysLeft: itemToMove.daysLeft || 7,
      };
      setWasteManagementItems(prev => [...prev, newWasteItem]);
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));
      console.log('✅ Moved item to waste management bin:', itemToMove.name);
    } catch (err) {
      console.error('❌ Error moving item to waste bin:', err);
      setError('Failed to move item to waste bin');
    }
  };

  const handleRemoveFromBin = async (itemId: string) => {
    setWasteManagementItems(prev => prev.filter(item => item.id !== itemId));
    console.log('✅ Removed item from waste management bin:', itemId);
  };

  const handleGenerateLeftoverRecipes = async () => {
    try {
      setIsGeneratingRecipes(true);
      console.log('🍳 Generating leftover recipes from waste management bin...');

      const ingredientNames = wasteManagementItems.map(item => item.name);
      if (ingredientNames.length === 0) {
        console.warn('⚠️ No ingredients in waste management bin');
        setIsGeneratingRecipes(false);
        return;
      }

      const { getEnvVar } = await import('../lib/env');
      const apiKey = getEnvVar('VITE_OPENAI_API_KEY', '');
      const generatedRecipes = await generateRecipesSmart(ingredientNames, apiKey);
      setLeftoverRecipes(generatedRecipes);

      if (auth.user?.email) {
        await sendRecipeSuggestions(auth.user.email, generatedRecipes.slice(0, 3), ingredientNames);
      }

      console.log('✅ Successfully generated leftover recipes:', generatedRecipes.length);
    } catch (error) {
      console.error('❌ Error generating leftover recipes:', error);
      setError('Failed to generate leftover recipes');
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  const recoverTechniques = [
    { title: 'Smoothies & Juices', tip: 'Blend slightly overripe fruits into delicious smoothies or fresh juices' },
    { title: 'Soups & Stews', tip: 'Use soft vegetables to create hearty soups and stews - perfect for batch cooking' },
    { title: 'Bread & Croutons', tip: 'Transform stale bread into croutons, breadcrumbs, or bread pudding' },
    { title: 'Pickle & Preserve', tip: 'Extend vegetable life by pickling or making preserves and jams' },
    { title: 'Freeze for Later', tip: 'Blanch and freeze vegetables, or freeze overripe bananas for future baking' },
  ];

  const recycleTechniques = [
    { title: 'Composting', tip: 'Turn food scraps into nutrient-rich compost for your garden' },
    { title: 'Vegetable Stock', tip: 'Use vegetable peels and scraps to make homemade vegetable stock' },
    { title: 'Coffee Grounds', tip: 'Used coffee grounds make excellent fertilizer for acid-loving plants' },
    { title: 'Eggshells', tip: 'Crushed eggshells provide calcium for plants and can deter garden pests' },
    { title: 'Citrus Peels', tip: 'Use citrus peels as natural cleaning agents or air fresheners' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        <span className="ml-2 text-gray-600">Loading inventory...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        {error.includes('index') && (
          <a
            href="https://console.firebase.google.com/v1/r/project/fridge2fork-3f77c/firestore/indexes?create_composite=ClNwcm9qZWN0cy9mcmlkZ2UyZm9yay0zZjc3Yy9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvaW52ZW50b3J5L2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCWFkZGVkRGF0ZRACGgwKCF9fbmFtZV9fEAI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Create the required index
          </a>
        )}
        <Button onClick={fetchInventory} variant="outline" className="mt-4">
          <RotateCcw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 20, 0], scale: [1, 0.9, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, delay: 0, repeat: Infinity, ease: 'easeInOut' }}>
          <Apple className="absolute top-1/4 left-1/6 w-6 h-6 text-red-400/40" />
        </motion.div>
        <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, delay: 1, repeat: Infinity, ease: 'easeInOut' }}>
          <Carrot className="absolute top-1/3 right-1/4 w-5 h-5 text-orange-400/40" />
        </motion.div>
        <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 5, 0] }} transition={{ duration: 4, delay: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <Fish className="absolute bottom-1/3 left-1/3 w-6 h-6 text-blue-400/40" />
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Inventory</span>
            </h1>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-700 font-medium">Email Notifications Enabled</span>
              </div>
              {inventoryItems.filter(item => item.daysLeft !== undefined && item.daysLeft <= 2).length > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-amber-100 border border-amber-300 px-3 py-2 rounded-lg">
                  <span className="text-amber-800 text-sm font-medium">
                    📧 Notification sent for {inventoryItems.filter(item => item.daysLeft !== undefined && item.daysLeft <= 2).length} expiring items
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-8">
              {inventoryItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items in your inventory yet. Add some ingredients!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {inventoryItems.map((item, index) => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card className="bg-gradient-to-r from-emerald-400/80 to-teal-400/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <CardContent className="p-10 sm:p-6 relative flex flex-col items-center">
                          <div className="flex items-center space-x-3 sm:space-x-4 pr-10 sm:pr-14 mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                              {ingredientImages[item.name] ? (
                                <img
                                  src={ingredientImages[item.name]}
                                  alt={`${item.name} image`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg">🥕</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-white text-sm sm:text-lg truncate">{item.name}</h3>
                              <p className="text-white/90 text-xs sm:text-sm font-medium">
                                {item.daysLeft} Days left{item.quantity && item.unit && ` • ${item.quantity} ${item.unit}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-center mt-3 w-full">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-500/90 text-white !hover:bg-red-500 font-semibold px-2 py-1 sm:px-3 sm:py-2 h-6 sm:h-7 text-xs"
                              onClick={() => handleAddToBin(item.id)}
                            >
                              <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                              <span className="hidden sm:inline">Bin</span>
                            </Button>
                          </div>
                          <div className="absolute top-1 right-1 flex space-x-3">
                            <Button
                              size="xs"
                              variant="destructive"
                              className="bg-red-500/90 !text-white hover:!bg-red-300 font-semibold py-1 sm:px-2 sm:py-1 h-6 sm:h-7 text-xs"
                              onClick={() => handleDeleteFromInventory(item.id)}
                            >
                              <X/>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Waste Management Bin</span>
          </h2>
          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-8">
              <div className="bg-white/60 rounded-3xl p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-emerald-700 flex items-center">
                    <RotateCcw className="w-6 h-6 mr-3" />
                    Reuse
                  </h3>
                  <motion.div whileHover={{ scale: isGeneratingRecipes ? 1 : 1.05 }} whileTap={{ scale: isGeneratingRecipes ? 1 : 0.95 }}>
                    <Button
                      className="bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleGenerateLeftoverRecipes}
                      disabled={wasteManagementItems.length === 0 || isGeneratingRecipes}
                    >
                      {isGeneratingRecipes ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating Recipes...
                        </>
                      ) : (
                        'Generate Leftover Recipes'
                      )}
                    </Button>
                  </motion.div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
                  {wasteManagementItems.map((item, index) => (
                    <motion.div key={item.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                      <Card className="bg-gradient-to-r from-emerald-200 to-teal-200 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-3 sm:p-4 relative">
                          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 overflow-hidden">
                              {ingredientImages[item.name] ? (
                                <img
                                  src={ingredientImages[item.name]}
                                  alt={`${item.name} image`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-base sm:text-lg">{item.image}</span>
                              )}
                            </div>
                            <div className="text-center sm:text-left min-w-0">
                              <h4 className="font-bold text-emerald-800 text-xs sm:text-sm truncate">{item.name}</h4>
                              <p className="text-emerald-700 text-xs">{item.daysLeft} Days left</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-1 right-1 bg-red-500/90 text-white !hover:bg-red-600 font-semibold px-1 py-1 h-6 text-xs"
                            onClick={() => handleRemoveFromBin(item.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
                <motion.div whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-8 sm:px-16 py-4 sm:py-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/20"
                    onClick={() => setShowRecoverModal(true)}
                  >
                    <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    RECOVER
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }} className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 sm:px-16 py-4 sm:py-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/20"
                    onClick={() => setShowRecycleModal(true)}
                  >
                    <Recycle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    RECYCLE
                  </Button>
                </motion.div>
              </div>
              <Dialog open={showRecoverModal} onOpenChange={setShowRecoverModal}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
                  <DialogHeader className="pb-6">
                    <DialogTitle className="flex items-center text-emerald-700 text-2xl">
                      <RotateCcw className="w-7 h-7 mr-3" />
                      Recovery Techniques
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Transform ingredients before they go bad with these smart recovery methods. Save money and reduce waste!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                    {recoverTechniques.map((technique, index) => (
                      <motion.div
                        key={technique.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white font-bold text-lg">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-emerald-800 mb-3 text-lg flex items-center">
                              {technique.title}
                              <span className="ml-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            </h4>
                            <p className="text-emerald-700 leading-relaxed">{technique.tip}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-emerald-200">
                    <p className="text-center text-sm text-emerald-600 font-medium">
                      💡 Pro tip: Combine multiple techniques for maximum waste reduction!
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showRecycleModal} onOpenChange={setShowRecycleModal}>
                <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
                  <DialogHeader className="pb-6">
                    <DialogTitle className="flex items-center text-green-700 text-2xl">
                      <Recycle className="w-7 h-7 mr-3" />
                      Recycling Techniques
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Give food waste a second life with these eco-friendly recycling methods. Help the planet while being resourceful!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                    {recycleTechniques.map((technique, index) => (
                      <motion.div
                        key={technique.title}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                            <Recycle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-green-800 mb-3 text-lg flex items-center">
                              {technique.title}
                              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            </h4>
                            <p className="text-green-700 leading-relaxed">{technique.tip}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-green-200">
                    <p className="text-center text-sm text-green-600 font-medium">
                      🌱 Every small action makes a big difference for our environment!
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {leftoverRecipes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Leftover Recipes</span>
            </h2>
            <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
              <CardContent className="p-8">
                {selectedLeftoverRecipe ? (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
                    <div className="mb-6">
                      <Button variant="ghost" onClick={() => setSelectedLeftoverRecipe(null)} className="hover:bg-emerald-50 text-emerald-700">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Leftover Recipes
                      </Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <motion.img
                          src={selectedLeftoverRecipe.image}
                          alt={selectedLeftoverRecipe.name}
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
                          <h3 className="text-3xl font-bold text-gray-900 mb-2">{selectedLeftoverRecipe.name}</h3>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                              <span>🕒 {selectedLeftoverRecipe.time}</span>
                              <Badge className="bg-emerald-100 text-emerald-700">
                                {selectedLeftoverRecipe.difficulty}
                              </Badge>
                            </div>
                            <div className="text-center space-y-1">
                              <div className="flex items-center justify-center space-x-4 text-sm">
                                <span className="font-medium text-emerald-600">
                                  {selectedLeftoverRecipe.calories} cal
                                </span>
                              </div>
                              {selectedLeftoverRecipe.nutritionBenefits && (
                                <p className="text-xs text-gray-500 italic">
                                  {selectedLeftoverRecipe.nutritionBenefits}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                            <p className="text-emerald-800 font-medium">♻️ Made from leftover ingredients to reduce waste!</p>
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
                            {selectedLeftoverRecipe.ingredients?.map((ingredient: string, index: number) => (
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
                            {selectedLeftoverRecipe.instructions?.map((instruction: { title: string; detail: string }, index: number) => (
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
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                            <Recycle className="w-4 h-4 mr-2" />
                            Sustainability Impact
                          </h5>
                          <p className="text-green-700 text-sm">
                            By using leftover ingredients, you're helping reduce food waste and supporting SDG 12: Responsible Consumption and Production. Every leftover meal makes a difference!
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-gray-600 mb-2">{leftoverRecipes.length} recipes generated from your leftover ingredients</p>
                        <div className="flex flex-wrap gap-2">
                          {wasteManagementItems.map((item, index) => (
                            <Badge key={index} className="bg-emerald-100 text-emerald-700 px-3 py-1">
                              {item.image} {item.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2">♻️ Zero Waste Cooking</Badge>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {leftoverRecipes.map((recipe, index) => (
                        <motion.div key={recipe.id || index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, duration: 0.3 }}>
                          <Card className="overflow-hidden cursor-pointer transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-lg hover:shadow-xl hover:scale-105 group" onClick={() => setSelectedLeftoverRecipe(recipe)}>
                            <div className="relative">
                              <img src={recipe.image} alt={recipe.name} loading="lazy" className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-white/90 text-gray-800 text-xs">{recipe.difficulty}</Badge>
                              </div>
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-green-500/90 text-white text-xs">♻️ Leftover</Badge>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2">
                                <h3 className="font-bold text-white text-sm mb-1">{recipe.name}</h3>
                                <div className="flex items-center justify-between text-xs text-white/90">
                                  <span>🕒 {recipe.time}</span>
                                  <span>{recipe.calories} cal</span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-8 text-center">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                        <h4 className="font-bold text-emerald-800 mb-2 flex items-center justify-center">
                          <Award className="w-5 h-5 mr-2" />
                          Supporting SDG 12: Responsible Consumption
                        </h4>
                        <p className="text-emerald-700">
                          You've transformed {wasteManagementItems.length} leftover ingredients into {leftoverRecipes.length} delicious recipes, preventing food waste and promoting sustainable cooking practices!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default InventoryPage;
