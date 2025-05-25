import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Facebook, Twitter, Instagram, Mail, PhoneCall, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <Car className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-white">RentWheels</span>
            </Link>
            <p className="text-secondary-300 text-sm">
              Your premium vehicle rental service. Find the perfect ride for any occasion, anytime, anywhere.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary-400 hover:text-primary-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-secondary-400 hover:text-primary-500 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-secondary-300 hover:text-primary-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="text-secondary-300 hover:text-primary-500 transition-colors">
                  Vehicles
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-secondary-300 hover:text-primary-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-secondary-300 hover:text-primary-500 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Vehicle Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Vehicle Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/vehicles?category=sedan" className="text-secondary-300 hover:text-primary-500 transition-colors">
                  Sedans
                </Link>
              </li>
              <li>
                <Link to="/vehicles?category=suv" className="text-secondary-300 hover:text-primary-500 transition-colors">
                  SUVs
                </Link>
              </li>
              <li>
                <Link to="/vehicles?category=luxury" className="text-secondary-300 hover:text-primary-500 transition-colors">
                  Luxury
                </Link>
              </li>
              <li>
                <Link to="/vehicles?category=electric" className="text-secondary-300 hover:text-primary-500 transition-colors">
                  Electric
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-secondary-300">
                  123 Rental Street, Automobile City, AC 12345
                </span>
              </li>
              <li className="flex items-center">
                <PhoneCall size={18} className="text-primary-500 mr-2 flex-shrink-0" />
                <span className="text-secondary-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-primary-500 mr-2 flex-shrink-0" />
                <span className="text-secondary-300">info@rentwheels.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary-800 mt-12 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-secondary-400 text-sm">
              &copy; {new Date().getFullYear()} RentWheels. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-6">
                <li>
                  <Link to="/privacy" className="text-secondary-400 hover:text-primary-500 text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-secondary-400 hover:text-primary-500 text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="text-secondary-400 hover:text-primary-500 text-sm">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;