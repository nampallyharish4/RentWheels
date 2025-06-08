import React from 'react';
import { Star } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';

interface FeedbackCardProps {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({
  name,
  rating,
  comment,
  date,
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-secondary-900">{name}</h3>
            <span className="text-sm text-secondary-500">{date}</span>
          </div>
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={16}
                className={`${
                  index < rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-secondary-300'
                }`}
              />
            ))}
          </div>
          <p className="text-secondary-600 text-sm">{comment}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackCard;
