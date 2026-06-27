import React, { useState, useEffect } from 'react';
import { reportsAPI, dealersAPI, salesmenAPI } from '../services/api';
import Loader from '../components/common/Loader';
import SearchableDropdown from '../components/common/SearchableDropdown';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatDate, getMonthName } from '../utils/dateHelpers';
import { formatPurpose } from '../utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

const Reports = () => {
  const [activeTab, setActiveTab] = useState('dealer');
  const [dealers, setDealers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // Filter states
  const [selectedDealer, setSelectedDealer] = useState('');
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [dealersRes, salesmenRes] = await Promise.all([
        dealersAPI.getAll(),
        salesmenAPI.getAll(),
      ]);
      setDealers(dealersRes.data.dealers);
      setSalesmen(salesmenRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data');
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setReportData(null);
    try {
      let response;
      switch (activeTab) {
        case 'dealer':
          response = await reportsAPI.dealerVisits({ dealerId: selectedDealer, month, year });
          break;
        case 'performance':
          response = await reportsAPI.salesmanPerformance({ salesmanId: selectedSalesman, month, year });
          break;
        case 'monthly':
          response = await reportsAPI.monthlySummary({ month, year });
          break;
        case 'coverage':
          response = await reportsAPI.dealerCoverage({ month, year });
          break;
        case 'purpose':
          response = await reportsAPI.purposeAnalysis({ salesmanId: selectedSalesman, month, year });
          break;
        case 'bmVsSalesman':
          response = await reportsAPI.bmVsSalesman({ dealerId: selectedDealer, month, year });
          break;
        default:
          return;
      }
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dealer', label: 'Dealer Visits' },
    { id: 'performance', label: 'Salesman Performance' },
    { id: 'monthly', label: 'Monthly Summary' },
    { id: 'coverage', label: 'Dealer Coverage' },
    { id: 'purpose', label: 'Purpose Analysis' },
    { id: 'bmVsSalesman', label: 'BM vs Salesman' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">Generate and view detailed reports</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setReportData(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          {(activeTab === 'dealer' || activeTab === 'bmVsSalesman') && (
            <div className="w-64">
              <label className="block text-xs font-medium text-gray-500 mb-1">Dealer</label>
              <SearchableDropdown
                options={dealers}
                value={selectedDealer}
                onChange={setSelectedDealer}
                placeholder="Select dealer..."
              />
            </div>
          )}

          {(activeTab === 'performance' || activeTab === 'purpose') && (
            <div className="w-64">
              <label className="block text-xs font-medium text-gray-500 mb-1">Salesman</label>
              <SearchableDropdown
                options={salesmen}
                value={selectedSalesman}
                onChange={setSelectedSalesman}
                placeholder="Select salesman..."
              />
            </div>
          )}

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

          <button
            onClick={generateReport}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Results */}
      {loading && <Loader className="h-64" />}

      {reportData && !loading && (
        <div className="space-y-6">
          {/* Dealer Visit Report */}
          {activeTab === 'dealer' && reportData.summary && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium">Total Visits</p>
                  <p className="text-2xl font-bold text-blue-900">{reportData.summary.totalVisits}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-green-600 font-medium">Salesman Visits</p>
                  <p className="text-2xl font-bold text-green-900">{reportData.summary.salesmanVisits}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium">BM Visits</p>
                  <p className="text-2xl font-bold text-purple-900">{reportData.summary.bmVisits}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Visitor</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Purpose</th>
                        <th className="px-4 py-3">Remarks</th>
                        <th className="px-4 py-3">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.visits?.map((v) => (
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
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{v.remarks}</td>
                          <td className="px-4 py-3 text-gray-600">{v.outcome}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Salesman Performance */}
          {activeTab === 'performance' && reportData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={(v) => getMonthName(v)} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="target" fill="#3b82f6" name="Target" />
                  <Bar dataKey="achieved" fill="#10b981" name="Achieved" />
                </BarChart>
              </ResponsiveContainer>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Target</th>
                      <th className="px-4 py-3">Achieved</th>
                      <th className="px-4 py-3">%</th>
                      <th className="px-4 py-3">Unique Dealers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{getMonthName(r.month)} {r.year}</td>
                        <td className="px-4 py-3">{r.target}</td>
                        <td className="px-4 py-3">{r.achieved}</td>
                        <td className="px-4 py-3">{r.achievement}%</td>
                        <td className="px-4 py-3">{r.uniqueDealers}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Monthly Summary */}
          {activeTab === 'monthly' && reportData.summary && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Salesman</th>
                        <th className="px-4 py-3">Target</th>
                        <th className="px-4 py-3">Visits</th>
                        <th className="px-4 py-3">Achievement</th>
                        <th className="px-4 py-3">Dealers Covered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.summary.map((s, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{s.salesman.name}</td>
                          <td className="px-4 py-3">{s.target}</td>
                          <td className="px-4 py-3">{s.visits}</td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${
                              s.achievement >= 100 ? 'text-green-600' : s.achievement >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {s.achievement}%
                            </span>
                          </td>
                          <td className="px-4 py-3">{s.uniqueDealers}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daily heatmap */}
              {reportData.dailyVisits && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-900 mb-3">Daily Visit Heatmap</h3>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="text-center text-xs text-gray-500 font-medium">{d}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const dayData = reportData.dailyVisits.find((dv) => {
                        const date = new Date(dv.visitDate);
                        return date.getDay() === (i % 7) && Math.floor(i / 7) === Math.floor((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
                      });
                      const count = dayData?._count?.id || 0;
                      return (
                        <div
                          key={i}
                          className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                            count > 5 ? 'bg-green-600 text-white' :
                            count > 2 ? 'bg-green-400 text-white' :
                            count > 0 ? 'bg-green-200 text-green-800' :
                            'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {count > 0 ? count : ''}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Dealer Coverage */}
          {activeTab === 'coverage' && Array.isArray(reportData) && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Dealer</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Visits This Month</th>
                      <th className="px-4 py-3">Last Visit</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{d.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            d.category === 'PLATINUM' ? 'bg-purple-100 text-purple-700' :
                            d.category === 'GOLD' ? 'bg-yellow-100 text-yellow-700' :
                            d.category === 'SILVER' ? 'bg-gray-100 text-gray-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {d.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">{d.visitsThisMonth}</td>
                        <td className="px-4 py-3">{d.lastVisitDate ? formatDate(d.lastVisitDate) : 'Never'}</td>
                        <td className="px-4 py-3">
                          {d.neverVisited ? (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Never Visited</span>
                          ) : d.lowFrequency ? (
                            <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-full">Low Frequency</span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Good</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Purpose Analysis */}
          {activeTab === 'purpose' && reportData.analysis && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Purpose Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.analysis}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ purpose, percentage }) => `${formatPurpose(purpose)} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="purpose"
                    >
                      {reportData.analysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Purpose</th>
                        <th className="px-4 py-3">Count</th>
                        <th className="px-4 py-3">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.analysis.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{formatPurpose(a.purpose)}</td>
                          <td className="px-4 py-3">{a.count}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-blue-500"
                                  style={{ width: `${a.percentage}%` }}
                                />
                              </div>
                              <span>{a.percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* BM vs Salesman */}
          {activeTab === 'bmVsSalesman' && reportData.monthlyStats && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={Object.entries(reportData.monthlyStats).map(([key, value]) => ({
                    name: key,
                    Salesman: value.salesman,
                    BM: value.bm,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Salesman" fill="#3b82f6" />
                  <Bar dataKey="BM" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>

              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Month</th>
                      <th className="px-4 py-3">Salesman Visits</th>
                      <th className="px-4 py-3">BM Visits</th>
                      <th className="px-4 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(reportData.monthlyStats).map(([key, value]) => (
                      <tr key={key} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{key}</td>
                        <td className="px-4 py-3">{value.salesman}</td>
                        <td className="px-4 py-3">{value.bm}</td>
                        <td className="px-4 py-3 font-semibold">{value.salesman + value.bm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;