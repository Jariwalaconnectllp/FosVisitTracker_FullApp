import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dealersAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { formatDate, formatTime } from '../utils/dateHelpers';
import { formatPurpose, formatCategory, getCategoryColor, getStatusColor } from '../utils/formatters';
import {
  BuildingStorefrontIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DealerDetail = () => {
  const { id } = useParams();
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');

  useEffect(() => {
    fetchDealer();
  }, [id]);

  const fetchDealer = async () => {
    try {
      const response = await dealersAPI.getById(id);
      setDealer(response.data);
    } catch (error) {
      console.error('Failed to fetch dealer');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader className="h-96" />;
  if (!dealer) return <div className="text-center py-12 text-gray-500">Dealer not found</div>;

  const filteredVisits = filterRole
    ? dealer.visits.filter((v) => v.visitorRole === filterRole)
    : dealer.visits;

  // Monthly visit counts for chart
  const monthlyData = {};
  filteredVisits.forEach((v) => {
    const key = `${v.month}/${v.year}`;
    monthlyData[key] = (monthlyData[key] || 0) + 1;
  });
  const chartData = Object.entries(monthlyData).map(([name, count]) => ({ name, count }));

  const lastVisit = dealer.visits[0];
  const daysSinceLastVisit = lastVisit
    ? Math.floor((new Date() - new Date(lastVisit.visitDate)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <div>
        <Link to="/dealers" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dealers
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
              <BuildingStorefrontIcon className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{dealer.name}</h1>
              <p className="text-gray-500">{dealer.shopName}</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getCategoryColor(dealer.category)}`}>
            {formatCategory(dealer.category)}
          </span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <PhoneIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Phone</span>
          </div>
          <p className="text-sm font-medium text-gray-900">{dealer.phone || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <MapPinIcon className="w-4 h-4" />
            <span className="text-xs font-medium">Address</span>
          </div>
          <p className="text-sm font-medium text-gray-900">{dealer.address || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <span className="text-xs font-medium">City</span>
          </div>
          <p className="text-sm font-medium text-gray-900">{dealer.city || 'N/A'}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <span className="text-xs font-medium">Last Visit</span>
          </div>
          <p className={`text-sm font-medium ${daysSinceLastVisit > 30 ? 'text-red-600' : 'text-green-600'}`}>
            {daysSinceLastVisit !== null ? `${daysSinceLastVisit} days ago` : 'Never'}
          </p>
        </div>
      </div>

      {/* Assigned Salesmen */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Assigned Salesmen</h2>
        <div className="flex flex-wrap gap-2">
          {dealer.assignments?.map((a) => (
            <span key={a.salesmanId} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              {a.salesman?.name}
            </span>
          )) || <span className="text-gray-500 text-sm">No salesmen assigned</span>}
        </div>
      </div>

      {/* Monthly Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Visit Frequency</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Visits Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Filter by:</span>
        {['All', 'SALESMAN', 'BM'].map((role) => (
          <button
            key={role}
            onClick={() => setFilterRole(role === 'All' ? '' : role)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              (role === 'All' && !filterRole) || filterRole === role
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {role === 'All' ? 'All' : role === 'BM' ? 'BM Only' : 'Salesmen Only'}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500">{filteredVisits.length} visits</span>
      </div>

      {/* Visits List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Visitor</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVisits.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{formatDate(v.visitDate)}</td>
                  <td className="px-4 py-3 font-medium">{v.visitor?.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      v.visitorRole === 'BM' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {v.visitorRole}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatPurpose(v.purpose)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(v.status)}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{v.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DealerDetail;