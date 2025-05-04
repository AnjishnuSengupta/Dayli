
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, ArrowRight, User } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp, logIn } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        toast({
          title: "Welcome to Our Journal!",
          description: "Your account has been created successfully.",
        });
      } else {
        await logIn(email, password);
        toast({
          title: "Welcome back!",
          description: "We're so glad to see you here",
        });
      }
      
      // Set authentication state in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to authenticate",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <MainLayout showNav={false}>
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Heart 
              size={40} 
              className="text-journal-blush" 
              fill="#FFDEE2"
            />
          </div>
          
          <h1 className="text-3xl font-serif text-center mb-8">
            {isSignUp ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          
          <form onSubmit={handleSubmit} className="journal-card space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User size={16} />
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field w-full px-4 py-3"
                  placeholder="How would you like to be called?"
                  required={isSignUp}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail size={16} />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full px-4 py-3"
                placeholder="hello@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock size={16} />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full px-4 py-3"
                placeholder={isSignUp ? "Create a strong password" : "Enter your password"}
                required
              />
            </div>
            
            <button 
              type="submit"
              className="btn-primary w-full flex justify-center items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight size={16} />
            </button>
            
            <div className="pt-4 text-center">
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
          
          <div className="text-center mt-8">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
              Return to welcome page
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
