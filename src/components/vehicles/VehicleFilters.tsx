import React from 'react';
import { useForm } from 'react-hook-form';
import { Search, Filter, MapPin, X } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useVehicleStore } from '../../store/vehicleStore';
import type { CategoryType } from '../../types';

interface FiltersFormData {
  searchQuery: string;
  location: string;
  category: CategoryType | '';
  priceMin: string;
  priceMax: string;
  type: 'car' | 'bike' | 'all' | '';
}

const VehicleFilters: React.FC = () => {
  const { filters, setFilters, clearFilters } = useVehicleStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<FiltersFormData>({
    defaultValues: {
      searchQuery: filters.searchQuery || '',
      location: filters.location || '',
      category: filters.category || '',
      priceMin: filters.priceMin?.toString() || '',
      priceMax: filters.priceMax?.toString() || '',
      type: filters.type || '',
    },
  });

  const onSubmit = (data: FiltersFormData) => {
    const newFilters = {
      searchQuery: data.searchQuery,
      location: data.location,
      category: data.category as CategoryType | undefined,
      priceMin: data.priceMin ? parseInt(data.priceMin) : undefined,
      priceMax: data.priceMax ? parseInt(data.priceMax) : undefined,
      available: true,
      type: data.type === '' ? undefined : data.type,
    };

    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    clearFilters();
    reset({
      searchQuery: '',
      location: '',
      category: '',
      priceMin: '',
      priceMax: '',
      type: '',
    });
  };

  return (
    <Card className="p-4 mb-6 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-secondary-900 flex items-center">
          <Filter size={18} className="mr-2" />
          Filters
        </h2>
        {isDirty && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <X size={16} className="mr-1" />
            Clear
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            placeholder="Search by make or model"
            leftIcon={<Search size={18} />}
            {...register('searchQuery')}
            fullWidth
          />
        </div>

        <div>
          <Input
            placeholder="Location"
            leftIcon={<MapPin size={18} />}
            {...register('location')}
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Vehicle Type
          </label>
          <select
            className="w-full rounded-md border border-secondary-300 py-2 px-4 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            {...register('type')}
          >
            <option value="">All Types</option>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Vehicle Category
          </label>
          <select
            className="w-full rounded-md border border-secondary-300 py-2 px-4 bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            {...register('category')}
          >
            <option value="">All Categories</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="luxury">Luxury</option>
            <option value="compact">Compact</option>
            <option value="pickup">Pickup</option>
            <option value="minivan">Minivan</option>
            <option value="convertible">Convertible</option>
            <option value="electric">Electric</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Price Range (per day)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min"
              type="number"
              min="0"
              {...register('priceMin')}
            />
            <Input
              placeholder="Max"
              type="number"
              min="0"
              {...register('priceMax')}
            />
          </div>
        </div>

        <Button type="submit" fullWidth>
          Apply Filters
        </Button>
      </form>
    </Card>
  );
};

export default VehicleFilters;
