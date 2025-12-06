// components/common/Card.jsx
import React from 'react';

const Card = ({ 
  children, 
  title, 
  subtitle,
  actions,
  footer,
  className = '',
  hoverable = false,
  onClick
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-6 ${hoverable ? 'hover:shadow-xl transition-shadow duration-300' : ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {(title || actions) && (
        <div className="flex justify-between items-start mb-6">
          <div>
            {title && <h3 className="text-xl font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      <div>{children}</div>
      
      {footer && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;