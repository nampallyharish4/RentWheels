import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, LogIn, User, Home } from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Vehicles', path: '/vehicles', icon: <Car size={18} /> },
  ];
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Car className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-secondary-900">RentWheels</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.path)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50'
                } transition-colors duration-200`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<User size={16} />}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logout()}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<LogIn size={16} />}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-secondary-400 hover:text-secondary-500 hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-secondary-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'text-primary-700 bg-primary-50'
                    : 'text-secondary-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-2">{link.icon}</span>
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={18} className="mr-2" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn size={18} className="mr-2" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;