import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import { getAuthState } from "./utils/authStorage";

// Import pages
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import Memories from "./pages/Memories";
import Milestones from "./pages/Milestones";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Improved private route component with better error handling
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  try {
    // First check Firebase auth context
    const { currentUser } = useAuth();
    if (currentUser) return <>{children}</>;
    
    // Fallback to secure session storage if context is unavailable
    const isAuthenticated = getAuthState();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  } catch (error) {
    console.error("Error in PrivateRoute:", error);
    
    // Final fallback to session-based auth check
    const isAuthenticated = getAuthState();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
            <Route path="/memories" element={<PrivateRoute><Memories /></PrivateRoute>} />
            <Route path="/milestones" element={<PrivateRoute><Milestones /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
