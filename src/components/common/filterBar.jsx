// components/common/FilterBar.jsx
import React from 'react';
import { FaFilter, FaSort, FaSearch } from 'react-icons/fa';

const FilterBar = ({
  filters = [],
  onFilterChange,
  onSortChange,
  onSearch,
  searchPlaceholder = 'Search...',
  sortOptions = [],
  defaultSort = 'newest'
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedFilters, setSelectedFilters] = React.useState({});

  const handleFilterChange = (filterId, value) => {
    const newFilters = { ...selectedFilters, [filterId]: value };
    setSelectedFilters(newFilters);
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {filter.label}
              </label>
              <select
                value={selectedFilters[filter.id] || ''}
                onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Search and Sort */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button
              type="submit"
              className="ml-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-black"
            >
              Search
            </button>
          </form>

          {/* Sort */}
          {sortOptions.length > 0 && (
            <div className="flex items-center">
              <FaSort className="text-gray-500 mr-2" />
              <select
                onChange={(e) => onSortChange && onSortChange(e.target.value)}
                defaultValue={defaultSort}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;