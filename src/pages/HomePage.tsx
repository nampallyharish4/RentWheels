import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Car, Shield, Clock, Star, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import VehicleCard from '../components/vehicles/VehicleCard';
import { useVehicleStore } from '../store/vehicleStore';

const HomePage: React.FC = () => {
  const { featuredVehicles, fetchFeaturedVehicles, isLoading } = useVehicleStore();
  
  useEffect(() => {
    fetchFeaturedVehicles();
  }, [fetchFeaturedVehicles]);
  
  return (
    <>
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 to-secondary-800/90 z-10" />
        
        <div className="relative bg-[url('https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center h-[600px]">
          <div className="container mx-auto px-4 h-full flex items-center relative z-20">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Find Your Perfect Ride, <span className="text-primary-500">Anytime, Anywhere</span>
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Discover the freedom of the open road with our premium vehicle rental service. From city cruisers to luxury rides, we've got you covered.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/vehicles">
                  <Button size="lg">
                    Browse Vehicles
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="container mx-auto px-4 relative -mt-16 z-30">
          <Card className="p-6 shadow-lg">
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={18} />
                  <input
                    type="text"
                    placeholder="City, Airport, etc."
                    className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Pick-up Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Drop-off Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-end">
                <Link to="/vehicles" className="w-full">
                  <Button fullWidth className="h-10">
                    Search Vehicles
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </section>
      
      {/* Featured Vehicles */}
      <section className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-2">Featured Vehicles</h2>
              <p className="text-secondary-600">Explore our most popular vehicles for your next adventure</p>
            </div>
            
            <Link to="/vehicles" className="mt-4 md:mt-0 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
              View All
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
              
              {featuredVehicles.length === 0 && (
                <div className="col-span-3 text-center py-10">
                  <Car size={48} className="mx-auto text-secondary-300 mb-4" />
                  <h3 className="text-xl font-semibold text-secondary-900 mb-2">No Vehicles Available</h3>
                  <p className="text-secondary-600 max-w-md mx-auto">
                    Check back soon as our inventory is regularly updated with new vehicles.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-3">How It Works</h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              Renting a vehicle with us is quick and hassle-free. Follow these simple steps to get on the road.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">1. Browse Vehicles</h3>
              <p className="text-secondary-600">
                Search our extensive collection of vehicles based on your preferences and location.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">2. Book Your Ride</h3>
              <p className="text-secondary-600">
                Select your dates and complete the booking process in just a few clicks.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-2">3. Enjoy Your Trip</h3>
              <p className="text-secondary-600">
                Pick up your vehicle at the designated location and hit the road with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Advantages */}
      <section className="py-16 bg-secondary-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose RentWheels</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              We're committed to providing you with the best vehicle rental experience possible.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-secondary-800/50 p-6 rounded-lg backdrop-blur-sm">
              <Shield className="h-10 w-10 text-primary-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
              <p className="text-white/70">
                All our vehicles are regularly maintained and fully insured for your peace of mind.
              </p>
            </div>
            
            <div className="bg-secondary-800/50 p-6 rounded-lg backdrop-blur-sm">
              <Clock className="h-10 w-10 text-primary-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
              <p className="text-white/70">
                Our customer support team is available round the clock to assist you with any queries.
              </p>
            </div>
            
            <div className="bg-secondary-800/50 p-6 rounded-lg backdrop-blur-sm">
              <Star className="h-10 w-10 text-primary-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Premium Vehicles</h3>
              <p className="text-white/70">
                Choose from a wide range of high-quality vehicles to suit your style and needs.
              </p>
            </div>
            
            <div className="bg-secondary-800/50 p-6 rounded-lg backdrop-blur-sm">
              <ArrowRight className="h-10 w-10 text-primary-500 mb-4" />
              <h3 className="text-xl font-bold mb-2">Flexible Options</h3>
              <p className="text-white/70">
                From short trips to extended journeys, we have flexible rental options for every occasion.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-2/3 mb-8 lg:mb-0 lg:pr-10">
                <h2 className="text-3xl font-bold text-secondary-900 mb-4">Ready to Hit the Road?</h2>
                <p className="text-secondary-600 text-lg mb-6">
                  Join thousands of satisfied customers who have experienced the freedom and convenience of RentWheels. Sign up today and get special offers on your first booking.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/signup">
                    <Button size="lg">
                      Create Free Account
                    </Button>
                  </Link>
                  <Link to="/vehicles">
                    <Button variant="outline" size="lg">
                      Browse Vehicles
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="lg:w-1/3">
                <img
                  src="https://images.pexels.com/photos/8050798/pexels-photo-8050798.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Happy customer with car keys"
                  className="rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;