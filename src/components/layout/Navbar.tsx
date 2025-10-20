import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, Menu, X, Bell, BellOff, KeyRound, ArrowLeft } from 'lucide-react';
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
  onSettingsChange,
}: NavbarProps) {
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navDropdownRef.current &&
        !navDropdownRef.current.contains(event.target as Node) &&
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNavDropdownOpen(false);
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (auth.isLoggedIn) {
    return (
      <nav className="relative z-50 bg-white/80 dark:nav-glass backdrop-blur-lg border-b border-white/20 dark:border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChefHat className="w-7 h-7 md:w-8 md:h-8 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                FridgeToFork
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => onNavigate?.('home')}
                className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
              >
                Home
              </button>
              <button
                onClick={() => onNavigate?.('inventory')}
                className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
              >
                Inventory
              </button>
              <button
                onClick={() => onNavigate?.('meal-plan')}
                className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
              >
                Meal Plan
              </button>
              <button
                onClick={() => onNavigate?.('about')}
                className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
              >
                About
              </button>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="text-gray-700 dark:text-gray-200 font-medium hidden sm:inline">{auth.user?.name}</span>

              <div className="relative" ref={userDropdownRef}>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 md:h-10 md:w-10 rounded-full bg-emerald-100 dark:glass border-2 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-200 dark:hover:glass-strong transition-colors p-0 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  aria-label="User menu"
                  aria-expanded={isUserDropdownOpen}
                >
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold text-xs md:text-sm">
                    {auth.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </Button>

                {isUserDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:bg-transparent md:backdrop-blur-none"
                      onClick={() => setIsUserDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute right-0 top-10 md:top-12 w-56 bg-white dark:bg-gray-800 md:bg-white md:dark:glass md:backdrop-blur-md md:rounded-lg md:shadow-xl border border-gray-200 dark:border-white/10 py-3 md:py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-white/10">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{auth.user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{auth.user?.email || 'user@example.com'}</p>
                      </div>

                      <div className="px-4 py-2 space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center space-x-2">
                            {userSettings.notifications ? (
                              <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <BellOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            )}
                            <span className="text-sm text-gray-700 dark:text-gray-200">Notifications</span>
                          </div>
                          <Switch
                            checked={userSettings.notifications}
                            onCheckedChange={(checked: boolean) => onSettingsChange({ ...userSettings, notifications: checked })}
                            aria-label="Toggle email notifications"
                          />
                        </div>
                      </div>

                      <div className="border-t border-gray-100 dark:border-white/10 my-2"></div>

                      <button
                        className="w-full px-4 py-3 md:py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center transition-colors"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
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

              <div className="md:hidden relative" ref={navDropdownRef}>
                <Button
                  variant="ghost"
                  className="p-2 h-8 w-8"
                  onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                  aria-label="Navigation menu"
                  aria-expanded={isNavDropdownOpen}
                >
                  {isNavDropdownOpen ? (
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  ) : (
                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  )}
                </Button>

                {isNavDropdownOpen && (
                  <>
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsNavDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 md:bg-white md:dark:glass md:backdrop-blur-md md:rounded-lg md:shadow-xl border border-gray-200 dark:border-white/10 py-3 md:py-2 z-50"
                    >
                      <button
                        onClick={() => {
                          onNavigate?.('home');
                          setIsNavDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 md:py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                      >
                        Home
                      </button>
                      <button
                        onClick={() => {
                          onNavigate?.('inventory');
                          setIsNavDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 md:py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                      >
                        Inventory
                      </button>
                      <button
                        onClick={() => {
                          onNavigate?.('meal-plan');
                          setIsNavDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 md:py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                      >
                        Meal Plan
                      </button>
                      <button
                        onClick={() => {
                          onNavigate?.('about');
                          setIsNavDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 md:py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                      >
                        About
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
            <ChefHat className="w-7 h-7 md:w-8 md:h-8 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              FridgeToFork
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate?.('home')}
              className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              Home
              </button>
            <button
              onClick={() => {
                setLoginAccessFeature?.('Meal Plan');
                setShowLoginModal?.(true);
              }}
              className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              Meal Plan
            </button>
            <button
              onClick={() => onNavigate?.('about')}
              className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
            >
              About
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="md:hidden relative" ref={navDropdownRef}>
              <Button
                variant="ghost"
                className="p-2 h-8 w-8"
                onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                aria-label="Navigation menu"
                aria-expanded={isNavDropdownOpen}
              >
                {isNavDropdownOpen ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                )}
              </Button>

              {isNavDropdownOpen && (
                <>
                  <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setIsNavDropdownOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute right-0 top-10 w-48 bg-white dark:bg-gray-800 md:bg-white md:dark:glass md:backdrop-blur-md md:rounded-lg md:shadow-xl border border-gray-200 dark:border-white/10 py-3 md:py-2 z-50"
                    >
                    <button
                      onClick={() => {
                        onNavigate?.('home');
                        setIsNavDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 md:py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      Home
                    </button>
                    <button
                      onClick={() => {
                        setLoginAccessFeature?.('Meal Plan');
                        setShowLoginModal?.(true);
                        setIsNavDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 md:py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      Meal Plan
                    </button>
                    <button
                      onClick={() => {
                        onNavigate?.('about');
                        setIsNavDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 md:py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                    >
                      About
                    </button>
                  </motion.div>
                </>
              )}
            </div>

            <Button
              variant="outline"
              className="text-sm px-3 py-1 md:bg-white/50 md:dark:glass md:hover:bg-white/80 md:dark:hover:glass-strong transition-all border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200"
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
