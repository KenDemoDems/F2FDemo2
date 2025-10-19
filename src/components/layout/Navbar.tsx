import React, { useState } from 'react';
import { ChefHat, ChevronDown, Bell, BellOff, KeyRound, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { AuthState, UserSettings } from '../../types';

interface NavbarProps {
  auth: AuthState;
  onShowLogin: () => void;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  setShowLoginModal?: (show: boolean) => void;
  setLoginAccessFeature?: (feature: string | undefined) => void;
  userSettings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
}

export function Navbar({
  auth,
  onShowLogin,
  onLogout,
  onNavigate,
  setShowLoginModal,
  setLoginAccessFeature,
  userSettings,
  onSettingsChange
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (auth.isLoggedIn) {
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

            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => onNavigate?.('home')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Home</button>
              <button onClick={() => onNavigate?.('inventory')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Inventory</button>
              <button onClick={() => onNavigate?.('meal-plan')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Meal Plan</button>
              <button onClick={() => onNavigate?.('about')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">About</button>
            </div>

            <div className="md:hidden">
              <Button variant="ghost" className="p-2" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <ChevronDown className="w-5 h-5" />
              </Button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-12 w-48 bg-white dark:glass rounded-lg shadow-xl border border-gray-200 dark:border-white/10 py-2 z-50"
                  >
                    <button onClick={() => { onNavigate?.('home'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Home</button>
                    <button onClick={() => { onNavigate?.('inventory'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Inventory</button>
                    <button onClick={() => { onNavigate?.('meal-plan'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Meal Plan</button>
                    <button onClick={() => { onNavigate?.('about'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">About</button>
                  </motion.div>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-200 font-medium hidden sm:inline">{auth.user?.name}</span>

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

                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-12 w-64 bg-white dark:glass rounded-lg shadow-xl border border-gray-200 dark:border-white/10 py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{auth.user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{auth.user?.email || 'user@example.com'}</p>
                      </div>

                      <div className="px-4 py-2 space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-2">
                            {userSettings.notifications ? <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <BellOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                            <span className="text-sm text-gray-700 dark:text-gray-200">Email Notifications</span>
                          </div>
                          <Switch
                            checked={userSettings.notifications}
                            onCheckedChange={(checked: boolean) => onSettingsChange({ ...userSettings, notifications: checked })}
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>

                      <button
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center transition-colors"
                        onClick={() => { setIsDropdownOpen(false); console.log('Reset password clicked'); }}
                      >
                        <KeyRound className="mr-2 h-4 w-4" />
                        Reset Password
                      </button>

                      <div className="border-t border-gray-100 dark:border-white/10 my-1"></div>

                      <button
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center transition-colors"
                        onClick={() => { setIsDropdownOpen(false); onLogout(); }}
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

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => onNavigate?.('home')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Home</button>
            <button onClick={() => { setLoginAccessFeature?.('Meal Plan'); setShowLoginModal?.(true); }} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">Meal Plan</button>
            <button onClick={() => onNavigate?.('about')} className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">About</button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="md:hidden relative">
              <Button variant="ghost" className="p-2" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <ChevronDown className="w-5 h-5" />
              </Button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-12 w-48 bg-white dark:glass rounded-lg shadow-xl border border-gray-200 dark:border-white/10 py-2 z-50"
                  >
                    <button onClick={() => { onNavigate?.('home'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Home</button>
                    <button onClick={() => { setLoginAccessFeature?.('Meal Plan'); setShowLoginModal?.(true); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Meal Plan</button>
                    <button onClick={() => { onNavigate?.('about'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">About</button>
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
