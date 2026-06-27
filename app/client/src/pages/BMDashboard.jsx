import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { visitsAPI } from '../services/api';
import StatCard from '../components/Dashboard/StatCard';
import Loader from '../components/common/Loader';
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  FlagIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
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
import { getAchievementColor, getAchievementBg } from '../utils/dateHelpers';

const BMDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await visitsAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader className="h-96" />;
  if (!stats) return <div className="text-center py-12 text-gray-500">Failed to load dashboard</div>;

  const topPerformers = [...stats.salesmanStats]
    .sort((a, b) => b.achievement - a.achievement)
    .slice(0, 5);

  const bottomPerformers = [...stats.salesmanStats]
    .filter((s) => s.achievement < 50)
    .sort((a, b) => a.achievement - b.achievement);

  const chartData = stats.salesmanStats.map((s) => ({
    name: s.name.split(' ')[0],
    target: s.target,
    visits: s.visits,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">BM Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Team overview and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Team Size"
          value={stats.totalSalesmen}
          subtitle="active salesmen"
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Team Visits"
          value={stats.totalVisits}
          subtitle="this month"
          icon={ClipboardDocumentCheckIcon}
          color="green"
        />
        <StatCard
          title="Team Target"
          value={stats.totalTarget}
          subtitle="visits required"
          icon={FlagIcon}
          color="purple"
        />
        <StatCard
          title="Achievement"
          value={`${stats.achievement}%`}
          subtitle="of target achieved"
          icon={ChartBarIcon}
          color={stats.achievement >= 100 ? 'green' : stats.achievement >= 50 ? 'amber' : 'red'}
        />
      </div>

      {/* Team Performance Table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Salesman Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Salesman</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Visits</th>
                <th className="px-4 py-3">Achievement</th>
                <th className="px-4 py-3">Last Visit</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.salesmanStats.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3">{s.target}</td>
                  <td className="px-4 py-3">{s.visits}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getAchievementBg(s.achievement)}`}
                          style={{ width: `${Math.min(s.achievement, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${getAchievementColor(s.achievement)}`}>
                        {s.achievement}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.lastVisitDate ? new Date(s.lastVisitDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      s.achievement >= 100
                        ? 'bg-green-100 text-green-800'
                        : s.achievement >= 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {s.achievement >= 100 ? 'On Target' : s.achievement >= 50 ? 'On Track' : 'Behind'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Target vs Visits by Salesman</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="target" fill="#3b82f6" />
              <Bar dataKey="visits" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alerts</h2>
          <div className="space-y-3">
            {bottomPerformers.length > 0 ? (
              bottomPerformers.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      Only {s.achievement}% achievement ({s.visits}/{s.target} visits)
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
                <p className="text-sm text-green-700">All team members are on track!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dealer Coverage */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Dealer Coverage</h2>
          <Link to="/manage-dealers" className="text-sm text-blue-600 hover:underline">
            Manage Dealers
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Dealer</th>
                <th className="px-4 py-3">This Month</th>
                <th className="px-4 py-3">Last Visit</th>
                <th className="px-4 py-3">Assigned Salesman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.dealerCoverage?.slice(0, 10).map((dealer) => (
                <tr key={dealer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{dealer.name}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${dealer.visitsThisMonth === 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {dealer.visitsThisMonth} visits
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {dealer.lastVisitDate ? new Date(dealer.lastVisitDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {dealer.assignments?.map((a) => a.salesman?.name).join(', ') || 'Unassigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BMDashboard;