import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dealersAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { formatCategory, getCategoryColor } from '../utils/formatters';
import { MagnifyingGlassIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const Dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', city: '' });
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const response = await dealersAPI.getAll({ assigned: 'true' });
      setDealers(response.data.dealers);
      const uniqueCities = [...new Set(response.data.dealers.map((d) => d.city).filter(Boolean))];
      setCities(uniqueCities);
    } catch (error) {
      console.error('Failed to fetch dealers');
    } finally {
      setLoading(false);
    }
  };

  const filteredDealers = dealers.filter((dealer) => {
    const matchesSearch =
      !search ||
      dealer.name.toLowerCase().includes(search.toLowerCase()) ||
      dealer.shopName?.toLowerCase().includes(search.toLowerCase()) ||
      dealer.dealerCode?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filters.category || dealer.category === filters.category;
    const matchesCity = !filters.city || dealer.city === filters.city;
    return matchesSearch && matchesCategory && matchesCity;
  });

  if (loading) return <Loader className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Dealers</h1>
        <p className="text-gray-500 text-sm mt-0.5">Dealers assigned to you</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dealers..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {['PLATINUM', 'GOLD', 'SILVER', 'GENERAL'].map((c) => (
            <option key={c} value={c}>{formatCategory(c)}</option>
          ))}
        </select>
        <select
          value={filters.city}
          onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Dealers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDealers.map((dealer) => (
          <Link
            key={dealer.id}
            to={`/dealers/${dealer.id}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BuildingStorefrontIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(dealer.category)}`}>
                {formatCategory(dealer.category)}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {dealer.name}
            </h3>
            <p className="text-sm text-gray-500">{dealer.shopName}</p>
            <div className="mt-3 space-y-1 text-xs text-gray-500">
              {dealer.phone && <p>Phone: {dealer.phone}</p>}
              {dealer.city && <p>City: {dealer.city}</p>}
              {dealer.dealerCode && <p>Code: {dealer.dealerCode}</p>}
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="text-gray-500">
                {dealer._count?.visits || 0} total visits
              </span>
              {dealer.daysSinceLastVisit !== null && (
                <span className={`px-2 py-0.5 rounded-full ${
                  dealer.alert ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {dealer.alert ? `${dealer.daysSinceLastVisit}d ago` : 'Recent'}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredDealers.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No dealers found</p>
        </div>
      )}
    </div>
  );
};

export default Dealers;