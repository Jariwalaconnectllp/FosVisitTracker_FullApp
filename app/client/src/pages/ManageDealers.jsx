import React, { useState, useEffect } from 'react';
import { dealersAPI, salesmenAPI } from '../services/api';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import { formatCategory, getCategoryColor } from '../utils/formatters';
import { PlusIcon, PencilIcon, PowerIcon, LinkIcon, LinkSlashIcon } from '@heroicons/react/24/outline';

const ManageDealers = () => {
  const [dealers, setDealers] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [assigningDealer, setAssigningDealer] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '', shopName: '', phone: '', address: '', city: '', region: '', dealerCode: '', category: 'GENERAL',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dealersRes, salesmenRes] = await Promise.all([
        dealersAPI.getAll(),
        salesmenAPI.getAll(),
      ]);
      setDealers(dealersRes.data.dealers);
      setSalesmen(salesmenRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await dealersAPI.create(formData);
      setShowAdd(false);
      setFormData({ name: '', shopName: '', phone: '', address: '', city: '', region: '', dealerCode: '', category: 'GENERAL' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add dealer');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dealersAPI.update(editingDealer.id, formData);
      setEditingDealer(null);
      fetchData();
    } catch (error) {
      alert('Failed to update dealer');
    }
  };

  const handleToggleActive = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await dealersAPI.toggleActive(id);
      fetchData();
    } catch (error) {
      alert('Failed to toggle status');
    }
  };

  const handleAssign = async (salesmanId) => {
    try {
      await dealersAPI.assign({ dealerId: assigningDealer.id, salesmanId });
      setAssigningDealer(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign');
    }
  };

  const handleUnassign = async (dealerId, salesmanId) => {
    try {
      await dealersAPI.unassign({ dealerId, salesmanId });
      fetchData();
    } catch (error) {
      alert('Failed to unassign');
    }
  };

  const openEdit = (dealer) => {
    setEditingDealer(dealer);
    setFormData({
      name: dealer.name,
      shopName: dealer.shopName || '',
      phone: dealer.phone || '',
      address: dealer.address || '',
      city: dealer.city || '',
      region: dealer.region || '',
      dealerCode: dealer.dealerCode || '',
      category: dealer.category,
    });
  };

  const filteredDealers = dealers.filter((d) =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.shopName?.toLowerCase().includes(search.toLowerCase()) ||
    d.dealerCode?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader className="h-96" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Dealers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{dealers.length} dealers</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          Add Dealer
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search dealers..."
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Dealer</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDealers.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{d.name}</p>
                      <p className="text-xs text-gray-500">{d.shopName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.dealerCode || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(d.category)}`}>
                      {formatCategory(d.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{d.city || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {d.assignments?.map((a) => (
                        <span key={a.salesmanId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {a.salesman?.name}
                          <button onClick={() => handleUnassign(d.id, a.salesmanId)} className="hover:text-red-600">
                            <LinkSlashIcon className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <button
                        onClick={() => setAssigningDealer(d)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <LinkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      d.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {d.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(d)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleToggleActive(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
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
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Dealer">
        <form onSubmit={handleAdd} className="space-y-3">
          {['name', 'shopName', 'phone', 'address', 'city', 'region', 'dealerCode'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type="text"
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required={field === 'name'}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {['PLATINUM', 'GOLD', 'SILVER', 'GENERAL'].map((c) => (
                <option key={c} value={c}>{formatCategory(c)}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Add Dealer
          </button>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingDealer} onClose={() => setEditingDealer(null)} title="Edit Dealer">
        <form onSubmit={handleUpdate} className="space-y-3">
          {['name', 'shopName', 'phone', 'address', 'city', 'region'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type="text"
                value={formData[field]}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          ))}
          <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Update Dealer
          </button>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={!!assigningDealer} onClose={() => setAssigningDealer(null)} title="Assign Salesman">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {salesmen.map((s) => (
            <button
              key={s.id}
              onClick={() => handleAssign(s.id)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 border border-gray-100"
            >
              <p className="font-medium text-sm text-gray-900">{s.name}</p>
              <p className="text-xs text-gray-500">{s.email}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ManageDealers;