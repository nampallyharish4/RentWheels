import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Menu, X, LogIn, User, Home, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import SuccessModal from '../ui/SuccessModal';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const [showSignoutModal, setShowSignoutModal] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={24} /> },
    { name: 'Vehicles', path: '/vehicles', icon: <Car size={24} /> },
  ];

  const handleLogout = async () => {
    await logout();
    setShowSignoutModal(true);
    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Car className="h-10 w-10 text-orange-600" />
              <span className="ml-3 text-2xl font-bold text-gray-900">
                RentWheels
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-6 py-3 rounded-md text-lg font-medium ${
                  isActive(link.path)
                    ? 'text-orange-700 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                } transition-colors duration-200`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}

            {profile ? (
              <div className="flex items-center space-x-8">
                <Link to="/dashboard">
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<User size={20} />}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="lg"
                  onClick={handleLogout}
                  className="text-white hover:bg-red-700"
                  leftIcon={<LogOut size={20} />}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-8">
                <Link to="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<LogIn size={20} />}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="lg"
                    className="bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-3 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-6 py-4 rounded-md text-lg font-medium ${
                  isActive(link.path)
                    ? 'text-orange-700 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="mr-3">{link.icon}</span>
                {link.name}
              </Link>
            ))}

            {profile ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center px-6 py-4 rounded-md text-lg font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={24} className="mr-3" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-6 py-4 rounded-md text-lg font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut size={24} className="mr-3" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center px-6 py-4 rounded-md text-lg font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn size={24} className="mr-3" />
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center px-6 py-4 rounded-md text-lg font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      <SuccessModal
        isOpen={showSignoutModal}
        onClose={() => setShowSignoutModal(false)}
        title="Signed Out"
        message="You have successfully signed out."
      />
    </nav>
  );
};

export default Navbar;
