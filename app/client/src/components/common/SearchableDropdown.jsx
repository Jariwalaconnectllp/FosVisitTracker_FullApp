import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  labelKey = 'name',
  valueKey = 'id',
  searchFields = ['name'],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    searchFields.some((field) =>
      String(option[field]).toLowerCase().includes(search.toLowerCase())
    )
  );

  const selectedOption = options.find((o) => o[valueKey] === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption[labelKey] : placeholder}
        </span>
        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
          {filteredOptions.length === 0 ? (
            <p className="p-3 text-sm text-gray-500 text-center">No results found</p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option[valueKey]}
                type="button"
                onClick={() => {
                  onChange(option[valueKey]);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 ${
                  value === option[valueKey] ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                }`}
              >
                {option[labelKey]}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;