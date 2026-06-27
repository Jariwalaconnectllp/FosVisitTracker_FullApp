import React, { useState, useEffect } from 'react';
import { targetsAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { formatDate, getAchievementColor, getAchievementBg, getMonthName, getLast6Months } from '../utils/dateHelpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Targets = () => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const response = await targetsAPI.getMy();
      setTargets(response.data);
    } catch (error) {
      console.error('Failed to fetch targets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader className="h-96" />;

  const chartData = [...targets].reverse().map((t) => ({
    name: `${getMonthName(t.targetMonth)} ${t.targetYear}`,
    Target: t.targetCount,
    Achieved: t.visitsDone,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Targets</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track your performance against targets</p>
      </div>

      {/* Target Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Visits Done</th>
                <th className="px-4 py-3">Achievement</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {targets.map((target) => {
                const colorClass = getAchievementColor(target.achievement);
                const bgClass = getAchievementBg(target.achievement);
                return (
                  <tr key={target.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {getMonthName(target.targetMonth)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{target.targetYear}</td>
                    <td className="px-4 py-3 font-medium">{target.targetCount}</td>
                    <td className="px-4 py-3 text-gray-600">{target.visitsDone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${bgClass}`}
                            style={{ width: `${Math.min(target.achievement, 100)}%` }}
                          />
                        </div>
                        <span className={`font-semibold ${colorClass}`}>{target.achievement}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          target.achievement >= 100
                            ? 'bg-green-100 text-green-800'
                            : target.achievement >= 50
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {target.achievement >= 100 ? 'Achieved' : target.achievement >= 50 ? 'On Track' : 'Behind'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Target vs Achievement Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Target" fill="#3b82f6" />
              <Bar dataKey="Achieved" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Targets;