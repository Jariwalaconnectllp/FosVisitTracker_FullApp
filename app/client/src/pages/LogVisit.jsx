import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { visitsAPI, dealersAPI } from '../services/api';
import SearchableDropdown from '../components/common/SearchableDropdown';
import Loader from '../components/common/Loader';
import { getToday } from '../utils/dateHelpers';
import { MapPinIcon, CameraIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const LogVisit = () => {
  const navigate = useNavigate();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    dealerId: '',
    visitDate: getToday(),
    visitTime: new Date().toTimeString().slice(0, 5),
    purpose: 'FOLLOW_UP',
    remarks: '',
    outcome: '',
    nextAction: '',
    status: 'COMPLETED',
    checkInLat: '',
    checkInLng: '',
    photo: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const response = await dealersAPI.getAll({ assigned: 'true' });
      setDealers(response.data.dealers);
    } catch (error) {
      console.error('Failed to fetch dealers');
    } finally {
      setLoading(false);
    }
  };

  const captureGPS = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          checkInLat: position.coords.latitude.toFixed(6),
          checkInLng: position.coords.longitude.toFixed(6),
        }));
        setGpsLoading(false);
      },
      () => {
        alert('Unable to retrieve your location');
        setGpsLoading(false);
      }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.dealerId) newErrors.dealerId = 'Please select a dealer';
    if (!formData.visitDate) newErrors.visitDate = 'Visit date is required';
    if (!formData.remarks || formData.remarks.length < 20) {
      newErrors.remarks = 'Remarks must be at least 20 characters';
    }
    if (formData.status === 'COMPLETED' && new Date(formData.visitDate) > new Date()) {
      newErrors.visitDate = 'Cannot log future date as completed';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await visitsAPI.create(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-visits');
      }, 2000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to log visit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader className="h-96" />;

  if (success) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Visit Logged Successfully!</h2>
          <p className="text-gray-500 mt-2">Redirecting to your visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Log a Visit</h1>
        <p className="text-gray-500 text-sm mt-0.5">Record your dealer visit details</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Dealer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Select Dealer <span className="text-red-500">*</span>
          </label>
          <SearchableDropdown
            options={dealers}
            value={formData.dealerId}
            onChange={(value) => setFormData((prev) => ({ ...prev, dealerId: value }))}
            placeholder="Search dealers..."
            searchFields={['name', 'shopName', 'dealerCode']}
          />
          {errors.dealerId && <p className="text-red-500 text-xs mt-1">{errors.dealerId}</p>}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Visit Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.visitDate}
              max={formData.status === 'COMPLETED' ? getToday() : undefined}
              onChange={(e) => setFormData((prev) => ({ ...prev, visitDate: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.visitDate && <p className="text-red-500 text-xs mt-1">{errors.visitDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Visit Time</label>
            <input
              type="time"
              value={formData.visitTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, visitTime: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Purpose</label>
          <select
            value={formData.purpose}
            onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="NEW_BUSINESS">New Business</option>
            <option value="COMPLAINT">Complaint</option>
            <option value="DEMO">Demo</option>
            <option value="PAYMENT_COLLECTION">Payment Collection</option>
            <option value="RELATIONSHIP_VISIT">Relationship Visit</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Remarks <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.remarks}
            onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your visit (min 20 characters)"
          />
          {errors.remarks && <p className="text-red-500 text-xs mt-1">{errors.remarks}</p>}
          <p className="text-xs text-gray-400 mt-1">{formData.remarks.length} characters</p>
        </div>

        {/* Outcome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Outcome</label>
          <textarea
            value={formData.outcome}
            onChange={(e) => setFormData((prev) => ({ ...prev, outcome: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What was achieved during this visit?"
          />
        </div>

        {/* Next Action */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Next Action</label>
          <input
            type="text"
            value={formData.nextAction}
            onChange={(e) => setFormData((prev) => ({ ...prev, nextAction: e.target.value }))}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="What needs to be done next?"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
          <div className="flex gap-3">
            {['COMPLETED', 'PLANNED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status }))}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors ${
                  formData.status === status
                    ? status === 'COMPLETED'
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : status === 'PLANNED'
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* GPS Capture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">GPS Location</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={captureGPS}
              disabled={gpsLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              <MapPinIcon className="w-4 h-4" />
              {gpsLoading ? 'Capturing...' : 'Capture GPS'}
            </button>
            {formData.checkInLat && (
              <span className="text-xs text-gray-600">
                {formData.checkInLat}, {formData.checkInLng}
              </span>
            )}
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium cursor-pointer transition-colors">
              <CameraIcon className="w-4 h-4" />
              {formData.photo ? 'Change Photo' : 'Take Photo'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          </div>
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Preview"
              className="mt-3 w-full max-h-48 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Logging Visit...
              </span>
            ) : (
              'Log Visit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogVisit;