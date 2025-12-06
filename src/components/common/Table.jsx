// components/common/DataTable.jsx
import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const DataTable = ({
  columns,
  data,
  onSort,
  sortColumn,
  sortDirection,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false
}) => {
  const handleSort = (columnId) => {
    if (onSort) {
      onSort(columnId);
    }
  };

  const getSortIcon = (columnId) => {
    if (sortColumn !== columnId) return <FaSort className="text-gray-400" />;
    return sortDirection === 'asc' 
      ? <FaSortUp className="text-blue-500" /> 
      : <FaSortDown className="text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-12 text-center">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(column.id)}
                        className="ml-1 focus:outline-none"
                      >
                        {getSortIcon(column.id)}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-gray-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((column) => (
                  <td key={column.id} className="px-6 py-4 whitespace-nowrap">
                    {column.render 
                      ? column.render(row[column.id], row)
                      : row[column.id]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;