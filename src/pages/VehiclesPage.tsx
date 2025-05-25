import React, { useEffect } from 'react';
import { Car } from 'lucide-react';
import VehicleCard from '../components/vehicles/VehicleCard';
import VehicleFilters from '../components/vehicles/VehicleFilters';
import { useVehicleStore } from '../store/vehicleStore';

const VehiclesPage: React.FC = () => {
  const { vehicles, fetchVehicles, isLoading, error } = useVehicleStore();
  
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);
  
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Available Vehicles</h1>
        <p className="text-secondary-600">
          Browse our selection of quality vehicles for your next adventure
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-1/4">
          <VehicleFilters />
        </div>
        
        {/* Vehicle Grid */}
        <div className="w-full lg:w-3/4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
              <p className="text-red-700">Error loading vehicles: {error}</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Car size={48} className="mx-auto text-secondary-300 mb-4" />
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">No Vehicles Found</h2>
              <p className="text-secondary-600 max-w-md mx-auto">
                We couldn't find any vehicles matching your search criteria. Try adjusting your filters or check back later.
              </p>
            </div>
          ) : (
            <>
              <p className="text-secondary-600 mb-6">{vehicles.length} vehicles found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;