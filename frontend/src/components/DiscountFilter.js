import React, { useState, useEffect } from 'react';
import './DiscountFilter.css';

const DiscountFilter = ({ onFilterChange, loading }) => {
  const [filters, setFilters] = useState({
    category: '',
    company: '',
    source: '',
    status: 'Active',
    featured: '',
    search: ''
  });

  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sources, setSources] = useState([]);

  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const [categoriesRes, companiesRes, sourcesRes] = await Promise.all([
        fetch('/api/discounts/categories'),
        fetch('/api/discounts/companies'),
        fetch('/api/discounts/sources')
      ]);

      const [categoriesData, companiesData, sourcesData] = await Promise.all([
        categoriesRes.json(),
        companiesRes.json(),
        sourcesRes.json()
      ]);

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
      if (companiesData.success) {
        setCompanies(companiesData.companies);
      }
      if (sourcesData.success) {
        setSources(sourcesData.sources);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      category: '',
      company: '',
      source: '',
      status: 'Active',
      featured: '',
      search: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Technology':
        return '💻';
      case 'Travel':
        return '✈️';
      case 'Shopping':
        return '🛒';
      case 'Entertainment':
        return '🎬';
      case 'Health & Wellness':
        return '🏥';
      case 'Education':
        return '📚';
      case 'Books & Media':
        return '📖';
      case 'Food & Dining':
        return '🍽️';
      case 'Insurance':
        return '🛡️';
      case 'Financial Services':
        return '💰';
      default:
        return '🎁';
    }
  };

  return (
    <div className="discount-filter">
      <div className="filter-header">
        <h3>Filter Discounts</h3>
        <button 
          className="clear-filters-btn"
          onClick={handleClearFilters}
          disabled={loading}
        >
          Clear All
        </button>
      </div>

      <div className="filter-sections">
        {/* Search */}
        <div className="filter-section">
          <label htmlFor="search">Search Discounts</label>
          <input
            type="text"
            id="search"
            placeholder="Search by title, company, or tags..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Category Filter */}
        <div className="filter-section">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            disabled={loading}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryIcon(category)} {category}
              </option>
            ))}
          </select>
        </div>

        {/* Company Filter */}
        <div className="filter-section">
          <label htmlFor="company">Company</label>
          <select
            id="company"
            value={filters.company}
            onChange={(e) => handleFilterChange('company', e.target.value)}
            disabled={loading}
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        {/* Source Filter */}
        <div className="filter-section">
          <label htmlFor="source">Source</label>
          <select
            id="source"
            value={filters.source}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            disabled={loading}
          >
            <option value="">All Sources</option>
            {sources.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="filter-section">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={loading}
          >
            <option value="Active">🟢 Active</option>
            <option value="Expired">🔴 Expired</option>
            <option value="Coming Soon">🟡 Coming Soon</option>
          </select>
        </div>

        {/* Featured Filter */}
        <div className="filter-section">
          <label htmlFor="featured">Featured Only</label>
          <select
            id="featured"
            value={filters.featured}
            onChange={(e) => handleFilterChange('featured', e.target.value)}
            disabled={loading}
          >
            <option value="">All Discounts</option>
            <option value="true">⭐ Featured Only</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      <div className="active-filters">
        {Object.entries(filters).map(([key, value]) => {
          if (value && value !== 'Active') {
            return (
              <span key={key} className="active-filter">
                {key}: {value}
                <button 
                  onClick={() => handleFilterChange(key, key === 'status' ? 'Active' : '')}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default DiscountFilter;
