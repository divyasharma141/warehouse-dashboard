// components/common/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status, size = 'md', showIcon = false }) => {
  const statusConfig = {
    busy: {
      label: 'Active',
      color: 'green',
      icon: '🟢'
    },
    idle: {
      label: 'Idle',
      color: 'yellow',
      icon: '🟡'
    },
    charging: {
      label: 'Charging',
      color: 'blue',
      icon: '🔵'
    },
    error: {
      label: 'Error',
      color: 'red',
      icon: '🔴'
    },
    pending: {
      label: 'Pending',
      color: 'yellow',
      icon: '⏳'
    },
    completed: {
      label: 'Completed',
      color: 'green',
      icon: '✅'
    },
    'in-progress': {
      label: 'In Progress',
      color: 'blue',
      icon: '⚙️'
    }
  };

  const config = statusConfig[status] || statusConfig.idle;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <span className={`${sizeClasses[size]} ${colorClasses[config.color]} rounded-full font-medium border inline-flex items-center`}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </span>
  );
};

export default StatusBadge;