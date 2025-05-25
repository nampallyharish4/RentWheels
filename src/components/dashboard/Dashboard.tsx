import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, CalendarCheck, Plus, User, Clock, AlertTriangle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useBookingStore } from '../../store/bookingStore';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user, profile } = useAuthStore();
  const { bookings, fetchUserBookings, isLoading } = useBookingStore();
  const [activeTab, setActiveTab] = useState<'bookings' | 'vehicles'>('bookings');
  
  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user, fetchUserBookings]);
  
  if (!user || !profile) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-secondary-900 mb-2">Authentication Required</h2>
            <p className="text-secondary-600 mb-6">
              Please sign in to access your dashboard.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline">Create Account</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">
            Welcome back, {profile.firstName || profile.email.split('@')[0]}!
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link to="/vehicles/add">
            <Button
              variant="outline"
              leftIcon={<Plus size={16} />}
            >
              List a Vehicle
            </Button>
          </Link>
          <Link to="/vehicles">
            <Button leftIcon={<Car size={16} />}>
              Rent a Vehicle
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-full mr-4">
                <CalendarCheck className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-secondary-600 text-sm">Active Bookings</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-secondary-600 text-sm">Listed Vehicles</p>
                <p className="text-2xl font-bold text-secondary-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center">
              <div className="bg-secondary-100 p-3 rounded-full mr-4">
                <Clock className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <p className="text-secondary-600 text-sm">Completed Trips</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6 border-b border-secondary-200">
        <div className="flex space-x-8">
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'bookings'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
            onClick={() => setActiveTab('bookings')}
          >
            My Bookings
          </button>
          <button
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'vehicles'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
            }`}
            onClick={() => setActiveTab('vehicles')}
          >
            My Vehicles
          </button>
        </div>
      </div>
      
      {activeTab === 'bookings' && (
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-secondary-900">Recent Bookings</h2>
            </CardHeader>
            
            {isLoading ? (
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-secondary-600 mt-4">Loading your bookings...</p>
              </CardContent>
            ) : bookings.length === 0 ? (
              <CardContent className="text-center py-12">
                <div className="bg-secondary-100 p-3 rounded-full mx-auto w-fit">
                  <CalendarCheck className="h-8 w-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-medium text-secondary-900 mt-4">No Bookings Yet</h3>
                <p className="text-secondary-600 mt-2 max-w-md mx-auto">
                  You haven't made any bookings yet. Start by browsing available vehicles and book your first ride!
                </p>
                <div className="mt-6">
                  <Link to="/vehicles">
                    <Button>Browse Vehicles</Button>
                  </Link>
                </div>
              </CardContent>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Booking ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Vehicle
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                          {booking.id.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {format(new Date(booking.startDate), 'MMM dd')} - {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          {booking.vehicleId.substring(0, 8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-600">
                          ${booking.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link to={`/booking/${booking.id}`} className="text-primary-600 hover:text-primary-900">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
      
      {activeTab === 'vehicles' && (
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-secondary-900">My Vehicles</h2>
            </CardHeader>
            
            <CardContent className="text-center py-12">
              <div className="bg-secondary-100 p-3 rounded-full mx-auto w-fit">
                <Car className="h-8 w-8 text-secondary-400" />
              </div>
              <h3 className="text-lg font-medium text-secondary-900 mt-4">No Vehicles Listed</h3>
              <p className="text-secondary-600 mt-2 max-w-md mx-auto">
                You haven't listed any vehicles yet. Start earning by sharing your vehicle with others!
              </p>
              <div className="mt-6">
                <Link to="/vehicles/add">
                  <Button leftIcon={<Plus size={16} />}>
                    List a Vehicle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
              <User size={20} className="mr-2 text-primary-600" />
              Profile Information
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-secondary-500">Email</p>
                <p className="font-medium text-secondary-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Name</p>
                <p className="font-medium text-secondary-900">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Phone</p>
                <p className="font-medium text-secondary-900">
                  {profile.phone || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-500">Member Since</p>
                <p className="font-medium text-secondary-900">
                  {format(new Date(profile.createdAt), 'MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Link to="/profile">
                <Button variant="outline">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;