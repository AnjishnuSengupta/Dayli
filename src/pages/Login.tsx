import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingButton } from '@/components/ui/loading';
import { validateLoginForm, validateRegisterForm } from '@/utils/formValidation';
import { saveAuthState, createStorableUser, saveUserData } from '@/utils/authStorage';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, logIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form using our utility
    const validation = isRegister 
      ? validateRegisterForm(name, email, password, confirmPassword)
      : validateLoginForm(email, password);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let userData = null;
      
      if (isRegister) {
        userData = await signUp(email, password, name);
        toast.success("Account created! Welcome to Our Journal!");
      } else {
        userData = await logIn(email, password);
        toast.success("Welcome back!");
      }
      
      // Store auth state in sessionStorage instead of localStorage
      saveAuthState(true);
      
      // Save user data in session storage
      if (userData?.user) {
        saveUserData(createStorableUser(userData.user));
      }
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error("Authentication error:", err);
      
      if (err instanceof Error) {
        // Extract error message
        const errorMessage = err.message;
        if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password')) {
          setError("Invalid email or password");
        } else if (errorMessage.includes('auth/email-already-in-use')) {
          setError("This email is already registered");
        } else {
          setError(errorMessage);
        }
      } else {
        setError("An unexpected error occurred");
      }
      
      // Clear auth state
      saveAuthState(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-100 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif flex items-center justify-center gap-2">
            <Heart className="text-journal-blush" /> Our Journal
          </h1>
          <p className="text-gray-600 mt-2">
            {isRegister ? "Create an account to start journaling" : "Sign in to continue journaling"}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Your name"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="your.email@example.com"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>
            
            {isRegister && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
            
            <LoadingButton
              type="submit"
              className="w-full py-3"
              loading={loading}
            >
              {isRegister ? "Create Account" : "Sign In"}
            </LoadingButton>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              className="text-journal-lavender hover:underline focus:outline-none"
              onClick={() => setIsRegister(!isRegister)}
              disabled={loading}
            >
              {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </button>
          </div>
          
          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:underline">
              Back to Welcome Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
