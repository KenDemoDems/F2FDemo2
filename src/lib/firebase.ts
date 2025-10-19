// Firebase Configuration and Integration
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

import { getEnvVar, getFirebaseConfig } from './env';

// Firebase configuration loaded from environment variables
const firebaseConfig = getFirebaseConfig();


// Check if we're in development mode with demo config
const isDemoMode = firebaseConfig.apiKey === "demo-api-key";
if (isDemoMode) {
  console.log("🔧 Firebase running in DEMO MODE with mock data.");
  console.log("💡 To use real Firebase: Update environment variables in .env.local file");
} else {
  console.log("✅ Firebase configured with production settings");
}

// Initialize Firebase with error handling
let app: any;
let auth: any;
let storage: any;
let db: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  storage = getStorage(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
  auth = null;
  storage = null;
  db = null;
}

export { auth, storage, db };

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Types
export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  detectedAt: Date;
  addedManually: boolean;
  confidence?: number;
  expiryDate?: Date;
  category?: string;
}

export interface Recipe {
  id: string;
  name: string;
  image: string;
  time: string;
  difficulty: string;
  calories: number;
  ingredients: string[];
  instructions: Array<{ title: string; detail: string }>;
  nutritionBenefits: string;
  createdAt: Date;
  usedIngredients: string[];
}

export interface MealPlanEntry {
  id: string;
  userId: string;
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  recipe: Recipe;
  scheduledDate: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  expiryDate?: string;
  userId: string;
  addedDate: string;
  daysLeft?: number;
}

// Authentication Functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    if (isDemoMode) {
      // Demo mode: simulate successful login
      console.log("🔧 Demo mode: Simulating email login for", email);
      const mockUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0] || 'Demo User'
      };
      return { user: mockUser as any, error: null };
    }

    const result = await signInWithEmailAndPassword(auth, email, password);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Simulating email signup for", email);
      const mockUser = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: name
      };
      return { user: mockUser as any, error: null };
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);

    // Ensure displayName is set before proceeding
    await updateProfile(result.user, { displayName: name });
    console.log("🔍 After updateProfile, displayName:", result.user.displayName); // Debug

    // Create user profile in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      name: name,
      createdAt: Timestamp.now(),
      settings: {
        notifications: true,
      }
    });

    // Force reload to ensure displayName is updated
    await result.user.reload();
    console.log("🔍 After reload, displayName:", result.user.displayName); // Debug

    return { user: result.user, error: null };
  } catch (error: any) {
    console.error("Signup error details:", error);
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    if (isDemoMode) {
      // Demo mode: simulate Google login
      console.log("🔧 Demo mode: Simulating Google login");
      const mockUser = {
        uid: 'demo-google-user-' + Date.now(),
        email: 'demo@google.com',
        displayName: 'Demo Google User',
        photoURL: null
      };
      return { user: mockUser as any, error: null };
    }

    const result = await signInWithPopup(auth, googleProvider);

    // Check if user profile exists, create if not
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL,
        createdAt: Timestamp.now(),
        settings: {
          notifications: true,
        }
      });
    }

    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const logOut = async () => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Simulating logout");
      return { error: null };
    }

    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Storage Functions
export const uploadImageToStorage = async (file: File, userId: string) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Simulating image upload for", file.name);
      // Create a fake URL for demo
      const mockUrl = URL.createObjectURL(file);
      return { url: mockUrl, path: `demo/${file.name}`, error: null };
    }

    const timestamp = Date.now();
    const fileName = `fridge-photos/${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return { url: downloadURL, path: fileName, error: null };
  } catch (error: any) {
    return { url: null, path: null, error: error.message };
  }
};

export const deleteImageFromStorage = async (imagePath: string) => {
  try {
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Firestore Functions - Ingredients
export const saveDetectedIngredients = async (userId: string, ingredients: Ingredient[]) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Simulating save ingredients for", userId, ingredients);
      return { error: null };
    }

    const batch = ingredients.map(ingredient =>
      addDoc(collection(db, 'detectedIngredients'), {
        ...ingredient,
        userId,
        detectedAt: Timestamp.now()
      })
    );

    await Promise.all(batch);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserIngredients = async (userId: string) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Returning demo ingredients for", userId);
      // Return demo ingredients
      const demoIngredients: Ingredient[] = [
        { id: '1', name: 'Apple', detectedAt: new Date(), addedManually: false, confidence: 0.95, category: 'fruits' },
        { id: '2', name: 'Tomato', detectedAt: new Date(), addedManually: false, confidence: 0.89, category: 'vegetables' },
        { id: '3', name: 'Cheese', detectedAt: new Date(), addedManually: false, confidence: 0.82, category: 'dairy' },
        { id: '4', name: 'Milk', detectedAt: new Date(), addedManually: false, confidence: 0.78, category: 'dairy' }
      ];
      return { ingredients: demoIngredients, error: null };
    }

    const q = query(
      collection(db, 'detectedIngredients'),
      where('userId', '==', userId),
      orderBy('detectedAt', 'desc'),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    const ingredients: Ingredient[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ingredients.push({
        id: doc.id,
        ...data,
        detectedAt: data.detectedAt.toDate()
      } as Ingredient);
    });

    return { ingredients, error: null };
  } catch (error: any) {
    return { ingredients: [], error: error.message };
  }
};

export const addManualIngredient = async (userId: string, ingredientName: string) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Simulating add manual ingredient", ingredientName, "for", userId);
      return { error: null };
    }

    const ingredient: Omit<Ingredient, 'id'> = {
      name: ingredientName,
      detectedAt: new Date(),
      addedManually: true,
      confidence: 1.0
    };

    await addDoc(collection(db, 'detectedIngredients'), {
      ...ingredient,
      userId,
      detectedAt: Timestamp.now()
    });

    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

// Firestore Functions - Recipes
export const saveGeneratedRecipes = async (userId: string, recipes: Recipe[]) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Simulating save recipes for", userId, recipes.length, "recipes");
      return { error: null };
    }

    const batch = recipes.map(recipe =>
      addDoc(collection(db, 'generatedRecipes'), {
        ...recipe,
        userId,
        createdAt: Timestamp.now()
      })
    );

    await Promise.all(batch);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserRecipes = async (userId: string) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Returning demo recipes for", userId);
      return { recipes: [], error: null };
    }

    const q = query(
      collection(db, 'generatedRecipes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(25)
    );

    const querySnapshot = await getDocs(q);
    const recipes: Recipe[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recipes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate()
      } as Recipe);
    });

    return { recipes, error: null };
  } catch (error: any) {
    return { recipes: [], error: error.message };
  }
};

// Firestore Functions - Inventory
export const updateInventory = async (userId: string, ingredients: string[]) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Simulating inventory update for", userId, ingredients);
      return { error: null };
    }

    // Get existing inventory
    const q = query(
      collection(db, 'inventory'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    const existingItems = new Set();

    querySnapshot.forEach((doc) => {
      existingItems.add(doc.data().name.toLowerCase());
    });

    // Add new ingredients to inventory
    const newItems = ingredients.filter(ingredient =>
      !existingItems.has(ingredient.toLowerCase())
    );

    const batch = newItems.map(ingredient =>
      addDoc(collection(db, 'inventory'), {
        userId,
        name: ingredient,
        quantity: 1,
        unit: 'piece',
        addedDate: Timestamp.now(),
        category: 'general',
        fromDetection: true
      })
    );

    await Promise.all(batch);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserInventory = async (userId: string): Promise<{ inventory: InventoryItem[]; error?: string }> => {
  try {
    const q = query(
      collection(db, 'inventory'),
      where('userId', '==', userId),
      orderBy('addedDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const inventory = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as InventoryItem[];
    return { inventory };
  } catch (error: any) {
    return { inventory: [], error: error.message };
  }
};

// Firestore Functions - Meal Plan
export const saveMealPlan = async (userId: string, mealPlan: Omit<MealPlanEntry, 'id'>[]) => {
  try {
    const batch = mealPlan.map(entry =>
      addDoc(collection(db, 'mealPlan'), {
        ...entry,
        userId,
        scheduledDate: Timestamp.fromDate(entry.scheduledDate)
      })
    );

    await Promise.all(batch);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserMealPlan = async (userId: string, weekStart: Date, weekEnd: Date) => {
  try {
    const q = query(
      collection(db, 'mealPlan'),
      where('userId', '==', userId),
      where('scheduledDate', '>=', Timestamp.fromDate(weekStart)),
      where('scheduledDate', '<=', Timestamp.fromDate(weekEnd)),
      orderBy('scheduledDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const mealPlan: MealPlanEntry[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      mealPlan.push({
        id: doc.id,
        ...data,
        scheduledDate: data.scheduledDate.toDate()
      } as MealPlanEntry);
    });

    return { mealPlan, error: null };
  } catch (error: any) {
    return { mealPlan: [], error: error.message };
  }
};

// User Settings
export const updateUserSettings = async (userId: string, settings: any) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Simulating settings update for", userId, settings);
      return { error: null };
    }

    await updateDoc(doc(db, 'users', userId), {
      settings,
      updatedAt: Timestamp.now()
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const getUserSettings = async (userId: string) => {
  try {
    if (isDemoMode) {
      console.log("🔧 Demo mode: Returning demo settings for", userId);
      return { settings: { notifications: true }, error: null };
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return { settings: data.settings || { notifications: true }, error: null };
    } else {
      return { settings: { notifications: true }, error: 'User not found' };
    }
  } catch (error: any) {
    return { settings: { notifications: true }, error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  if (isDemoMode) {
    // Demo mode: return a no-op unsubscribe function
    console.log("🔧 Demo mode: Auth state observer disabled");
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

export default app;
