
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, we'd handle authentication here
    // For demo purposes, we'll simulate login and navigate to dashboard
    toast({
      title: isSignUp ? "Welcome to Our Journal!" : "Welcome back!",
      description: "We're so glad to see you here",
    });
    
    navigate('/dashboard');
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
            >
              {isSignUp ? 'Sign Up' : 'Sign In'} <ArrowRight size={16} />
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
