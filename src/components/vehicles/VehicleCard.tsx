import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Tag } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import type { Vehicle } from '../../types';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const { id, make, model, year, imageUrl, dailyRate, location, category } = vehicle;
  
  return (
    <Card hoverable className="transition-all duration-300 h-full flex flex-col overflow-hidden">
      <div className="relative">
        <img 
          src={imageUrl || 'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800'} 
          alt={`${make} ${model}`}
          className="h-48 w-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary-700">
          ${dailyRate}/day
        </div>
      </div>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-secondary-900">
            {make} {model}
          </h3>
          <div className="flex items-center text-secondary-500 text-sm mt-1">
            <Calendar size={16} className="mr-1" />
            <span>{year}</span>
            <span className="mx-2">•</span>
            <Tag size={16} className="mr-1" />
            <span className="capitalize">{category}</span>
          </div>
        </div>
        
        <div className="flex items-center text-secondary-600 text-sm mb-4">
          <MapPin size={16} className="mr-1 text-primary-600 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        
        <div className="mt-auto pt-3 border-t border-secondary-100">
          <Link to={`/vehicles/${id}`}>
            <Button variant="primary" fullWidth>
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;