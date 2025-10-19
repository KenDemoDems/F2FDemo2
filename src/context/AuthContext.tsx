import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChange, logOut, getUserSettings, db } from '../lib/firebase';
import { getDoc, doc } from 'firebase/firestore';
import { User, AuthState, UserSettings } from '../types';

interface AuthContextType {
  auth: AuthState;
  userSettings: UserSettings;
  login: (user: User) => void;
  logout: () => Promise<void>;
  updateSettings: (settings: UserSettings) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
  });
  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        let name = firebaseUser.displayName || 'User';
        
        if (!firebaseUser.displayName) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              name = userDoc.data().name || name;
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }

        setAuth({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name,
            photoURL: firebaseUser.photoURL || undefined,
          },
          isLoggedIn: true,
        });

        try {
          const settingsResult = await getUserSettings(firebaseUser.uid);
          if (!settingsResult.error) {
            setUserSettings(settingsResult.settings);
          }
        } catch (error) {
          console.error('Failed to load user settings:', error);
        }
      } else {
        setAuth({
          user: null,
          isLoggedIn: false,
        });
        setUserSettings({ notifications: true });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (user: User) => {
    setAuth({
      user,
      isLoggedIn: true,
    });
  };

  const logout = async () => {
    try {
      await logOut();
      setAuth({
        user: null,
        isLoggedIn: false,
      });
      setUserSettings({ notifications: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateSettings = (settings: UserSettings) => {
    setUserSettings(settings);
  };

  return (
    <AuthContext.Provider value={{ auth, userSettings, login, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
