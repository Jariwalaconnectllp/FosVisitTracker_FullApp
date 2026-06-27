import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { visitsAPI } from '../services/api';
import StatCard from '../components/Dashboard/StatCard';
import VisitProgressBar from '../components/Dashboard/VisitProgressBar';
import RecentVisitsTable from '../components/Dashboard/RecentVisitsTable';
import Loader from '../components/common/Loader';
import {
  FlagIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  FireIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { formatDate, getAchievementColor } from '../utils/dateHelpers';
import { formatPurpose } from '../utils/formatters';

const Dashboard = () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const achievementColor = getAchievementColor(stats.achievement);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Your performance overview</p>
        </div>
        <Link
          to="/log-visit"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Log Visit
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Target"
          value={stats.target}
          subtitle="visits this month"
          icon={FlagIcon}
          color="blue"
        />
        <StatCard
          title="Visits Done"
          value={stats.visitsThisMonth}
          subtitle={`${stats.achievement}% achieved`}
          icon={ClipboardDocumentCheckIcon}
          color={stats.achievement >= 100 ? 'green' : stats.achievement >= 50 ? 'amber' : 'red'}
        />
        <StatCard
          title="This Week"
          value={stats.visitsThisWeek}
          subtitle="visits"
          icon={CalendarIcon}
          color="purple"
        />
        <StatCard
          title="Streak"
          value={`${stats.streak} days`}
          subtitle="current streak"
          icon={FireIcon}
          color="amber"
        />
      </div>

      {/* Achievement Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Target Achievement</h2>
        <VisitProgressBar
          current={stats.visitsThisMonth}
          target={stats.target}
          label="Monthly Progress"
        />
        <div className="mt-3 flex items-center gap-2">
          <span className={`text-2xl font-bold ${achievementColor}`}>{stats.achievement}%</span>
          <span className="text-sm text-gray-500">of monthly target achieved</span>
        </div>
      </div>

      {/* Top Dealers & Recent Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Dealers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Dealers This Month</h2>
          {stats.topDealers?.length > 0 ? (
            <div className="space-y-3">
              {stats.topDealers.map((dealer, index) => (
                <div
                  key={dealer.dealerId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {dealer.dealer?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">{dealer.dealer?.shopName}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {dealer._count?.id || 0} visits
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No visits this month</p>
          )}
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Visits</h2>
            <Link to="/my-visits" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <RecentVisitsTable visits={stats.recentVisits?.slice(0, 5)} />
        </div>
      </div>

      {/* Planned Visits */}
      {stats.plannedVisits?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Planned Visits</h2>
          <div className="space-y-3">
            {stats.plannedVisits.map((visit) => (
              <div key={visit.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div>
                  <p className="font-medium text-sm text-gray-900">{visit.dealer?.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(visit.visitDate)} - {formatPurpose(visit.purpose)}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  Planned
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;