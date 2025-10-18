import React, { useState, useEffect, useRef } from 'react';
import { Upload, Camera, ChefHat, Sparkles, Apple, Carrot, Fish, Clock, Users, ArrowLeft, Refrigerator, X, Eye, EyeOff, Trash2, RotateCcw, Recycle, Package, Calendar, Plus, Star, Heart, Award, Github, Linkedin, Mail, Settings, Bell, BellOff, Moon, Sun, KeyRound, ChevronDown, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './components/ui/dropdown-menu';
import { Switch } from './components/ui/switch';
import imgImage5 from "./assets/3fedb2d27086faff5fd5d4e559738aa7837ac176.png";
import imgImage6 from "./assets/2780e8169c075695ce0c5190b09759e545a810b6.png";
import imgImage7 from "./assets/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png";
import imgImage8 from "./assets/2e5eaf280bc2a4732907cd4c7a025b119a66136f.png";
import imgGeminiGeneratedImageTr9Lmtr9Lmtr9Lmt1 from "./assets/fd3d181f9b03b45cb1db14a2f11330c6278969a7.png";
import imgPngtreeMinimalistScanCodeBorder59220522 from "./assets/e1deeedc6479c024d11143fe969beb240104f171.png";
import imgImage1 from "./assets/c37715fd3b771e06f7d2eedbe414ca92f6f54708.png";

// Integrated Services
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  logOut,
  onAuthStateChange,
  uploadImageToStorage,
  saveDetectedIngredients,
  getUserIngredients,
  saveGeneratedRecipes,
  getUserRecipes,
  updateInventory,
  getUserInventory,
  updateUserSettings,
  getUserSettings,
  addManualIngredient,
  db,
  auth,
  Ingredient
} from './lib/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { signOut, Auth } from 'firebase/auth';
import { analyzeImageWithGoogleVision } from './lib/googleVision';

// Type for detected ingredients from Google Vision
interface DetectedIngredient {
  name: string;
  confidence: number;
  category: string;
  detectionMethod?: string;
}
import { generateRecipes, generateRecipesWithImages, generateRecipesByDiet, getRecipesForMealPlan, generateRecipesSmart } from './lib/recipeGenerator';
// Vite env type fix for TypeScript
interface ImportMeta {
  env: {
    VITE_OPENAI_API_KEY?: string;
    [key: string]: any;
  };
}
import { sendSpoilingReminder, sendWelcomeEmail, sendRecipeSuggestions } from './lib/emailService';

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

interface InventoryItem {
  id: string;
  name: string;
  image: string;
  daysLeft: number;
  addedDate?: Date;
  category?: string;
}

interface WasteItem {
  id: string;
  name: string;
  image: string;
  disposedAt: Date;
  reason?: string;
}

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
        // Send welcome email
        await sendWelcomeEmail(result.user.email || '', signupData.name);

        onLogin({
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || signupData.name
        });
        onClose();
        setError('');
      }
    } catch (error: any) {
      setError('Signup failed. Please try again.');
      console.error('Signup error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        onLogin({
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || 'Google User',
          photoURL: result.user.photoURL || undefined
        });
        onClose();
        setError('');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        // Send welcome email for new Google users
        await sendWelcomeEmail(result.user.email || '', result.user.displayName || 'Google User');

        onLogin({
          uid: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || 'Google User',
          photoURL: result.user.photoURL || undefined
        });
        onClose();
        setError('');
      }
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Google signup failed');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md dark:glass dark:border-white/10">
        <DialogHeader>
          <DialogTitle className="text-center dark:text-gray-100">
            {accessFeature ? `Access ${accessFeature}` : 'Welcome to FridgeToFork'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-300">
            {accessFeature
              ? `Please sign in to access ${accessFeature} and unlock all FridgeToFork features.`
              : 'Sign in to your account or create a new one to get started with AI-powered recipe suggestions.'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 dark:emerald-gradient dark:hover:brightness-110 text-white">
                Log In
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm text-gray-500">
              Demo: ken@example.com / password123
            </div>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            {/* Google Signup Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50"
              onClick={handleGoogleSignup}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or create account with email</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  placeholder="Enter your name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 dark:emerald-gradient dark:hover:brightness-110 text-white">
                Sign Up
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function FloatingElement({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 5, 0],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight, 1);

      setScrollProgress(progress);

      // Show indicator when user starts scrolling
      if (scrollTop > 50 && !hasScrolled) {
        setHasScrolled(true);
        setIsVisible(true);
      }

      // Show indicator when scrolling
      if (hasScrolled) {
        setIsVisible(true);

        // Clear existing timeout
        clearTimeout(timeoutId);

        // Hide after 2 seconds of no scrolling
        timeoutId = setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [hasScrolled]);

  if (!hasScrolled || !isVisible) return null;

  return (
    <motion.div
      className="fixed left-8 top-1/2 -translate-y-1/2 z-40 hidden lg:block"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-96">
        {/* String/Line */}
        <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-300 -translate-x-1/2"></div>

        {/* Moving Circle */}
        <motion.div
          className="absolute left-1/2 w-4 h-4 bg-emerald-500 rounded-full -translate-x-1/2 shadow-lg"
          style={{
            top: `${scrollProgress * (384 - 16)}px`,
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
        </motion.div>

        {/* Progress markers */}
        <div className="absolute left-1/2 top-0 w-2 h-2 bg-gray-400 rounded-full -translate-x-1/2"></div>
        <div className="absolute left-1/2 bottom-0 w-2 h-2 bg-gray-400 rounded-full -translate-x-1/2"></div>
      </div>
    </motion.div>
  );
}

function Navbar({ auth, onShowLogin, onLogout, onNavigate, setShowLoginModal, setLoginAccessFeature, userSettings, onSettingsChange }: {
  auth: AuthState;
  onShowLogin: () => void;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  setShowLoginModal?: (show: boolean) => void;
  setLoginAccessFeature?: (feature: string | undefined) => void;
  userSettings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  if (auth.isLoggedIn) {
    // Homepage Navbar - matching landing page style
    return (
      <nav className="relative z-50 bg-white/80 dark:nav-glass backdrop-blur-lg border-b border-white/20 dark:border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                FridgeToFork
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => onNavigate?.('home')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Home</button>
              <button onClick={() => onNavigate?.('inventory')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Inventory</button>
              <button onClick={() => onNavigate?.('meal-plan')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Meal Plan</button>
              <button onClick={() => onNavigate?.('about')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">About</button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                className="p-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <ChevronDown className="w-5 h-5" />
              </Button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-12 w-48 bg-white dark:glass rounded-lg shadow-xl border border-gray-200 dark:border-white/10 py-2 z-50"
                  >
                    <button
                      onClick={() => { onNavigate?.('home'); setIsDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Home
                    </button>
                    <button
                      onClick={() => { onNavigate?.('inventory'); setIsDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Inventory
                    </button>
                    <button
                      onClick={() => { onNavigate?.('meal-plan'); setIsDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Meal Plan
                    </button>
                    <button
                      onClick={() => { onNavigate?.('about'); setIsDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      About
                    </button>
                  </motion.div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-200 font-medium hidden sm:inline">
                {auth.user?.name}
              </span>

              {/* User Settings Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full bg-emerald-100 dark:glass border-2 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:glass-strong transition-colors p-0 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    {auth.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </Button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <>
                    {/* Overlay to close dropdown when clicking outside */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />

                    {/* Dropdown Content */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-12 w-64 bg-white dark:glass rounded-lg shadow-xl border border-gray-200 dark:border-white/10 py-2 z-50"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{auth.user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{auth.user?.email || 'user@example.com'}</p>
                      </div>

                      {/* Settings Section */}
                      <div className="px-4 py-2 space-y-2">
                        {/* Email Notifications Toggle */}
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-2">
                            {userSettings.notifications ? <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <BellOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                            <span className="text-sm text-gray-700 dark:text-gray-200">Email Notifications</span>
                          </div>
                          <Switch
                            checked={userSettings.notifications}
                            onCheckedChange={(checked: boolean) =>
                              onSettingsChange({ ...userSettings, notifications: checked })
                            }
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>

                      {/* Reset Password */}
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          // TODO: Implement reset password functionality
                          console.log('Reset password clicked');
                        }}
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        Reset Password
                      </button>

                      <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>

                      {/* Logout */}
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center transition-colors"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onLogout();
                        }}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Landing Page Navbar
  return (
    <nav className="relative z-50 bg-white/80 dark:nav-glass backdrop-blur-lg border-b border-white/20 dark:border-white/10 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              FridgeToFork
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => onNavigate?.('home')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Home</button>
            <button onClick={() => {
              // Prompt user to login for Meal Plan access
              setLoginAccessFeature?.('Meal Plan');
              setShowLoginModal?.(true);
            }} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Meal Plan</button>
            <button onClick={() => onNavigate?.('about')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">About</button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Mobile Navigation */}
            <div className="md:hidden relative">
              <Button
                variant="ghost"
                className="p-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <ChevronDown className="w-5 h-5" />
              </Button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-12 w-48 bg-white dark:glass rounded-lg shadow-xl border border-gray-200 dark:border-white/10 py-2 z-50"
                  >
                    <button
                      onClick={() => { onNavigate?.('home'); setIsDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Home
                    </button>
                    <button
                      onClick={() => {
                        setLoginAccessFeature?.('Meal Plan');
                        setShowLoginModal?.(true);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Meal Plan
                    </button>
                    <button
                      onClick={() => { onNavigate?.('about'); setIsDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      About
                    </button>
                  </motion.div>
                </>
              )}
            </div>

            <Button
              variant="outline"
              className="bg-white/50 dark:glass hover:bg-white/80 dark:hover:glass-strong transition-all border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200"
              onClick={onShowLogin}
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-emerald-950/20 dark:to-teal-950/20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 dark:floating-orb-1 rounded-full blur-3xl"
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
        ></motion.div>
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/30 dark:floating-orb-2 rounded-full blur-3xl"
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
        ></motion.div>
        <motion.div
          className="absolute top-1/3 left-1/4 w-64 h-64 bg-green-200/20 dark:floating-orb-3 rounded-full blur-2xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -40, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        ></motion.div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <Apple className="absolute top-1/4 left-1/6 w-8 h-8 text-emerald-400/60" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <Carrot className="absolute top-1/3 right-1/4 w-6 h-6 text-orange-400/60" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <Fish className="absolute bottom-1/3 left-1/3 w-7 h-7 text-blue-400/60" />
        </FloatingElement>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Scan Fridge.
                </span>
                <br />
                <span className="text-gray-800 dark:text-gray-100">Suggest Recipes.</span>
                <br />
                <span className="text-gray-700 dark:text-gray-200">Simplify Eating.</span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Transform your leftovers into delicious meals with our AI-powered recipe suggestions.
                Just snap a photo of your fridge and discover what you can cook today.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-emerald-500/30 text-gray-700 dark:text-emerald-300 hover:bg-gray-50 dark:hover:bg-emerald-500/10 transition-colors"
                onClick={() => {
                  // Trigger login modal to get started
                  (document.querySelector('nav button') as HTMLButtonElement)?.click();
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started!
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={imgGeminiGeneratedImageTr9Lmtr9Lmtr9Lmt1}
                alt="AI analyzing fridge contents"
                className="w-full h-auto object-cover"
                style={{
                  mixBlendMode: 'multiply',
                  filter: 'contrast(1.1) brightness(1.1)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SDG12Section() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(34,197,94) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Decorative Graphics */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 opacity-10"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Recycle className="w-24 h-24 text-emerald-600" />
        </motion.div>
        <motion.div
          className="absolute top-32 right-20 opacity-10"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Award className="w-16 h-16 text-emerald-600" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 left-1/4 opacity-10"
          animate={{
            rotate: [45, 65, 45],
            x: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Apple className="w-20 h-20 text-emerald-600" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-1/4 opacity-10"
          animate={{
            scale: [1, 1.2, 1],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart className="w-18 h-18 text-green-600" />
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Main SDG12 Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Award className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Supporting SDG 12
            </h2>
            <motion.div
              animate={{
                rotate: [0, -360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Recycle className="w-12 h-12 text-green-600" />
            </motion.div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Responsible Consumption and Production
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            FridgeToFork is committed to ensuring sustainable consumption and production patterns
            by transforming how households manage food resources.
          </p>
        </div>

        {/* How We Support SDG12 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Food Waste Reduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:glass border-0 dark:border dark:border-emerald-500/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Trash2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Reduce Food Waste
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our AI helps you use existing ingredients before they spoil, reducing the
                  1.3 billion tons of food wasted globally each year.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Smart Resource Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-teal-50 to-green-50 dark:glass border-0 dark:border dark:border-teal-500/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <RotateCcw className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Smart Resource Use
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Optimize ingredient usage through intelligent recipe suggestions that maximize
                  value from every item in your fridge.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sustainable Patterns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:glass border-0 dark:border dark:border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Recycle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Sustainable Habits
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Foster conscious consumption patterns through meal planning and inventory
                  management that benefits both families and the environment.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>


        {/* Call to Action */}
        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Join the Movement for Sustainable Consumption
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Every meal you optimize contributes to a more sustainable future.
              Start making a difference today with FridgeToFork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 dark:emerald-gradient dark:hover:brightness-110 text-white transform hover:scale-105 transition-all px-8 py-3"
                onClick={() => {
                  (document.querySelector('nav button') as HTMLButtonElement)?.click(); // Trigger login modal
                }}
              >
                <Heart className="w-5 h-5 mr-2" />
                Start Your Sustainable Journey
              </Button>
              <Button
                variant="outline"
                className="border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-8 py-3"
              >
                <Award className="w-5 h-5 mr-2" />
                Learn More About SDG 12
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



function RecipeDetail({ recipe, onBack }: { recipe: any; onBack: () => void }) {
  const recipeDetails = {
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



function MealPlanPage() {
  const [selectedMeal, setSelectedMeal] = useState<{ day: string; type: string; meal: any } | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

  const [mealPlan, setMealPlan] = useState<Record<string, Record<string, any>>>({
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

  const availableRecipes = [
    { name: 'Egg Bowl', image: imgImage6, time: '15 min', difficulty: 'Easy' },
    { name: 'Fresh Salad', image: imgImage7, time: '10 min', difficulty: 'Easy' },
    { name: 'Cheese Omelette', image: imgImage8, time: '12 min', difficulty: 'Medium' }
  ];

  const handleMealAssign = (day: string, mealType: string, recipe: any) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: recipe
      }
    }));
    setSelectedMeal(null);
  };

  const handleMealRemove = (day: string, mealType: string) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null
      }
    }));
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

                      {mealPlan[day][mealType] ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <Card className="bg-gradient-to-r from-emerald-100 to-teal-100 border-0 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-2 sm:p-3">
                              <img
                                src={mealPlan[day][mealType].image}
                                alt={mealPlan[day][mealType].name}
                                className="w-full h-12 sm:h-16 object-cover rounded mb-1 sm:mb-2"
                              />
                              <h5 className="font-medium text-xs text-gray-900 mb-1 leading-tight">
                                {mealPlan[day][mealType].name}
                              </h5>
                              <p className="text-xs text-gray-600">
                                🕒 {mealPlan[day][mealType].time}
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

function AboutPage({ auth, onNavigate }: { auth?: AuthState; onNavigate?: (page: string) => void }) {
  const developers = [
    {
      name: "Alex Rodriguez",
      role: "Lead Developer & AI Specialist",
      description: "Passionate about creating intelligent solutions that make everyday cooking easier. Specializes in machine learning and computer vision.",
      avatar: "AR"
    },
    {
      name: "Sarah Chen",
      role: "Full-Stack Developer & UX Designer",
      description: "Focuses on creating seamless user experiences and beautiful interfaces. Expert in React and modern web technologies.",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      role: "Backend Developer & Data Engineer",
      description: "Builds robust systems that power our recipe recommendations. Specialist in database optimization and API development.",
      avatar: "MJ"
    }
  ];

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
          <Heart className="absolute top-1/4 left-1/6 w-6 h-6 text-emerald-400/40" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <Star className="absolute top-1/3 right-1/4 w-5 h-5 text-teal-400/40" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <Award className="absolute bottom-1/3 left-1/3 w-6 h-6 text-orange-400/40" />
        </FloatingElement>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.(auth?.isLoggedIn ? 'home' : 'home')}
            className="hover:bg-emerald-50 text-emerald-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {auth?.isLoggedIn ? 'Home' : 'Landing'}
          </Button>
        </div>

        {/* About Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                About FridgeToFork
              </span>
            </h1>

            <div className="flex items-center justify-center space-x-3 mb-8">
              <ChefHat className="w-12 h-12 text-emerald-600" />
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                FridgeToFork
              </span>
            </div>
          </motion.div>
        </div>

        {/* App Information */}
        <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0 mb-12">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  FridgeToFork transforms the way you cook by turning your available ingredients into delicious meals.
                  Using advanced AI technology, we analyze your fridge contents and suggest personalized recipes that
                  minimize food waste while maximizing flavor.
                </p>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Our platform makes meal planning effortless, helps you discover new recipes, and encourages
                  sustainable cooking practices. From busy families to cooking enthusiasts, FridgeToFork adapts
                  to your lifestyle and dietary preferences.
                </p>
                <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-lg">
                  <p className="text-emerald-800 leading-relaxed">
                    <strong>Supporting SDG 12:</strong> We're committed to ensuring sustainable consumption and production patterns
                    by helping households reduce food waste, optimize ingredient usage, and make more conscious cooking decisions
                    that benefit both families and the environment.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-emerald-50 rounded-lg">
                  <Camera className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Smart Scanning</h3>
                    <p className="text-sm text-gray-600">AI-powered ingredient detection</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-lg">
                  <ChefHat className="w-8 h-8 text-teal-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Recipe Suggestions</h3>
                    <p className="text-sm text-gray-600">Personalized meal recommendations</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                  <Recycle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Waste Reduction</h3>
                    <p className="text-sm text-gray-600">Minimize food waste effectively</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Development Team */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Meet Our Team
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {developers.map((developer, index) => (
              <motion.div
                key={developer.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="group"
              >
                <Card className="bg-white/90 backdrop-blur-lg shadow-lg border-0 transition-all duration-300 group-hover:shadow-xl group-hover:bg-emerald-50/80 h-[400px] w-full">
                  <CardContent className="p-6 text-center h-full flex flex-col justify-between">
                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                        <span className="text-white font-bold text-lg">
                          {developer.avatar}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-emerald-800 transition-colors duration-300">{developer.name}</h3>
                      <Badge className="bg-emerald-100 text-emerald-700 mb-3 group-hover:bg-emerald-200 transition-colors duration-300">
                        {developer.role}
                      </Badge>
                      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300 flex-1">
                        {developer.description}
                      </p>
                    </div>

                    {/* Social Links - Always visible with hover effects */}
                    <div className="pt-4 border-t border-gray-200 group-hover:border-emerald-200 transition-colors duration-300">
                      <div className="flex justify-center items-center space-x-3">
                        {/* LinkedIn */}
                        <a
                          href={`https://linkedin.com/in/${developer.name.toLowerCase().replace(' ', '-')}`} // TODO: Replace with actual LinkedIn URLs
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Linkedin className="w-4 h-4 text-blue-600" />
                        </a>

                        {/* GitHub */}
                        <a
                          href={`https://github.com/${developer.name.toLowerCase().replace(' ', '-')}`} // TODO: Replace with actual GitHub URLs
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Github className="w-4 h-4 text-gray-600" />
                        </a>

                        {/* Email */}
                        <a
                          href={`mailto:${developer.name.toLowerCase().replace(' ', '.')}@fridgetofork.com`} // TODO: Replace with actual email addresses
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 hover:scale-110 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                          <Mail className="w-4 h-4 text-red-600" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Have questions, suggestions, or feedback? We'd love to hear from you!
              Our team is always working to improve your FridgeToFork experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                📧 Contact Support
              </Button>
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                💡 Share Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InventoryPage({ auth }: { auth: AuthState }) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([
  ]);

  // Integrated Email Notification System for Spoiling Ingredients
  useEffect(() => {
    const checkForSpoilingIngredients = async () => {
      const spoilingSoonItems = inventoryItems.filter(item => item.daysLeft <= 2);

      if (spoilingSoonItems.length > 0 && auth.user?.email) {
        console.log('🔔 EMAIL NOTIFICATION TRIGGER:', {
          spoilingItems: spoilingSoonItems,
          userEmail: auth.user.email,
          message: `You have ${spoilingSoonItems.length} ingredients expiring soon!`,
          items: spoilingSoonItems.map(item => `${item.name} (${item.daysLeft} days left)`).join(', ')
        });

        // Send actual email notification
        try {
          const emailResult = await sendSpoilingReminder(
            auth.user.email,
            spoilingSoonItems.map(item => ({
              name: item.name,
              daysLeft: item.daysLeft
            }))
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

    // Check for spoiling ingredients on component mount
    checkForSpoilingIngredients();

    // Set up periodic checks (every 12 hours)
    const notificationInterval = setInterval(checkForSpoilingIngredients, 12 * 60 * 60 * 1000);
    return () => clearInterval(notificationInterval);
  }, [inventoryItems, auth.user]);

  const [wasteManagementItems, setWasteManagementItems] = useState([
    { id: 101, name: 'Carrot', daysLeft: 3, image: '🥕' },
    { id: 102, name: 'Lettuce', daysLeft: 1, image: '🥬' },
    { id: 103, name: 'Banana', daysLeft: 2, image: '🍌' },
    { id: 104, name: 'Potato', daysLeft: 4, image: '🥔' }
  ]);

  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showRecycleModal, setShowRecycleModal] = useState(false);
  const [leftoverRecipes, setLeftoverRecipes] = useState<any[]>([]);
  const [selectedLeftoverRecipe, setSelectedLeftoverRecipe] = useState<any | null>(null);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);

  const handleAddToBin = (itemId: string) => {
    // Find the item in inventory
    const itemToMove = inventoryItems.find(item => item.id === itemId);

    if (itemToMove) {
      // Add to waste management bin with a new ID to avoid conflicts
      const newWasteItem = {
        ...itemToMove,
        id: Date.now() + Math.random() // Generate unique ID
      };

      setWasteManagementItems(prev => [...prev, newWasteItem]);

      // Remove from inventory
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));

      console.log('✅ Moved item to waste management bin:', itemToMove.name);
    }
  };

  const handleGenerateLeftoverRecipes = async () => {
    try {
      setIsGeneratingRecipes(true);
      console.log('🍳 Generating leftover recipes from waste management bin...');

      // Extract ingredient names from waste management items
      const ingredientNames = wasteManagementItems.map(item => item.name);

      if (ingredientNames.length === 0) {
        console.warn('⚠️ No ingredients in waste management bin');
        setIsGeneratingRecipes(false);
        return;
      }

      // Generate recipes using the same logic as Homepage (with images from Pexels)
      const generatedRecipes = await generateRecipesWithImages(ingredientNames);

      // Set the leftover recipes
      setLeftoverRecipes(generatedRecipes);

      // Save to Firebase if user is authenticated
      if (auth.user?.uid) {
        const recipesForSave = generatedRecipes.map(recipe => ({
          ...recipe,
          id: '',
          createdAt: new Date()
        }));

        await saveGeneratedRecipes(auth.user.uid, recipesForSave);

        // Send recipe suggestions email
        if (auth.user.email) {
          await sendRecipeSuggestions(
            auth.user.email,
            generatedRecipes.slice(0, 3), // Send top 3 recipes
            ingredientNames
          );
        }
      }

      console.log('✅ Successfully generated leftover recipes:', generatedRecipes.length);
    } catch (error) {
      console.error('❌ Error generating leftover recipes:', error);
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  const recoverTechniques = [
    { title: "Smoothies & Juices", tip: "Blend slightly overripe fruits into delicious smoothies or fresh juices" },
    { title: "Soups & Stews", tip: "Use soft vegetables to create hearty soups and stews - perfect for batch cooking" },
    { title: "Bread & Croutons", tip: "Transform stale bread into croutons, breadcrumbs, or bread pudding" },
    { title: "Pickle & Preserve", tip: "Extend vegetable life by pickling or making preserves and jams" },
    { title: "Freeze for Later", tip: "Blanch and freeze vegetables, or freeze overripe bananas for future baking" }
  ];

  const recycleTechniques = [
    { title: "Composting", tip: "Turn food scraps into nutrient-rich compost for your garden" },
    { title: "Vegetable Stock", tip: "Use vegetable peels and scraps to make homemade vegetable stock" },
    { title: "Coffee Grounds", tip: "Used coffee grounds make excellent fertilizer for acid-loving plants" },
    { title: "Eggshells", tip: "Crushed eggshells provide calcium for plants and can deter garden pests" },
    { title: "Citrus Peels", tip: "Use citrus peels as natural cleaning agents or air fresheners" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 relative overflow-hidden">
      {/* Background animations matching other pages */}
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

      {/* Floating food icons */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingElement delay={0}>
          <Package className="absolute top-1/4 left-1/6 w-6 h-6 text-emerald-400/40" />
        </FloatingElement>
        <FloatingElement delay={1}>
          <Refrigerator className="absolute top-1/3 right-1/4 w-5 h-5 text-teal-400/40" />
        </FloatingElement>
        <FloatingElement delay={2}>
          <Apple className="absolute bottom-1/3 left-1/3 w-6 h-6 text-red-400/40" />
        </FloatingElement>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {/* Inventory Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Inventory
              </span>
            </h1>

            {/* Email Notification Status */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-700 font-medium">Email Notifications Enabled</span>
              </div>
              {inventoryItems.filter(item => item.daysLeft <= 2).length > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-amber-100 border border-amber-300 px-3 py-2 rounded-lg"
                >
                  <span className="text-amber-800 text-sm font-medium">
                    📧 Notification sent for {inventoryItems.filter(item => item.daysLeft <= 2).length} expiring items
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {inventoryItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-r from-emerald-400/80 to-teal-400/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <CardContent className="p-4 sm:p-6 relative">
                        <div className="flex items-center space-x-3 sm:space-x-4 pr-8 sm:pr-12">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-lg sm:text-2xl">{item.image}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-white text-sm sm:text-lg truncate">{item.name}</h3>
                            <p className="text-white/90 text-xs sm:text-sm font-medium">
                              {item.daysLeft} Days left
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white/90 text-gray-800 hover:bg-white font-semibold px-1.5 py-1 sm:px-2 sm:py-1 h-6 sm:h-7 text-xs"
                          onClick={() => handleAddToBin(item.id)}
                        >
                          <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">Add</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Waste Management Bin Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Waste Management Bin
            </span>
          </h2>

          <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
            <CardContent className="p-8">
              {/* Reuse Section */}
              <div className="bg-white/60 rounded-3xl p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-emerald-700 flex items-center">
                    <RotateCcw className="w-6 h-6 mr-3" />
                    Reuse
                  </h3>
                  <motion.div
                    whileHover={{ scale: isGeneratingRecipes ? 1 : 1.05 }}
                    whileTap={{ scale: isGeneratingRecipes ? 1 : 0.95 }}
                  >
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
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-gradient-to-r from-emerald-200 to-teal-200 border-0 shadow-md hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                              <span className="text-base sm:text-lg">{item.image}</span>
                            </div>
                            <div className="text-center sm:text-left min-w-0">
                              <h4 className="font-bold text-emerald-800 text-xs sm:text-sm truncate">{item.name}</h4>
                              <p className="text-emerald-700 text-xs">
                                {item.daysLeft} Days left
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
                <motion.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-8 sm:px-16 py-4 sm:py-5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/20"
                    onClick={() => setShowRecoverModal(true)}
                  >
                    <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    RECOVER
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full sm:w-auto"
                >
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

              {/* Recover Techniques Modal */}
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
                            <p className="text-emerald-700 leading-relaxed">
                              {technique.tip}
                            </p>
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

              {/* Recycle Techniques Modal */}
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
                            <p className="text-green-700 leading-relaxed">
                              {technique.tip}
                            </p>
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

        {/* Leftover Recipes Section */}
        {leftoverRecipes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-8">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Leftover Recipes
              </span>
            </h2>

            <Card className="bg-white/90 backdrop-blur-lg shadow-xl border-0">
              <CardContent className="p-8">
                {selectedLeftoverRecipe ? (
                  /* Recipe Detail View */
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="mb-6">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedLeftoverRecipe(null)}
                        className="hover:bg-emerald-50 text-emerald-700"
                      >
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
                        <div className="text-center">
                          <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            {selectedLeftoverRecipe.name}
                          </h3>
                          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                            <span>🕒 {selectedLeftoverRecipe.time}</span>
                            <Badge className="bg-emerald-100 text-emerald-700">
                              {selectedLeftoverRecipe.difficulty}
                            </Badge>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                            <p className="text-emerald-800 font-medium">
                              ♻️ Made from leftover ingredients to reduce waste!
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <ChefHat className="w-4 h-4 mr-2 text-emerald-600" />
                            Ingredients from your bin:
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {wasteManagementItems.map((item, index) => (
                              <Badge
                                key={index}
                                className="bg-emerald-100 text-emerald-700 px-3 py-1"
                              >
                                {item.image} {item.name}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                            Quick Instructions:
                          </h4>
                          <div className="space-y-3 text-sm text-gray-700">
                            <div className="flex items-start space-x-2">
                              <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                1
                              </div>
                              <span>Check your leftover ingredients for quality and freshness</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                2
                              </div>
                              <span>Prepare ingredients by washing, chopping, and seasoning as needed</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <div className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                                3
                              </div>
                              <span>Follow cooking instructions and enjoy your waste-free meal!</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                            <Recycle className="w-4 h-4 mr-2" />
                            Sustainability Impact
                          </h5>
                          <p className="text-green-700 text-sm">
                            By using leftover ingredients, you're helping reduce food waste and supporting SDG 12:
                            Responsible Consumption and Production. Every leftover meal makes a difference!
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Recipe Grid View */
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-gray-600 mb-2">
                          {leftoverRecipes.length} recipes generated from your leftover ingredients
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {wasteManagementItems.map((item, index) => (
                            <Badge
                              key={index}
                              className="bg-emerald-100 text-emerald-700 px-3 py-1"
                            >
                              {item.image} {item.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2">
                        ♻️ Zero Waste Cooking
                      </Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {leftoverRecipes.map((recipe, index) => (
                        <motion.div
                          key={recipe.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <Card
                            className="overflow-hidden cursor-pointer transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-lg hover:shadow-xl hover:scale-105 group"
                            onClick={() => setSelectedLeftoverRecipe(recipe)}
                          >
                            <div className="relative">
                              <img
                                src={recipe.image}
                                alt={recipe.name}
                                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-white/90 text-gray-800 text-xs">
                                  {recipe.difficulty}
                                </Badge>
                              </div>
                              <div className="absolute top-2 left-2">
                                <Badge className="bg-green-500/90 text-white text-xs">
                                  ♻️ Leftover
                                </Badge>
                              </div>
                              <div className="absolute bottom-2 left-2 right-2">
                                <h3 className="font-bold text-white text-sm mb-1">
                                  {recipe.name}
                                </h3>
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
                          You've transformed {wasteManagementItems.length} leftover ingredients into {leftoverRecipes.length} delicious recipes,
                          preventing food waste and promoting sustainable cooking practices!
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

function Homepage({ onNavigate, auth }: { onNavigate?: (page: string) => void; auth: AuthState }) {
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (auth.user?.uid) {
        try {
          setIsLoading(true);
          const ingredientsResult = await getUserIngredients(auth.user.uid);
          let ingredientNames: string[] = [];
          if (!ingredientsResult.error && ingredientsResult.ingredients.length > 0) {
            ingredientNames = ingredientsResult.ingredients.map(ing => ing.name);
            setDetectedIngredients(ingredientNames);
          } else {
            ingredientNames = [];
            setDetectedIngredients(ingredientNames);
          }

          const recipesResult = await getUserRecipes(auth.user.uid);
          let recipes: any[] = [];
          if (!recipesResult.error && recipesResult.recipes.length > 0) {
            recipes = recipesResult.recipes.map((recipe, index) => ({
              ...recipe,
              id: recipe.id || `recipe-${index}`,
            }));
          } else if (ingredientNames.length > 0) {
            const genRecipes = generateRecipes(ingredientNames).map((recipe, index) => ({
              ...recipe,
              id: `recipe-${index}`,
              createdAt: new Date(),
              usedIngredients: ingredientNames,
            }));
            await saveGeneratedRecipes(auth.user.uid, genRecipes);
            const updatedRecipesResult = await getUserRecipes(auth.user.uid);
            if (!updatedRecipesResult.error) {
              recipes = updatedRecipesResult.recipes.map((recipe, index) => ({
                ...recipe,
                id: recipe.id || `recipe-${index}`,
              }));
            }
          }
          setGeneratedRecipes(recipes);
          if (recipes.length > 0) {
            setSelectedRecipeId(recipes[0].id);
          }
        } catch (error) {
          console.error('Failed to load user data:', error);
          setDetectedIngredients(['Apple', 'Tomato', 'Cheese', 'Milk']);
          setGeneratedRecipes([]);
          setSelectedRecipeId(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, [auth.user?.uid]);

  const handleImageUpload = async (file: File) => {
    try {
      if (!auth.user?.uid) {
        console.error('User not authenticated');
        return;
      }
      setIsUploadingImage(true);
      console.log('🔍 Processing image for ingredient detection...');
      const visionResult = await analyzeImageWithGoogleVision(file, auth.user.uid);
      if (visionResult.error) {
        console.error('Vision API Error:', visionResult.error);
        setIsUploadingImage(false);
        return;
      }
      const ingredientNames = visionResult.ingredients.map((ing: DetectedIngredient) => ing.name);
      setDetectedIngredients(ingredientNames);
      const firebaseIngredients: Ingredient[] = visionResult.ingredients.map((ing: DetectedIngredient) => ({
        id: '',
        name: ing.name,
        detectedAt: new Date(),
        addedManually: false,
        confidence: ing.confidence,
        category: ing.category || 'detected',
      }));
      await saveDetectedIngredients(auth.user.uid, firebaseIngredients);
      await updateInventory(auth.user.uid, ingredientNames);
      
      // Generate recipes with Pexels images
      const generatedRecipesLocal = (await generateRecipesWithImages(ingredientNames)).map((recipe, index) => ({
        ...recipe,
        id: `recipe-${index}`,
        createdAt: new Date(),
      }));
      
      await saveGeneratedRecipes(auth.user.uid, generatedRecipesLocal);
      const updatedRecipesResult = await getUserRecipes(auth.user.uid);
      if (!updatedRecipesResult.error) {
        const recipes = updatedRecipesResult.recipes.map((recipe, index) => ({
          ...recipe,
          id: recipe.id || `recipe-${index}`,
        }));
        setGeneratedRecipes(recipes);
        if (recipes.length > 0) {
          setSelectedRecipeId(recipes[0].id);
        }
      }
      console.log('✅ Successfully detected and saved ingredients:', ingredientNames);
      setShowUploadOptions(false);
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

  if (isLoading) {
    return <div className="text-center py-12">Loading your data...</div>;
  }

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
                {detectedIngredients.length} items detected
              </Badge>
            </div>
            {detectedIngredients.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No ingredients detected yet. Upload a photo to get started!</p>
            ) : (
              <div className="flex flex-wrap gap-3 mb-6">
                {detectedIngredients.map((ingredient, index) => (
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
                      {ingredient}
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
                          const newIngredients = detectedIngredients.filter((ing) => ing !== ingredient);
                          setDetectedIngredients(newIngredients);
                          await updateInventory(auth.user.uid, newIngredients);
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
                  onClick={async () => {
                    const ingredientName = prompt('Enter ingredient name:');
                    if (ingredientName && auth.user?.uid) {
                      try {
                        await addManualIngredient(auth.user.uid, ingredientName);
                        const newIngredients = [...detectedIngredients, ingredientName];
                        setDetectedIngredients(newIngredients);
                        await updateInventory(auth.user.uid, newIngredients);
                        const generatedRecipesLocal = (await generateRecipesWithImages(newIngredients)).map((recipe, index) => ({
                          ...recipe,
                          id: `recipe-${index}`,
                          createdAt: new Date(),
                        }));
                        await saveGeneratedRecipes(auth.user.uid, generatedRecipesLocal);
                        const updatedRecipesResult = await getUserRecipes(auth.user.uid);
                        if (!updatedRecipesResult.error) {
                          const recipes = updatedRecipesResult.recipes.map((recipe, index) => ({
                            ...recipe,
                            id: recipe.id || `recipe-${index}`,
                          }));
                          setGeneratedRecipes(recipes);
                          if (recipes.length > 0) {
                            setSelectedRecipeId(recipes[0].id);
                          }
                        }
                        console.log('✅ Manual ingredient added:', ingredientName);
                      } catch (error) {
                        console.error('❌ Failed to add ingredient:', error);
                      }
                    }
                  }}
                >
                  + Add More
                </Badge>
              </div>
            )}
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                onClick={() => onNavigate?.('inventory')}
              >
                View Full Inventory
              </Button>
              <Button
                variant="outline"
                className="border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  setIsGeneratingRecipes(true);
                  try {
                    const baseIngredients = ['oil', 'salt', 'pepper'];
                    const allIngredients = Array.from(new Set([...detectedIngredients, ...baseIngredients]));
                    if (allIngredients.length === 0) {
                      console.warn('No ingredients available to generate recipes');
                      return;
                    }
                    const { getEnvVar } = await import('./lib/env');
                    const apiKey = getEnvVar('VITE_OPENAI_API_KEY', '');
                    const recipeResult = await generateRecipesSmart(allIngredients, apiKey, 8, apiKey ? 30 : 10);
                    console.log('generateRecipesSmart result:', recipeResult);
                    const recipes = Array.isArray(recipeResult)
                      ? recipeResult.map((recipe, index) => ({
                          ...recipe,
                          id: `recipe-${index}`,
                          createdAt: new Date(),
                        }))
                      : [];
                    if (!Array.isArray(recipeResult)) {
                      console.error('generateRecipesSmart did not return an array:', recipeResult);
                    }
                    setGeneratedRecipes(recipes);
                    setCurrentRecipeIndex(0);
                    if (recipes.length > 0) {
                      setSelectedRecipeId(recipes[0].id);
                    } else {
                      console.warn('No recipes generated');
                    }
                    if (auth.user?.uid) {
                      await saveGeneratedRecipes(auth.user.uid, recipes);
                    }
                  } catch (error) {
                    console.error('Error generating recipes:', error);
                  } finally {
                    setIsGeneratingRecipes(false);
                  }
                }}
                disabled={(detectedIngredients.length === 0 && !auth.user) || isGeneratingRecipes}
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
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900/50 dark:glass border-t border-gray-200 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              FridgeToFork
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <span>© 2025 FridgeToFork. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span>Made with ❤️ for home cooks</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

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

  // Firebase auth state persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        console.log('🔐 User authenticated:', firebaseUser.email);
        console.log('🔍 Initial displayName:', firebaseUser.displayName); // Debug

        let name = firebaseUser.displayName || 'User';
        if (!firebaseUser.displayName) {
          // Fallback to Firestore if displayName is missing
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            name = data.name || 'User';
            console.log('🔍 Fetched name from Firestore:', name); // Debug
          } else {
            console.log('⚠️ No Firestore document for user:', firebaseUser.uid);
            // Optionally log out if no document is found
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

        setAuth({
          user,
          isLoggedIn: true
        });

        try {
          const settingsResult = await getUserSettings(firebaseUser.uid);
          if (!settingsResult.error && settingsResult.settings) {
            setUserSettings(settingsResult.settings);
          } else {
            console.log('⚠️ Settings not found, using defaults:', settingsResult.error);
          }
        } catch (error) {
          console.error('Failed to load user settings:', error);
          setUserSettings({ notifications: true }); // Fallback
        }
      } else {
        console.log('🔓 User signed out');
        setAuth({
          user: null,
          isLoggedIn: false
        });
        setUserSettings({
          notifications: true
        });
      }
    });

    return () => unsubscribe();
  }, []);

const handleLogin = (user: User) => {
    setAuth({
      user,
      isLoggedIn: true
    });

    // If user was trying to access a specific feature, navigate there
    if (loginAccessFeature === 'Meal Plan') {
      setCurrentPage('meal-plan');
    }

    // Clear the access feature flag
    setLoginAccessFeature(undefined);
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setAuth({
        user: null,
        isLoggedIn: false
      });
      setCurrentPage('home');
      // Reset settings on logout
      setUserSettings({
        notifications: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSettingsChange = async (newSettings: UserSettings) => {
    setUserSettings(newSettings);

    // Save settings to Firebase
    if (auth.user?.uid) {
      try {
        await updateUserSettings(auth.user.uid, newSettings);
        console.log('✅ Settings updated and saved to Firebase:', newSettings);
      } catch (error) {
        console.error('❌ Failed to save settings:', error);
      }
    }
  };

  const handleNavigate = (page: string) => {
    // If not logged in and navigating to 'home', go back to landing page
    if (!auth.isLoggedIn && page === 'home') {
      setCurrentPage('home');
    } else {
      setCurrentPage(page);
    }
    setSelectedRecipe(null);
  };

  // Show recipe detail if selected and user is logged in
  if (selectedRecipe && auth.isLoggedIn) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
      />
    );
  }

  // Show authenticated pages if user is logged in
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
        {currentPage === 'home' && <Homepage onNavigate={handleNavigate} auth={auth} />}
        {currentPage === 'inventory' && <InventoryPage auth={auth} />}
        {currentPage === 'meal-plan' && <MealPlanPage />}
        {currentPage === 'about' && <AboutPage auth={auth} onNavigate={handleNavigate} />}
        <Footer />
      </div>
    );
  }

  // Show landing page or about page if user is not logged in
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
