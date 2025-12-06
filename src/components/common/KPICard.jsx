// components/common/KPICard.jsx
import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const KPICard = ({ 
  title, 
  value, 
  icon, 
  change, 
  isPositive, 
  subtitle,
  color = 'blue',
  onClick 
}) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-500' },
    green: { bg: 'bg-green-50', iconBg: 'bg-green-100', iconColor: 'text-green-500' },
    yellow: { bg: 'bg-yellow-50', iconBg: 'bg-yellow-100', iconColor: 'text-yellow-500' },
    red: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-500' },
    purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-500' },
    gray: { bg: 'bg-gray-50', iconBg: 'bg-gray-100', iconColor: 'text-gray-500' }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div 
      className={`${colors.bg} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colors.iconBg}`}>
          <div className={colors.iconColor}>
            {icon}
          </div>
        </div>
      </div>
      {change && (
        <div className={`flex items-center mt-4 text-sm ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
          {change}
        </div>
      )}
    </div>
  );
};

export default KPICard;