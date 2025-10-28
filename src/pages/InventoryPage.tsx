import React, { useState, useEffect } from 'react';
import { Apple, Carrot, Fish, Trash2, RotateCcw, Recycle, X, Loader2, ChefHat, Clock, Award, ArrowLeft, Pencil } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { getUserInventory, addToWasteBin, removeFromWasteBin, getUserWasteBin } from '../lib/firebase';
import { generateRecipesSmart } from '../lib/recipeGenerator';
import { sendExpiryNotification } from '../lib/resendService';
import { sendRecipeSuggestions } from '../lib/emailService';
import { deleteDoc, doc, addDoc, collection, Timestamp, updateDoc } from 'firebase/firestore';
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
  daysLeft: number;
  category?: string;
}

interface Recipe {
  id: string;
  name: string;
  time: string;
  image: string;
  difficulty: string;
  calories: number;
  ingredients: string[];
  instructions: Array<{ title: string; detail: string }>;
  nutritionBenefits?: string;
  usedIngredients?: string[];
  matchPercentage?: number;
  missingIngredients?: string[];
  createdAt: Date;
}

interface InventoryPageProps {
  auth: AuthState;
}

const categoryEmojis: { [key: string]: string } = {
  fruits: '🍎',
  vegetables: '🥕',
  proteins: '🍗',
  dairy: '🧀',
  grains: '🌾',
  general: '🥫',
};

function InventoryPage({ auth }: InventoryPageProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [wasteManagementItems, setWasteManagementItems] = useState<WasteItem[]>([]);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showRecycleModal, setShowRecycleModal] = useState(false);
  const [leftoverRecipes, setLeftoverRecipes] = useState<Recipe[]>([]);
  const [selectedLeftoverRecipe, setSelectedLeftoverRecipe] = useState<Recipe | null>(null);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ingredientImages, setIngredientImages] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; currentDays: number } | null>(null);
  const [newExpiryDays, setNewExpiryDays] = useState<string>('');

  // Fetch inventory and waste bin from Firestore
  useEffect(() => {
    const fetchData = async () => {
      if (!auth.user?.uid) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [inventoryResult, wasteResult] = await Promise.all([
          getUserInventory(auth.user.uid),
          getUserWasteBin(auth.user.uid),
        ]);

        if (inventoryResult.error) {
          setError(
            inventoryResult.error.includes('index')
              ? 'Firestore query requires an index. Please create it in the Firebase Console.'
              : inventoryResult.error
          );
        } else {
          setInventoryItems(inventoryResult.inventory as InventoryItem[]);
        }

        if (wasteResult.error) {
          console.error('Waste bin error:', wasteResult.error);
          setWasteManagementItems([]);
        } else {
          setWasteManagementItems(wasteResult.wasteItems as WasteItem[]);
        }

        // Fetch images for all items
        const allNames = [
          ...new Set([
            ...(inventoryResult.inventory?.map((item: any) => item.name) || []),
            ...(wasteResult.wasteItems?.map((item: any) => item.name) || []),
          ]),
        ];
        fetchIngredientImages(allNames);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch data';
        setError(
          errorMessage.includes('index')
            ? 'Firestore query requires an index. Please create it in the Firebase Console.'
            : errorMessage
        );
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [auth.user?.uid]);

  // Fetch food-related images from Pexels API
  const fetchIngredientImages = async (ingredientNames: string[]) => {
    const { getEnvVar } = await import('../lib/env');
    const apiKey = getEnvVar('VITE_PEXELS_API_KEY', '');
    const uniqueNames = [...new Set(ingredientNames)];

    for (const name of uniqueNames) {
      try {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(`${name} food ingredient`)}&per_page=1`,
          {
            headers: { Authorization: apiKey || '' },
          }
        );
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          setIngredientImages(prev => ({
            ...prev,
            [name]: data.photos[0].src.medium,
          }));
        } else {
          setIngredientImages(prev => ({
            ...prev,
            [name]: categoryEmojis['general'] || '🥫',
          }));
        }
      } catch (error) {
        console.error(`Error fetching image for ${name}:`, error);
        setIngredientImages(prev => ({
          ...prev,
          [name]: categoryEmojis['general'] || '🥫',
        }));
      }
    }
  };

  // Check for spoiling ingredients and send notifications
  useEffect(() => {
    const checkAndNotify = async () => {
      // Check for items expiring within 2 days
      const spoilingSoon = inventoryItems.filter(
        item => item.daysLeft !== undefined && item.daysLeft <= 2
      );

      if (spoilingSoon.length > 0 && auth.user?.email) {
        console.log('� EMAIL NOTIFICATION TRIGGER:', {
          spoilingItems: spoilingSoon.length,
          userEmail: auth.user.email,
          items: spoilingSoon.map(item => `${item.name} (${item.daysLeft} days left)`).join(', '),
        });

        try {
          const result = await sendExpiryNotification(
            auth.user.email,
            spoilingSoon.map(item => ({
              name: item.name,
              daysLeft: item.daysLeft!,
            }))
          );

          if (result.success) {
            console.log('✅ Expiry notification email sent successfully via Resend');
          } else {
            console.error('❌ Failed to send expiry notification:', result.error);
          }
        } catch (error) {
          console.error('❌ Email notification error:', error);
        }
      }
    };

    // Check once on mount
    checkAndNotify();
    
    // Check every 12 hours
    const notificationInterval = setInterval(checkAndNotify, 12 * 60 * 60 * 1000);
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

  const handleEditExpiry = (itemId: string, itemName: string, currentDays: number | undefined) => {
    setEditingItem({ id: itemId, name: itemName, currentDays: currentDays || 0 });
    setNewExpiryDays(currentDays?.toString() || '');
  };

  const handleSaveExpiry = async () => {
    if (!auth.user?.uid || !editingItem) return;
    
    const daysLeft = parseInt(newExpiryDays);
    if (isNaN(daysLeft) || daysLeft < 0) {
      alert('Please enter a valid number of days');
      return;
    }

    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + daysLeft);
      
      const itemRef = doc(db, 'inventory', editingItem.id);
      await updateDoc(itemRef, {
        daysLeft: daysLeft,
        expiryDate: Timestamp.fromDate(expiryDate),
      });
      
      setInventoryItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, daysLeft } : item
      ));
      
      setEditingItem(null);
      setNewExpiryDays('');
      console.log('✅ Expiry date updated successfully');
    } catch (error) {
      console.error('Error updating expiry:', error);
      alert('Failed to update expiry date');
    }
  };

  const handleAddToBin = async (itemId: string) => {
    const itemToMove = inventoryItems.find(item => item.id === itemId);
    if (!itemToMove || !auth.user?.uid) return;

    try {
      // Delete from inventory collection
      await deleteDoc(doc(db, 'inventory', itemId));

      // Add to wasteBin collection
      const { id: newId, error } = await addToWasteBin(auth.user.uid, {
        name: itemToMove.name,
        daysLeft: itemToMove.daysLeft,
        category: itemToMove.category,
      });

      if (error) {
        throw new Error(error);
      }

      const newWasteItem: WasteItem = {
        id: newId!,
        name: itemToMove.name,
        daysLeft: itemToMove.daysLeft || 7,
        category: itemToMove.category,
      };

      // Update local state
      setWasteManagementItems(prev => [...prev, newWasteItem]);
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));

      // Fetch image for the new waste item if not already fetched
      if (!ingredientImages[itemToMove.name]) {
        await fetchIngredientImages([itemToMove.name]);
      }

      console.log('✅ Moved item to waste management bin:', itemToMove.name);
    } catch (err) {
      console.error('❌ Error moving item to waste bin:', err);
      setError('Failed to move item to waste bin');
    }
  };

  const handleRemoveFromBin = async (itemId: string) => {
    try {
      await removeFromWasteBin(itemId);
      setWasteManagementItems(prev => prev.filter(item => item.id !== itemId));
      console.log('✅ Removed item from waste management bin:', itemId);
    } catch (err) {
      console.error('❌ Error removing item from waste bin:', err);
      setError('Failed to remove item from waste bin');
    }
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
      
      if (!apiKey) {
        console.error('No OpenAI API key found');
        setIsGeneratingRecipes(false);
        return;
      }

      // Clear previous leftover recipes before starting
      setLeftoverRecipes([]);
      
      let allSavedRecipes: Recipe[] = [];
      
      // Use progressive generation for faster perceived performance
      const { generateRecipesProgressive } = await import('../lib/recipeGenerator');
      
      const recipeResult = await generateRecipesProgressive(
        ingredientNames,
        apiKey,
        12, // Total recipes (3 batches)
        4,  // Batch size - 4 recipes per batch
        async (batch, batchNumber, totalBatches) => {
          // Save and display each batch as it arrives
          console.log(`✅ Received leftover batch ${batchNumber}/${totalBatches} with ${batch.length} recipes`);
          const savedBatch: Recipe[] = [];
          for (const recipe of batch) {
            const docRef = await addDoc(collection(db, 'leftoverRecipes'), {
              ...recipe,
              userId: auth.user?.uid,
              createdAt: Timestamp.now(),
              isLeftover: true, // Mark as leftover recipe
            });
            await updateDoc(docRef, { id: docRef.id });
            const savedRecipe: Recipe = {
              ...recipe,
              id: docRef.id,
              createdAt: new Date(),
            } as Recipe;
            savedBatch.push(savedRecipe);
            allSavedRecipes.push(savedRecipe);
          }
          
          // FORCE UI UPDATE - create new array reference
          const updatedRecipes = [...allSavedRecipes];
          setLeftoverRecipes(updatedRecipes);
          console.log(`🎨 UI FORCE UPDATE with ${updatedRecipes.length} leftover recipes, IDs:`, updatedRecipes.map(r => r.id));
          console.log(`📸 Leftover Images:`, updatedRecipes.map(r => ({ name: r.name, image: r.image })));
          
          // CRITICAL: Stop loading spinner after first batch so recipes display!
          if (batchNumber === 1) {
            setIsGeneratingRecipes(false);
            console.log(`🎬 Loading spinner STOPPED - leftover recipes now visible!`);
            
            // Send email with first batch of recipe suggestions
            if (auth.user?.email && updatedRecipes.length > 0) {
              console.log('📧 Sending recipe suggestions email...');
              await sendRecipeSuggestions(auth.user.email, updatedRecipes.slice(0, 3), ingredientNames);
            }
          }
        }
      );
      
      console.log('✅ All leftover recipes generated:', recipeResult.length, 'total');
    } catch (error) {
      console.error('❌ Error generating leftover recipes:', error);
      setError('Failed to generate leftover recipes');
      setIsGeneratingRecipes(false); // Stop spinner on error
    }
    // Note: No finally block needed - spinner stops after batch 1
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
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
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
              {inventoryItems.filter(item => item.daysLeft !== undefined && item.daysLeft <= 3).length > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-amber-100 border border-amber-300 px-3 py-2 rounded-lg">
                  <span className="text-amber-800 text-sm font-medium">
                    📧 Notification sent for {inventoryItems.filter(item => item.daysLeft !== undefined && item.daysLeft <= 3).length} expiring items
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {inventoryItems.map((item, index) => {
                    // Determine urgency level
                    const isCritical = item.daysLeft !== undefined && item.daysLeft <= 1;
                    const isUrgent = item.daysLeft !== undefined && item.daysLeft <= 3 && !isCritical;
                    const isWarning = item.daysLeft !== undefined && item.daysLeft <= 7 && !isUrgent && !isCritical;
                    
                    return (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card 
                        className="bg-gradient-to-r from-emerald-400/80 to-teal-400/80 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden border-0"
                        style={{
                          ...(isCritical && {
                            boxShadow: '0 0 0 4px rgb(239 68 68), 0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                          }),
                          ...(isUrgent && {
                            boxShadow: '0 0 0 4px rgb(251 146 60), 0 10px 15px -3px rgb(0 0 0 / 0.1)'
                          }),
                          ...(isWarning && {
                            boxShadow: '0 0 0 2px rgb(250 204 21), 0 10px 15px -3px rgb(0 0 0 / 0.1)'
                          })
                        }}
                      >
                        {/* Urgency Corner Ribbon - Only for Critical */}
                        {isCritical && (
                          <div className="absolute -top-1 -right-1 w-24 h-24 overflow-hidden z-20">
                            <div className="absolute transform rotate-45 bg-red-600 text-white text-xs font-bold py-1 right-[-35px] top-[15px] w-[170px] text-center shadow-lg">
                              🚨 URGENT!
                            </div>
                          </div>
                        )}
                        
                        <CardContent className="p-6 relative flex flex-col items-center">
                          {/* Urgency Badge - Top Left */}
                          {item.daysLeft !== undefined && item.daysLeft <= 3 && (
                            <Badge className={`
                              absolute top-2 left-2 font-bold text-xs z-10 shadow-lg
                              ${
                                isCritical
                                  ? 'bg-red-500 text-white animate-bounce' 
                                  : 'bg-orange-500 text-white'
                              }
                            `}>
                              {item.daysLeft === 0 ? '🚨 TODAY!' : item.daysLeft === 1 ? '⚠️ TOMORROW' : `⏰ ${item.daysLeft}d`}
                            </Badge>
                          )}
                          
                          <div className="flex items-center space-x-3 sm:space-x-4 pr-10 sm:pr-14 mb-4 mt-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 overflow-hidden">
                              {ingredientImages[item.name] ? (
                                <img
                                  src={ingredientImages[item.name]}
                                  alt={`${item.name} image`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg">{categoryEmojis[item.category || 'general'] || '🥫'}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-white text-sm sm:text-lg truncate">{item.name}</h3>
                              <p className="text-white/90 text-xs sm:text-sm font-medium">
                                {item.daysLeft !== undefined ? `${item.daysLeft} Days left` : 'No expiry'}
                                {item.quantity && item.unit && ` • ${item.quantity} ${item.unit}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-center mt-3 w-full">
                          <button
                            className="inline-flex items-center justify-center bg-red-500 text-white hover:bg-red-700 hover:scale-110 hover:shadow-xl transition-all duration-300 font-semibold px-2 py-1 sm:px-3 sm:py-2 h-6 sm:h-7 text-xs shadow-md rounded-md border-0"
                            onClick={() => handleAddToBin(item.id)}
                          >
                            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                            <span className="hidden sm:inline">Bin</span>
                          </button>
                          </div>
                          <div className="absolute top-1 right-1 flex space-x-1">
                            <button
                              className="inline-flex items-center justify-center bg-blue-500 text-white hover:bg-blue-700 hover:scale-110 transition-all duration-300 font-semibold px-2 py-1 h-6 sm:h-7 text-xs shadow-md rounded-md border-0"
                              onClick={() => handleEditExpiry(item.id, item.name, item.daysLeft)}
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              className="inline-flex items-center justify-center bg-white/20 text-white hover:bg-red-500 hover:scale-110 hover:rotate-90 hover:shadow-xl transition-all duration-300 font-semibold px-1.5 py-1 h-6 sm:h-7 text-xs shadow-md rounded-md border-0"
                              onClick={() => handleDeleteFromInventory(item.id)}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )})}
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <p className="text-gray-600 text-center sm:text-left">Items moved here can be used for recipes or recycling</p>
                <Button
                  onClick={handleGenerateLeftoverRecipes}
                  disabled={isGeneratingRecipes || wasteManagementItems.length === 0}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto whitespace-nowrap"
                >
                  {isGeneratingRecipes ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-5 h-5 mr-2" />
                      Generate Leftover Recipes
                    </>
                  )}
                </Button>
              </div>
              {wasteManagementItems.length === 0 ? (
                <p className="text-gray-500 text-center py-12">Waste bin is empty. Good job reducing waste!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wasteManagementItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gradient-to-r from-emerald-400/80 to-teal-400/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <CardContent className="p-6 relative">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                              {ingredientImages[item.name] ? (
                                <img
                                  src={ingredientImages[item.name]}
                                  alt={`${item.name} image`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-lg">{categoryEmojis[item.category || 'general'] || '🥫'}</span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-white">{item.name}</h3>
                              <p className="text-white/90 text-sm">
                                {item.daysLeft !== undefined ? `${item.daysLeft} Days left` : 'No expiry'}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-4 right-4 bg-white/20 text-white hover:bg-red-500"
                            onClick={() => handleRemoveFromBin(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-8">
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
                              {categoryEmojis[item.category || 'general'] || '🥫'} {item.name}
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

      {/* Edit Expiry Dialog */}
      <Dialog open={editingItem !== null} onOpenChange={(open: boolean) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expiry Date</DialogTitle>
            <DialogDescription>
              Update the expiry date for {editingItem?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="expiryDays" className="text-sm font-medium text-gray-700">
                Days until expiry
              </label>
              <Input
                id="expiryDays"
                type="number"
                min="0"
                value={newExpiryDays}
                onChange={(e) => setNewExpiryDays(e.target.value)}
                placeholder="Enter number of days"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Current: {editingItem?.currentDays || 0} days left
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                onClick={handleSaveExpiry}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InventoryPage;
