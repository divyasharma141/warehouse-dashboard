// components/common/PageHeader.jsx
import React from 'react';
import { FaCalendar, FaSync } from 'react-icons/fa';

const PageHeader = ({ 
  title, 
  subtitle, 
  stats,
  lastUpdated,
  children 
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <p className="text-gray-600">{subtitle}</p>
            {lastUpdated && (
              <span className="text-sm text-gray-500 flex items-center">
                <FaCalendar className="mr-1" />
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          {stats && (
            <div className="flex flex-wrap gap-4 mt-3">
              {stats.map((stat, index) => (
                <div key={index} className="text-sm">
                  <span className="text-gray-600">{stat.label}: </span>
                  <span className="font-bold" style={{ color: stat.color }}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;