import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { visitsAPI, dealersAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { formatDate, formatTime } from '../utils/dateHelpers';
import { formatPurpose, getStatusColor, truncateText } from '../utils/formatters';
import { FunnelIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const MyVisits = () => {
  const [visits, setVisits] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    dealerId: '',
    purpose: '',
    status: '',
    fromDate: '',
    toDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchDealers();
    fetchVisits();
  }, []);

  const fetchDealers = async () => {
    try {
      const response = await dealersAPI.getAll();
      setDealers(response.data.dealers);
    } catch (error) {
      console.error('Failed to fetch dealers');
    }
  };

  const fetchVisits = async (page = 1, customFilters = filters) => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...customFilters };
      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === '' || params[key] === undefined) delete params[key];
      });

      const response = await visitsAPI.getAll(params);
      setVisits(response.data.visits);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch visits');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchVisits(1, newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      month: '',
      year: '',
      dealerId: '',
      purpose: '',
      status: '',
      fromDate: '',
      toDate: '',
    };
    setFilters(emptyFilters);
    fetchVisits(1, emptyFilters);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this visit?')) return;
    try {
      await visitsAPI.delete(id);
      fetchVisits(pagination.page);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete visit');
    }
  };

  const canEdit = (visit) => {
    const hoursSince = (new Date() - new Date(visit.createdAt)) / (1000 * 60 * 60);
    return hoursSince <= 24;
  };

  if (loading && visits.length === 0) {
    return <Loader className="h-96" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Visits</h1>
          <p className="text-gray-500 text-sm mt-0.5">{pagination.total} total visits</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              showFilters ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>
          <Link
            to="/log-visit"
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Visit
          </Link>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
              <select
                value={filters.month}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
              <select
                value={filters.year}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Years</option>
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Dealer</label>
              <select
                value={filters.dealerId}
                onChange={(e) => handleFilterChange('dealerId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Dealers</option>
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Purpose</label>
              <select
                value={filters.purpose}
                onChange={(e) => handleFilterChange('purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Purposes</option>
                {['FOLLOW_UP', 'NEW_BUSINESS', 'COMPLAINT', 'DEMO', 'PAYMENT_COLLECTION', 'RELATIONSHIP_VISIT', 'OTHER'].map((p) => (
                  <option key={p} value={p}>{formatPurpose(p)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PLANNED">Planned</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Visits List */}
      <div className="space-y-4">
        {visits.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No visits found</p>
            <Link
              to="/log-visit"
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Log your first visit
            </Link>
          </div>
        ) : (
          visits.map((visit) => (
            <div
              key={visit.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{visit.dealer?.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(visit.status)}`}>
                      {visit.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(visit.visitDate)} {visit.visitTime && `at ${formatTime(visit.visitTime)}`}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                      {formatPurpose(visit.purpose)}
                    </span>
                    {visit.checkInLat && (
                      <span className="text-green-600 text-xs flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        GPS
                      </span>
                    )}
                    {visit.photoUrl && (
                      <span className="text-purple-600 text-xs">Photo attached</span>
                    )}
                  </div>
                  {visit.remarks && (
                    <p className="text-sm text-gray-600 mt-2">{truncateText(visit.remarks, 120)}</p>
                  )}
                  {visit.outcome && (
                    <p className="text-sm text-green-600 mt-1">Outcome: {truncateText(visit.outcome, 100)}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Link
                    to={`/dealers/${visit.dealerId}`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="View dealer"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  {canEdit(visit) && (
                    <>
                      <button
                        onClick={() => alert('Edit feature coming soon')}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                        title="Edit visit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(visit.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete visit"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => fetchVisits(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchVisits(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyVisits;