import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  bordered = true,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg overflow-hidden
        ${bordered ? 'border border-secondary-200' : ''}
        ${hoverable ? 'transition-shadow duration-300 hover:shadow-card-hover shadow-card' : 'shadow-sm'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 border-b border-secondary-200 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 border-t border-secondary-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;