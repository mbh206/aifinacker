import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectExpenseCategories } from '../slices/expensesSlice';

// Types
interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface ExpenseFiltersProps {
  onCategoryChange: (category: string) => void;
  onDateRangeChange: (dateRange: DateRange | null) => void;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  selectedDateRange: DateRange | null;
  searchQuery: string;
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({
  onCategoryChange,
  onDateRangeChange,
  onSearchChange,
  selectedCategory = 'all',
  selectedDateRange = null,
  searchQuery = '',
}) => {
  const categories = useSelector(selectExpenseCategories);
  const [isExpanded, setIsExpanded] = useState(false);

  // Pre-defined date ranges
  const dateRanges = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'thisWeek', label: 'This Week' },
    { id: 'lastWeek', label: 'Last Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    setShowCustomRange(presetId === 'custom');

    if (presetId === 'custom') {
      // Keep current custom range if present, otherwise use empty range
      if (!customStartDate && !customEndDate && selectedDateRange) {
        setCustomStartDate(selectedDateRange.startDate || '');
        setCustomEndDate(selectedDateRange.endDate || '');
      }
      return;
    }

    // Calculate date range based on preset
    const today = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (presetId) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        break;
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 1);
        endDate = new Date(startDate);
        break;
      case 'thisWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay()); // First day of current week (Sunday)
        endDate = new Date(today);
        break;
      case 'lastWeek':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay() - 7); // First day of last week
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Last day of last week
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today);
        break;
      default:
        break;
    }

    if (startDate && endDate) {
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      onDateRangeChange({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
    } else {
      onDateRangeChange(null);
    }
  };

  const applyCustomDateRange = () => {
    if (customStartDate || customEndDate) {
      onDateRangeChange({
        startDate: customStartDate,
        endDate: customEndDate,
      });
    } else {
      onDateRangeChange(null);
    }
  };

  const clearFilters = () => {
    onCategoryChange('all');
    onDateRangeChange(null);
    onSearchChange('');
    setSelectedPreset(null);
    setShowCustomRange(false);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const areFiltersActive =
    selectedCategory !== 'all' ||
    !!selectedDateRange ||
    searchQuery.trim() !== '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
      {/* Simple Search and Expand Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div className="flex-grow">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search expenses..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition duration-200"
        >
          <span className="mr-2">Filters</span>
          <svg
            className={`h-5 w-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {areFiltersActive && (
          <button
            onClick={clearFilters}
            className="flex items-center justify-center px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40 rounded-lg transition duration-200"
          >
            <span className="mr-2">Clear</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={selectedPreset || ''}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              {dateRanges.map(range => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {showCustomRange && (
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  onClick={applyCustomDateRange}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                >
                  Apply Custom Range
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {areFiltersActive && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Category: {selectedCategory}
              <button
                onClick={() => onCategoryChange('all')}
                className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}

          {selectedDateRange && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              Date: {selectedDateRange.startDate && formatDateDisplay(selectedDateRange.startDate)}
              {selectedDateRange.startDate && selectedDateRange.endDate && ' to '}
              {selectedDateRange.endDate && formatDateDisplay(selectedDateRange.endDate)}
              <button
                onClick={() => {
                  onDateRangeChange(null);
                  setSelectedPreset(null);
                  setShowCustomRange(false);
                }}
                className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}

          {searchQuery.trim() !== '' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Search: "{searchQuery}"
              <button
                onClick={() => onSearchChange('')}
                className="ml-1 text-purple-600 hover:text-purple-800 dark:text-purple-400 focus:outline-none"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to format date for display
const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default ExpenseFilters;
