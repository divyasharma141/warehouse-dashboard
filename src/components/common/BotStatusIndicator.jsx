// components/common/BotStatusIndicator.jsx
import React from 'react';
import { 
  FaRobot, 
  FaRunning, 
  FaPause, 
  FaBolt, 
  FaExclamationTriangle,
  FaBatteryFull,
  FaBatteryThreeQuarters,
  FaBatteryHalf,
  FaBatteryQuarter
} from 'react-icons/fa';

const BotStatusIndicator = ({ 
  bot,
  size = 'md',
  showName = true,
  showBattery = true,
  showStatus = true,
  onClick 
}) => {
  const statusConfig = {
    busy: {
      icon: <FaRunning className="text-green-600" />,
      label: 'Active',
      color: 'green'
    },
    idle: {
      icon: <FaPause className="text-yellow-600" />,
      label: 'Idle',
      color: 'yellow'
    },
    charging: {
      icon: <FaBolt className="text-blue-600" />,
      label: 'Charging',
      color: 'blue'
    },
    error: {
      icon: <FaExclamationTriangle className="text-red-600" />,
      label: 'Error',
      color: 'red'
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const batteryIcon = () => {
    if (bot.battery >= 80) return <FaBatteryFull className="text-green-500" />;
    if (bot.battery >= 60) return <FaBatteryThreeQuarters className="text-green-400" />;
    if (bot.battery >= 40) return <FaBatteryHalf className="text-yellow-500" />;
    if (bot.battery >= 20) return <FaBatteryQuarter className="text-orange-500" />;
    return <FaBatteryQuarter className="text-red-500" />;
  };

  const config = statusConfig[bot.status] || statusConfig.idle;

  return (
    <div 
      className={`flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${
        config.color === 'green' ? 'bg-green-100' :
        config.color === 'yellow' ? 'bg-yellow-100' :
        config.color === 'blue' ? 'bg-blue-100' :
        'bg-red-100'
      }`}>
        {config.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        {showName && (
          <div className="font-medium text-gray-900 truncate">{bot.name}</div>
        )}
        
        <div className="flex items-center space-x-4">
          {showStatus && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              config.color === 'green' ? 'bg-green-100 text-green-800' :
              config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              config.color === 'blue' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {config.label}
            </span>
          )}
          
          {showBattery && (
            <div className="flex items-center text-xs text-gray-600">
              {batteryIcon()}
              <span className="ml-1">{bot.battery}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotStatusIndicator;