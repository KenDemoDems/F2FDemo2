// Type definitions for FridgeToFork application

export interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

export interface UserSettings {
  notifications: boolean;
}

export interface DetectedIngredient {
  name: string;
  confidence: number;
  category: string;
  detectionMethod?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  image: string;
  daysLeft: number;
  addedDate?: Date;
  category?: string;
}

export interface WasteItem {
  id: string;
  name: string;
  image: string;
  disposedAt: Date;
  reason?: string;
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
  usedIngredients: string[];
  matchPercentage?: number;
  missingIngredients?: string[];
}

export interface MealPlanDay {
  day: string;
  date: string;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
  };
}
