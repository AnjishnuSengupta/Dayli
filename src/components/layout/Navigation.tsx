
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, 
  BookOpen, 
  Image, 
  Award,
  Music,
  Settings,
  Menu,
  X,
  User
} from 'lucide-react';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { 
      name: 'Home', 
      path: '/dashboard', 
      icon: <Heart className="mr-2" size={18} /> 
    },
    { 
      name: 'Journal', 
      path: '/journal', 
      icon: <BookOpen className="mr-2" size={18} /> 
    },
    { 
      name: 'Memories', 
      path: '/memories', 
      icon: <Image className="mr-2" size={18} /> 
    },
    { 
      name: 'Milestones', 
      path: '/milestones', 
      icon: <Award className="mr-2" size={18} /> 
    },
    { 
      name: 'Music', 
      path: '/music', 
      icon: <Music className="mr-2" size={18} /> 
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <Settings className="mr-2" size={18} /> 
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-10">
      <nav className="glass mx-4 my-4 rounded-full px-4 py-2 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Heart fill="#FFDEE2" className="text-journal-blush" />
          <h1 className="font-serif text-lg font-medium">Our Journal</h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`px-3 py-2 rounded-full flex items-center text-sm transition-all ${
                isActive(item.path) 
                  ? 'bg-white/80 shadow-sm' 
                  : 'hover:bg-white/50'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden rounded-full p-2 hover:bg-white/50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass mx-4 mt-1 rounded-2xl p-4 shadow-lg animate-fade-in">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-3 rounded-xl flex items-center transition-all ${
                  isActive(item.path) 
                    ? 'bg-white/80 shadow-sm' 
                    : 'hover:bg-white/50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
