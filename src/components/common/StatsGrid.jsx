// components/common/StatsGrid.jsx
import React from 'react';
import KPICard from './KPICard';

const StatsGrid = ({ 
  stats,
  columns = 4,
  onCardClick 
}) => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 mb-8`}>
      {stats.map((stat, index) => (
        <KPICard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          change={stat.change}
          isPositive={stat.isPositive}
          subtitle={stat.subtitle}
          color={stat.color}
          onClick={() => onCardClick && onCardClick(stat)}
        />
      ))}
    </div>
  );
};

export default StatsGrid;