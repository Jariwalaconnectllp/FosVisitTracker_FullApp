import React, { useState, useEffect } from 'react';
import { salesmenAPI } from '../services/api';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { PlusIcon, PencilIcon, PowerIcon } from '@heroicons/react/24/outline';

const ManageSalesmen = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingSalesman, setEditingSalesman] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
  });

  useEffect(() => {
    fetchSalesmen();
  }, []);

  const fetchSalesmen = async () => {
    try {
      const response = await salesmenAPI.getAll();
      setSalesmen(response.data);
    } catch (error) {
      console.error('Failed to fetch salesmen');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await salesmenAPI.create(formData);
      setShowAdd(false);
      setFormData({ name: '', email: '', phone: '', region: '' });
      fetchSalesmen();
      alert('Salesman added successfully. Password has been auto-generated.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add salesman');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await salesmenAPI.update(editingSalesman.id, formData);
      setEditingSalesman(null);
      setFormData({ name: '', email: '', phone: '', region: '' });
      fetchSalesmen();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update salesman');
    }
  };

  const handleToggleActive = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await salesmenAPI.toggleActive(id);
      fetchSalesmen();
    } catch (error) {
      alert('Failed to toggle status');
    }
  };

  const openEdit = (salesman) => {
    setEditingSalesman(salesman);
    setFormData({
      name: salesman.name,
      email: salesman.email,
      phone: salesman.phone || '',
      region: salesman.region || '',
    });
  };

  if (loading) return <Loader className="h-96" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Salesmen</h1>
          <p className="text-gray-500 text-sm mt-0.5">{salesmen.length} salesmen in your team</p>
        </div>
        <button
          onClick={() => {
            setShowAdd(true);
            setFormData({ name: '', email: '', phone: '', region: '' });
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          Add Salesman
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Visits</th>
                <th className="px-4 py-3">Dealers</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {salesmen.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.region || '-'}</td>
                  <td className="px-4 py-3">{s.totalVisits}</td>
                  <td className="px-4 py-3">{s.assignedDealers}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      s.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(s.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <PowerIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Salesman">
        <form onSubmit={handleAdd} className="space-y-4">
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
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Add Salesman
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingSalesman} onClose={() => setEditingSalesman(null)} title="Edit Salesman">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Update Salesman
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSalesmen;