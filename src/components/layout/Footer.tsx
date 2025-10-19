import React from 'react';
import { ChefHat } from 'lucide-react';

export function Footer() {
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
