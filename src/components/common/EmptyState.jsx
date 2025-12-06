// components/common/EmptyState.jsx
import React from 'react';
import Button from './button';

const EmptyState = ({
  icon = '📊',
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  actionLabel,
  onAction,
  actionIcon,
  children
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <Button
          variant="primary"
          icon={actionIcon}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
      
      {children}
    </div>
  );
};

export default EmptyState;