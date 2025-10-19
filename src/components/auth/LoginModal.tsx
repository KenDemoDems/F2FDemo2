import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../../lib/firebase';
import { sendWelcomeEmail } from '../../lib/emailService';
import { User } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  accessFeature?: string;
}

export function LoginModal({ isOpen, onClose, onLogin, accessFeature }: LoginModalProps) {
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
          name: result.user.displayName || 'User'
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
