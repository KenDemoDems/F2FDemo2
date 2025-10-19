import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
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
import { getDoc, doc } from 'firebase/firestore';
import { signOut, Auth } from 'firebase/auth';
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

// LoginModal component
function LoginModal({ isOpen, onClose, onLogin, accessFeature }: {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  accessFeature?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signInWithEmail(loginData.email, loginData.password);
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        onLogin({
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName
        });
        onClose();
        setError('');
      }
    } catch (error: any) {
      setError('Login failed. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const result = await signUpWithEmail(signupData.email, signupData.password, signupData.name);
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        await sendWelcomeEmail(result.user.email || '', signupData.name);
        onLogin({
          uid: result.user.uid,
          email: result.user.email || '',
          name: signupData.name
        });
        onClose();
        setError('');
      }
    } catch (error: any) {
      setError('Signup failed. Please try again.');
      console.error('Signup error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        onLogin({
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'User'
        });
        onClose();
        setError('');
      }
    } catch (error: any) {
      setError('Google sign-in failed. Please try again.');
      console.error('Google sign-in error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {accessFeature ? `Sign in to access ` : 'Welcome Back'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-300">
            {accessFeature
              ? `Please sign in or create an account to use `
              : 'Sign in to your account or create a new one'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=""
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="bg-white/50 dark:bg-gray-800/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                Sign In
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder=""
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    className="bg-white/50 dark:bg-gray-800/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=""
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                  className="bg-white/50 dark:bg-gray-800/50"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Main App Component
export default function App() {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAccessFeature, setLoginAccessFeature] = useState<string | undefined>(undefined);
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
        {currentPage === 'meal-plan' && <MealPlanPage recipes={sharedRecipes} />}
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
      <SDG12Section />
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
