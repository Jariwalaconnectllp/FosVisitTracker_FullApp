import React, { useState, useEffect } from 'react';
import { salesmenAPI, dealersAPI, visitsAPI } from '../services/api';
import Loader from '../components/common/Loader';
import StatCard from '../components/Dashboard/StatCard';
import Modal from '../components/common/Modal';
import { UsersIcon, BuildingStorefrontIcon, ClipboardDocumentCheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminPanel = () => {
  const [stats, setStats] = useState({ totalBMs: 0, totalSalesmen: 0, totalDealers: 0, totalVisits: 0 });
  const [bms, setBms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddBM, setShowAddBM] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', region: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get all salesmen to find BMs
      const salesmenRes = await salesmenAPI.getAll();
      // Filter unique BMs from salesmen data
      const allUsers = salesmenRes.data;
      const bmList = allUsers.filter((u) => u.role === 'BM');
      const salesmanList = allUsers.filter((u) => u.role === 'SALESMAN');

      const dealersRes = await dealersAPI.getAll();

      setStats({
        totalBMs: bmList.length,
        totalSalesmen: salesmanList.length,
        totalDealers: dealersRes.data.dealers.length,
      });
      setBms(bmList);
    } catch (error) {
      console.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBM = async (e) => {
    e.preventDefault();
    try {
      await salesmenAPI.create({ ...formData, role: 'BM' });
      setShowAddBM(false);
      setFormData({ name: '', email: '', phone: '', region: '' });
      fetchData();
      alert('BM added successfully');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add BM');
    }
  };

  if (loading) return <Loader className="h-96" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-0.5">System administration and overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Branch Managers" value={stats.totalBMs} icon={ShieldCheckIcon} color="blue" />
        <StatCard title="Salesmen" value={stats.totalSalesmen} icon={UsersIcon} color="green" />
        <StatCard title="Dealers" value={stats.totalDealers} icon={BuildingStorefrontIcon} color="purple" />
        <StatCard title="Total Users" value={stats.totalBMs + stats.totalSalesmen + 1} icon={UsersIcon} color="amber" />
      </div>

      {/* BM Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Branch Managers</h2>
          <button
            onClick={() => setShowAddBM(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Add BM
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bms.map((bm) => (
                <tr key={bm.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{bm.name}</td>
                  <td className="px-4 py-3 text-gray-600">{bm.email}</td>
                  <td className="px-4 py-3 text-gray-600">{bm.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{bm.region || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      bm.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {bm.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add BM Modal */}
      <Modal isOpen={showAddBM} onClose={() => setShowAddBM(false)} title="Add Branch Manager">
        <form onSubmit={handleAddBM} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Add Branch Manager
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPanel;