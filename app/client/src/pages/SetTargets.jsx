import React, { useState, useEffect } from 'react';
import { targetsAPI, salesmenAPI } from '../services/api';
import Loader from '../components/common/Loader';
import { getCurrentMonth, getCurrentYear, getMonthName, getAchievementColor, getAchievementBg } from '../utils/dateHelpers';

const SetTargets = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [bulkValue, setBulkValue] = useState('');

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesmenRes, targetsRes] = await Promise.all([
        salesmenAPI.getAll(),
        targetsAPI.getTeam({ month, year }),
      ]);
      setSalesmen(salesmenRes.data);
      setTargets(targetsRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (salesmanId, value) => {
    setTargets((prev) =>
      prev.map((t) => (t.salesman.id === salesmanId ? { ...t, target: parseInt(value) || 0 } : t))
    );
  };

  const saveTarget = async (salesmanId, targetCount) => {
    setSaving(true);
    try {
      await targetsAPI.set({ salesmanId, targetMonth: month, targetYear: year, targetCount });
      alert('Target saved successfully');
    } catch (error) {
      alert('Failed to save target');
    } finally {
      setSaving(false);
    }
  };

  const saveBulkTargets = async () => {
    if (!bulkValue || parseInt(bulkValue) <= 0) {
      alert('Please enter a valid target value');
      return;
    }
    setSaving(true);
    try {
      await targetsAPI.setBulk({
        targetMonth: month,
        targetYear: year,
        targetCount: parseInt(bulkValue),
      });
      alert('Bulk targets saved successfully');
      fetchData();
    } catch (error) {
      alert('Failed to save bulk targets');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Set Targets</h1>
        <p className="text-gray-500 text-sm mt-0.5">Assign monthly visit targets to your team</p>
      </div>

      {/* Month/Year Selector & Bulk */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              placeholder="Bulk target"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={saveBulkTargets}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Set All
            </button>
          </div>
        </div>
      </div>

      {/* Targets Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Salesman</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Visits Done</th>
                <th className="px-4 py-3">Achievement</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {targets.map((t) => (
                <tr key={t.salesman.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{t.salesman.name}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={t.target}
                      onChange={(e) => handleTargetChange(t.salesman.id, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="0"
                    />
                  </td>
                  <td className="px-4 py-3">{t.visits}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getAchievementBg(t.achievement)}`}
                          style={{ width: `${Math.min(t.achievement, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${getAchievementColor(t.achievement)}`}>
                        {t.achievement}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => saveTarget(t.salesman.id, t.target)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      Save
                    </button>
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

export default SetTargets;