import React from 'react';

const FilterSidebar = ({ filters, onFilterChange, onClearFilters }) => {
  const regions = ['North', 'South', 'East', 'West', 'Central', 'Northeast', 'Northwest', 'Southeast', 'Southwest'];
  const districts = [
    // Houston Area
    'Houston ISD', 'Katy ISD', 'Cypress-Fairbanks ISD', 'Spring ISD', 'Klein ISD', 'Aldine ISD',
    'Fort Bend ISD', 'Alief ISD', 'Pasadena ISD', 'Clear Creek ISD', 'Pearland ISD',
    // Dallas Area
    'Dallas ISD', 'Plano ISD', 'Richardson ISD', 'Garland ISD', 'Mesquite ISD', 'Irving ISD',
    'Frisco ISD', 'McKinney ISD', 'Allen ISD', 'Lewisville ISD',
    // Austin Area
    'Austin ISD', 'Round Rock ISD', 'Leander ISD', 'Pflugerville ISD', 'Lake Travis ISD',
    // San Antonio Area
    'San Antonio ISD', 'Northside ISD', 'North East ISD', 'Judson ISD', 'East Central ISD',
    // Other Major Districts
    'Fort Worth ISD', 'Arlington ISD', 'El Paso ISD', 'Corpus Christi ISD', 'Lubbock ISD',
    'Amarillo ISD', 'Laredo ISD', 'Brownsville ISD', 'McAllen ISD', 'Waco ISD',
    'Killeen ISD', 'Tyler ISD', 'Beaumont ISD', 'Bryan ISD', 'College Station ISD',
    // Statewide/National
    'Statewide', 'National', 'International'
  ];
  const gradeLevels = ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College', 'Adult Education'];
  const subjects = ['Mathematics', 'Science', 'English/Language Arts', 'Social Studies', 'History', 'Art', 'Music', 'Physical Education', 'Foreign Language', 'Computer Science', 'Special Education', 'ESL/ELL', 'Reading', 'Writing'];
  const fundingTypes = ['Classroom Supplies', 'Technology Equipment', 'Books and Materials', 'Professional Development', 'Field Trips', 'Special Programs', 'Student Support', 'Classroom Furniture', 'STEM Materials'];

  const handleCheckboxChange = (category, value) => {
    const currentValues = filters[category] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    onFilterChange(category, newValues);
  };

  const handleAmountChange = (field, value) => {
    const numValue = value === '' ? '' : parseFloat(value);
    onFilterChange(field, numValue);
  };

  return (
    <div className="filter-sidebar">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={onClearFilters}
          className="btn btn-outline btn-sm"
        >
          Clear All
        </button>
      </div>

      {/* Amount Range */}
      <div className="filter-group">
        <label className="filter-label">Amount Range</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <input
              type="number"
              placeholder="Min"
              value={filters.minAmount || ''}
              onChange={(e) => handleAmountChange('minAmount', e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxAmount || ''}
              onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Regions */}
      <div className="filter-group">
        <label className="filter-label">Regions</label>
        <div className="filter-options">
          {regions.map(region => (
            <div key={region} className="filter-option">
              <input
                type="checkbox"
                id={`region-${region}`}
                checked={filters.regions?.includes(region) || false}
                onChange={() => handleCheckboxChange('regions', region)}
              />
              <label htmlFor={`region-${region}`}>{region}</label>
            </div>
          ))}
        </div>
      </div>

      {/* School Districts */}
      <div className="filter-group">
        <label className="filter-label">School Districts</label>
        <div className="filter-options" style={{maxHeight: '200px', overflowY: 'auto'}}>
          {districts.map(district => (
            <div key={district} className="filter-option">
              <input
                type="checkbox"
                id={`district-${district}`}
                checked={filters.districts?.includes(district) || false}
                onChange={() => handleCheckboxChange('districts', district)}
              />
              <label htmlFor={`district-${district}`}>{district}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Levels */}
      <div className="filter-group">
        <label className="filter-label">Grade Levels</label>
        <div className="filter-options">
          {gradeLevels.map(grade => (
            <div key={grade} className="filter-option">
              <input
                type="checkbox"
                id={`grade-${grade}`}
                checked={filters.gradeLevels?.includes(grade) || false}
                onChange={() => handleCheckboxChange('gradeLevels', grade)}
              />
              <label htmlFor={`grade-${grade}`}>{grade}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Subjects */}
      <div className="filter-group">
        <label className="filter-label">Subjects</label>
        <div className="filter-options">
          {subjects.map(subject => (
            <div key={subject} className="filter-option">
              <input
                type="checkbox"
                id={`subject-${subject}`}
                checked={filters.subjects?.includes(subject) || false}
                onChange={() => handleCheckboxChange('subjects', subject)}
              />
              <label htmlFor={`subject-${subject}`}>{subject}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Funding Types */}
      <div className="filter-group">
        <label className="filter-label">Funding Types</label>
        <div className="filter-options">
          {fundingTypes.map(type => (
            <div key={type} className="filter-option">
              <input
                type="checkbox"
                id={`funding-${type}`}
                checked={filters.fundingTypes?.includes(type) || false}
                onChange={() => handleCheckboxChange('fundingTypes', type)}
              />
              <label htmlFor={`funding-${type}`}>{type}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
