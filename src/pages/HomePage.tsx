import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  ArrowRight,
  MapPin,
  Calendar,
  Tag,
  KeyRound,
  DollarSign,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import { useVehicleStore } from '../store/vehicleStore';
import { useAuthStore } from '../store/authStore';
import { Fade, Slide } from 'react-awesome-reveal';
import FeedbackSection from '../components/feedback/FeedbackSection';

const HomePage: React.FC = () => {
  const { featuredVehicles, fetchFeaturedVehicles, isLoading } =
    useVehicleStore();
  const { profile } = useAuthStore();

  useEffect(() => {
    fetchFeaturedVehicles();
  }, [fetchFeaturedVehicles]);

  // Use actual featuredVehicles from the store, but keep dummy for fallback if needed
  const vehiclesToDisplay =
    featuredVehicles.length > 0
      ? featuredVehicles
      : [
          {
            id: 'dummy1',
            make: 'Toyota',
            model: 'Camry',
            year: 2022,
            imageUrl:
              'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2Fyc3xlbnwwfHwwfHx8MA%3D%3D',
            dailyRate: 4000,
            location: 'Mumbai, Maharashtra',
            category: 'sedan',
            available: true,
          },
          {
            id: 'dummy2',
            make: 'Honda',
            model: 'CR-V',
            year: 2021,
            imageUrl:
              'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Y2Fyc3xlbnwwfHwwfHx8MA%3D%3D',
            dailyRate: 5500,
            location: 'Delhi, NCR',
            category: 'suv',
            available: true,
          },
          {
            id: 'dummy3',
            make: 'Ford',
            model: 'Mustang',
            year: 2023,
            imageUrl:
              'https://images.unsplash.com/photo-1580481704819-eded13783bb4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjJ8fGNhcnN8ZW58MHx8MHx8fDA%3D',
            dailyRate: 8000,
            location: 'Bangalore, Karnataka',
            category: 'coupe',
            available: true,
          },
          {
            id: 'dummy4',
            make: 'Maruti Suzuki',
            model: 'Swift',
            year: 2022,
            imageUrl:
              'https://images.unsplash.com/photo-1542282085-2e9f6621d9ee?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGNhcnN8ZW58MHx8MHx8fDA%3D',
            dailyRate: 3000,
            location: 'Chennai, Tamil Nadu',
            category: 'hatchback',
            available: true,
          },
          {
            id: 'dummy5',
            make: 'Mahindra',
            model: 'Thar',
            year: 2023,
            imageUrl:
              'https://images.unsplash.com/photo-1621381721842-a0d6b4272127?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzZ8fGNhcnN8ZW58MHx8MHx8fDA%3D',
            dailyRate: 6000,
            location: 'Pune, Maharashtra',
            category: 'suv',
            available: true,
          },
        ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary-900 to-secondary-800/90 z-10" />

        <div className="relative bg-[url('https://images.unsplash.com/photo-1605554032901-e02f422295c2?w=1400&auto=format&fit=crop&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center h-[600px] flex items-center">
          <div className="container mx-auto px-4 relative z-20 text-white">
            <Fade direction="up" triggerOnce>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Find Your Perfect Ride,{''}
                <span className="text-primary-500">Anytime, Anywhere</span>
              </h1>
            </Fade>
            <Fade direction="up" delay={200} triggerOnce>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                Discover the freedom of the open road with our premium vehicle
                rental service. From city cruisers to luxury rides, we've got
                you covered.
              </p>
            </Fade>

            <div className="flex flex-col sm:flex-row gap-4">
              <Fade direction="up" delay={400} triggerOnce>
                <Link to="/vehicles">
                  <Button size="lg">Browse Vehicles</Button>
                </Link>
              </Fade>
              {!profile && (
                <Fade direction="up" delay={500} triggerOnce>
                  <Link to="/signup">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                    >
                      Create Account
                    </Button>
                  </Link>
                </Fade>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Positioned below hero and slightly overlapping */}
        <div className="container mx-auto px-4 relative -mt-16 z-30">
          <Fade direction="up" delay={600} triggerOnce>
            <Card className="p-6 shadow-lg">
              <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400"
                      size={18}
                    />
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
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400"
                      size={18}
                    />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Drop-off Date
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400"
                      size={18}
                    />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
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
          </Fade>
        </div>
      </section>

      {/* How It Works / Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Fade direction="up" triggerOnce>
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto mb-12">
              Experience seamless vehicle rentals with our trusted service.
            </p>
          </Fade>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Slide direction="up" triggerOnce>
              <div className="flex flex-col items-center p-6 bg-secondary-50 rounded-lg shadow-sm">
                <div className="p-3 bg-primary-100 rounded-full mb-4">
                  <Car size={24} className="text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Wide Selection
                </h3>
                <p className="text-secondary-600 text-center">
                  Choose from a diverse range of cars and bikes to suit any
                  need.
                </p>
              </div>
            </Slide>
            <Slide direction="up" delay={100} triggerOnce>
              <div className="flex flex-col items-center p-6 bg-secondary-50 rounded-lg shadow-sm">
                <div className="p-3 bg-green-100 rounded-full mb-4">
                  <KeyRound size={24} className="text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Easy Booking
                </h3>
                <p className="text-secondary-600 text-center">
                  Rent a vehicle in just a few simple steps online.
                </p>
              </div>
            </Slide>
            <Slide direction="up" delay={200} triggerOnce>
              <div className="flex flex-col items-center p-6 bg-secondary-50 rounded-lg shadow-sm">
                <div className="p-3 bg-yellow-100 rounded-full mb-4">
                  <DollarSign size={24} className="text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-2">
                  Best Prices
                </h3>
                <p className="text-secondary-600 text-center">
                  Get competitive rates with no hidden fees.
                </p>
              </div>
            </Slide>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-16 bg-secondary-50">
        <div className="container mx-auto px-4">
          <Fade direction="up" triggerOnce>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-secondary-900 mb-2">
                  Featured Vehicles
                </h2>
                <p className="text-secondary-600">
                  Explore our most popular vehicles for your next adventure
                </p>
              </div>

              <Link
                to="/vehicles"
                className="mt-4 md:mt-0 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
                <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
          </Fade>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehiclesToDisplay.map((vehicle) => (
                <Slide direction="up" triggerOnce key={vehicle.id}>
                  <Card className="transition-all duration-300 h-full flex flex-col overflow-hidden">
                    <div className="relative h-48">
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary-700">
                        ₹{vehicle.dailyRate}/day
                      </div>
                      {vehicle.available && (
                        <span className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium">
                          Available
                        </span>
                      )}
                    </div>

                    <CardContent className="flex-1 flex flex-col">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-secondary-900">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="flex items-center text-secondary-500 text-sm mt-1">
                          <Calendar size={16} className="mr-1" />
                          <span>{vehicle.year}</span>
                          <span className="mx-2">•</span>
                          <Tag size={16} className="mr-1" />
                          <span className="capitalize">{vehicle.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-secondary-600 text-sm mb-4">
                        <MapPin
                          size={16}
                          className="mr-1 text-primary-600 flex-shrink-0"
                        />
                        <span className="truncate">{vehicle.location}</span>
                      </div>

                      <p className="text-2xl font-bold text-primary-700 mt-auto mb-3">
                        ₹{vehicle.dailyRate}
                        <span className="text-sm font-normal text-secondary-600">
                          /day
                        </span>
                      </p>

                      <div className="mt-auto pt-3 border-t border-secondary-100">
                        <Link to="/vehicles">
                          <Button variant="primary" fullWidth>
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </Slide>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Feedback Section */}
      <FeedbackSection />

      {/* Call to Action Section */}
      <section className="py-20 bg-primary-600 text-white text-center">
        <Fade direction="up" triggerOnce>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
            Browse our extensive collection of vehicles or list your own to
            start earning.
          </p>
        </Fade>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Slide direction="up" delay={100} triggerOnce>
            <Link to="/vehicles">
              <Button size="lg" variant="secondary">
                Browse Vehicles
              </Button>
            </Link>
          </Slide>
          {!profile && (
            <Slide direction="up" delay={200} triggerOnce>
              <Link to="/vehicles/add">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-100 text-primary-100 hover:bg-primary-700 hover:border-primary-700"
                >
                  List Your Vehicle
                </Button>
              </Link>
            </Slide>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
