
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Book, Image, Trophy, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { currentUser, logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const navItems = [
    { path: '/dashboard', icon: <Home size={20} />, label: 'Home' },
    { path: '/journal', icon: <Book size={20} />, label: 'Journal' },
    { path: '/memories', icon: <Image size={20} />, label: 'Memories' },
    { path: '/milestones', icon: <Trophy size={20} />, label: 'Milestones' },
    { path: '/settings', icon: <User size={20} />, label: 'Settings' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="py-4 px-6 bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-40">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <NavLink to="/dashboard" className="text-xl font-serif text-gray-800 flex items-center gap-2">
            <span className="text-journal-blush">❤</span> Our Journal
          </NavLink>

          {isMobile ? (
            <>
              <button 
                onClick={toggleMobileMenu}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              {mobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white shadow-md py-4 px-6 flex flex-col space-y-4 z-50">
                  {navItems.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => 
                        `flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                          isActive ? 'bg-pink-50 text-journal-blush' : 'text-gray-700 hover:bg-gray-100'
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                  
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1">
              {navItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                      isActive ? 'bg-pink-50 text-journal-blush' : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 px-3 ml-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
