import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { getDoc, doc } from 'firebase/firestore';
import { signOut, Auth } from 'firebase/auth';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  logOut,
  onAuthStateChange,
  updateUserSettings,
  getUserSettings,
  db
} from './lib/firebase';
import { sendWelcomeEmail } from './lib/emailService';
import { getUserRecipes, getUserIngredients } from './lib/firebase';

// Import extracted components
import HomePage from './pages/HomePage';
import InventoryPage from './pages/InventoryPage';
import MealPlanPage from './pages/MealPlanPage';
import AboutPage from './pages/AboutPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import HeroSection from './components/sections/HeroSection';
import SDG12Section from './components/sections/SDG12Section';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollIndicator } from './components/common/ScrollIndicator';
import { LoginModal } from './components/auth/LoginModal'; // Import LoginModal from LoginModal.tsx

// Authentication context
interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

interface UserSettings {
  notifications: boolean;
}

// Main App Component
export default function App() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAccessFeature, setLoginAccessFeature] = useState<string | undefined>(undefined);
  const [loginDefaultTab, setLoginDefaultTab] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState('home');
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isLoggedIn: false
  });
  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: true,
  });
  const [sharedRecipes, setSharedRecipes] = useState<any[]>([]);
  const [sharedIngredients, setSharedIngredients] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        let name = firebaseUser.displayName || 'User';
        if (!firebaseUser.displayName) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            name = data.name || 'User';
          } else {
            await signOut(auth as unknown as Auth);
            setAuth({ user: null, isLoggedIn: false });
            return;
          }
        }

        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: name,
          photoURL: firebaseUser.photoURL || undefined
        };

        setAuth({ user, isLoggedIn: true });

        try {
          const settingsResult = await getUserSettings(firebaseUser.uid);
          if (!settingsResult.error && settingsResult.settings) {
            setUserSettings(settingsResult.settings);
          }
        } catch (error) {
          console.error('Failed to load user settings:', error);
          setUserSettings({ notifications: true });
        }

        // Load recipes and ingredients
        try {
          const recipesResult = await getUserRecipes(firebaseUser.uid);
          if (!recipesResult.error && recipesResult.recipes.length > 0) {
            const recipes = recipesResult.recipes.map((recipe, index) => ({
              ...recipe,
              id: recipe.id || `recipe-${index}`,
            }));
            setSharedRecipes(recipes);
            console.log('App: loaded shared recipes from Firebase:', recipes.length);
          }

          const ingredientsResult = await getUserIngredients(firebaseUser.uid);
          if (!ingredientsResult.error && ingredientsResult.ingredients.length > 0) {
            const ingredientNames = ingredientsResult.ingredients.map(ing => ing.name);
            setSharedIngredients(ingredientNames);
            console.log('App: loaded shared ingredients from Firebase:', ingredientNames.length);
          }
        } catch (error) {
          console.error('Failed to load recipes/ingredients:', error);
        }
      } else {
        setAuth({ user: null, isLoggedIn: false });
        setUserSettings({ notifications: true });
        setSharedRecipes([]);
        setSharedIngredients([]);
        console.log('App: cleared shared recipes/ingredients on logout');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    setAuth({ user, isLoggedIn: true });
    if (loginAccessFeature === 'Meal Plan') {
      setCurrentPage('meal-plan');
    }
    setLoginAccessFeature(undefined);
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setAuth({ user: null, isLoggedIn: false });
      setCurrentPage('home');
      setUserSettings({ notifications: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSettingsChange = async (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    if (auth.user?.uid) {
      try {
        await updateUserSettings(auth.user.uid, newSettings);
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  };

  const handleNavigate = (page: string) => {
    if (!auth.isLoggedIn && page === 'home') {
      setCurrentPage('home');
    } else {
      setCurrentPage(page);
    }
    setSelectedRecipe(null);
  };

  if (selectedRecipe && auth.isLoggedIn) {
    return (
      <RecipeDetailPage
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
      />
    );
  }

  if (auth.isLoggedIn) {
    return (
      <div className="min-h-screen">
        <Navbar
          auth={auth}
          onShowLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          setShowLoginModal={setShowLoginModal}
          setLoginAccessFeature={setLoginAccessFeature}
          userSettings={userSettings}
          onSettingsChange={handleSettingsChange}
        />
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            auth={auth}
            sharedRecipes={sharedRecipes}
            setSharedRecipes={setSharedRecipes}
            sharedIngredients={sharedIngredients}
            setSharedIngredients={setSharedIngredients}
          />
        )}
        {currentPage === 'inventory' && <InventoryPage auth={auth} />}
        {currentPage === 'meal-plan' && <MealPlanPage />}
        {currentPage === 'about' && <AboutPage auth={auth} onNavigate={handleNavigate} />}
        <Footer />
      </div>
    );
  }

  if (currentPage === 'about') {
    return (
      <div className="min-h-screen">
        <Navbar
          auth={auth}
          onShowLogin={() => setShowLoginModal(true)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          setShowLoginModal={setShowLoginModal}
          setLoginAccessFeature={setLoginAccessFeature}
          userSettings={userSettings}
          onSettingsChange={handleSettingsChange}
        />
        <AboutPage auth={auth} onNavigate={handleNavigate} />
        <Footer />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => {
            setShowLoginModal(false);
            setLoginAccessFeature(undefined);
          }}
          onLogin={handleLogin}
          accessFeature={loginAccessFeature}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ScrollIndicator />
      <Navbar
        auth={auth}
        onShowLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        setShowLoginModal={setShowLoginModal}
        setLoginAccessFeature={setLoginAccessFeature}
        userSettings={userSettings}
        onSettingsChange={handleSettingsChange}
      />
      <HeroSection />
      <SDG12Section 
        onShowLogin={() => setShowLoginModal(true)} 
        onShowSignup={() => {
          setLoginDefaultTab('signup');
          setShowLoginModal(true);
        }}
      />
      <Footer />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setLoginAccessFeature(undefined);
          setLoginDefaultTab('login');
        }}
        onLogin={handleLogin}
        accessFeature={loginAccessFeature}
        defaultTab={loginDefaultTab}
      />
    </div>
  );
}
