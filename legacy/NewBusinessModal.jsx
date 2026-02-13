// src/components/modals/NewBusinessModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useBusiness } from '../../context/BusinessContext';
import { useUser } from '../../context/UserContext';
import { states } from '../../constants/states';
import toast from 'react-hot-toast';
import UserSelectionModal from './UserSelectionModal';

const NewBusinessModal = ({ isOpen, onClose, onSuccess }) => {
  const { createBusiness } = useBusiness();
  const { fetchUser } = useUser();
  const [saving, setSaving] = useState(false);
  const [primaryUser, setPrimaryUser] = useState(null);
  const [affiliateUser, setAffiliateUser] = useState(null);
  const [showPrimaryUserModal, setShowPrimaryUserModal] = useState(false);
  const [showAffiliateUserModal, setShowAffiliateUserModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    business_type: '',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    zip: '',
    pricing_sms_base: 0.04,
    pricing_sms_segment: 0.007,
    pricing_mms_base: 0.08,
    affiliate_user_key: '',
    primary_user_key: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        business_type: '',
        primary_contact_name: '',
        primary_contact_email: '',
        primary_contact_phone: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        zip: '',
        pricing_sms_base: 0.04,
        pricing_sms_segment: 0.007,
        pricing_mms_base: 0.08,
        affiliate_user_key: '',
        primary_user_key: '',
      });
      setFormErrors({});
      setPrimaryUser(null);
      setAffiliateUser(null);
    }
  }, [isOpen]);

  // Fetch user data when formData changes
  useEffect(() => {
    const loadUsers = async () => {
      // Load primary user
      if (formData.primary_user_key) {
        try {
          const user = await fetchUser(formData.primary_user_key);
          setPrimaryUser(user);
        } catch (err) {
          console.error('Failed to load primary user:', err);
          setPrimaryUser(null);
        }
      } else {
        setPrimaryUser(null);
      }

      // Load affiliate user
      if (formData.affiliate_user_key) {
        try {
          const user = await fetchUser(formData.affiliate_user_key);
          setAffiliateUser(user);
        } catch (err) {
          console.error('Failed to load affiliate user:', err);
          setAffiliateUser(null);
        }
      } else {
        setAffiliateUser(null);
      }
    };

    if (isOpen) {
      loadUsers();
    }
  }, [formData.primary_user_key, formData.affiliate_user_key, fetchUser, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Business name is required.';
    }
    if (formData.primary_contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primary_contact_email)) {
      errors.primary_contact_email = 'Invalid email format.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        business_type: formData.business_type || undefined,
        primary_contact_name: formData.primary_contact_name.trim() || undefined,
        primary_contact_email: formData.primary_contact_email.trim() || undefined,
        primary_contact_phone: formData.primary_contact_phone.trim() || undefined,
        address_1: formData.address_1.trim() || undefined,
        address_2: formData.address_2.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state || undefined,
        zip: formData.zip.trim() || undefined,
        pricing_sms_base: formData.pricing_sms_base || undefined,
        pricing_sms_segment: formData.pricing_sms_segment || undefined,
        pricing_mms_base: formData.pricing_mms_base || undefined,
        affiliate_user_key: formData.affiliate_user_key.trim() || undefined,
        primary_user_key: formData.primary_user_key.trim() || undefined,
      };

      // Remove undefined fields
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

      console.log(`[NewBusinessModal] Creating business:`, { payload, timestamp: new Date().toISOString() });
      const newBusiness = await createBusiness(payload);
      console.log(`[NewBusinessModal] Created business:`, { businessKey: newBusiness.key, timestamp: new Date().toISOString() });
      
      toast.success('Business created successfully.');
      if (onSuccess) {
        onSuccess(newBusiness);
      }
      onClose();
    } catch (err) {
      console.error('[NewBusinessModal] Failed to create business:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create business.';
      setFormErrors({ global: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handlePrimaryUserSelect = (user) => {
    setFormData(prev => ({
      ...prev,
      primary_user_key: user.key,
    }));
  };

  const handleAffiliateUserSelect = (user) => {
    setFormData(prev => ({
      ...prev,
      affiliate_user_key: user.key,
    }));
  };

  const handleClearPrimaryUser = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      primary_user_key: '',
    }));
  };

  const handleClearAffiliateUser = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      affiliate_user_key: '',
    }));
  };

  if (!isOpen) return null;

  const businessTypeOptions = [
    { value: '', label: 'Select a type...' },
    { value: 'individual', label: 'Individual' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'polling', label: 'Polling' },
    { value: 'affiliate', label: 'Affiliate' },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 relative max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Business</h3>
          <button 
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {formErrors.global && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 rounded-md">
            {formErrors.global}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Business Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.name 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Acme Corporation"
                  required
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Type
                </label>
                <select
                  name="business_type"
                  value={formData.business_type}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {businessTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Primary Contact Information */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Primary Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="primary_contact_name"
                  value={formData.primary_contact_name}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  name="primary_contact_email"
                  value={formData.primary_contact_email}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.primary_contact_email 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="john.smith@example.com"
                />
                {formErrors.primary_contact_email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.primary_contact_email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="primary_contact_phone"
                  value={formData.primary_contact_phone}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Address details */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Address details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address Line 1
                </label>
                <input
                  type="text"
                  name="address_1"
                  value={formData.address_1}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="123 Main Street"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="address_2"
                  value={formData.address_2}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Suite 100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="New York"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a state...</option>
                  {states.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="10001"
                />
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pricing</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMS Base
                </label>
                <input
                  type="number"
                  name="pricing_sms_base"
                  value={formData.pricing_sms_base}
                  onChange={handleChange}
                  step="0.0001"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="0.0075"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMS Segment
                </label>
                <input
                  type="number"
                  name="pricing_sms_segment"
                  value={formData.pricing_sms_segment}
                  onChange={handleChange}
                  step="0.0001"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="0.0075"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  MMS Base
                </label>
                <input
                  type="number"
                  name="pricing_mms_base"
                  value={formData.pricing_mms_base}
                  onChange={handleChange}
                  step="0.0001"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="0.0150"
                />
              </div>
            </div>
          </div>

          {/* User Keys */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Keys</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary User
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowPrimaryUserModal(true)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-left"
                  >
                    {formData.primary_user_key ? (
                      primaryUser ? (
                        <div>
                          <div className="font-medium">{`${primaryUser.first_name || ''} ${primaryUser.last_name || ''}`.trim() || 'N/A'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{primaryUser.user_name || 'N/A'}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{formData.primary_user_key}</div>
                        </div>
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                      )
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">Click to select user</div>
                    )}
                  </button>
                  {formData.primary_user_key && (
                    <button
                      type="button"
                      onClick={handleClearPrimaryUser}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Affiliate User
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowAffiliateUserModal(true)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-left"
                  >
                    {formData.affiliate_user_key ? (
                      affiliateUser ? (
                        <div>
                          <div className="font-medium">{`${affiliateUser.first_name || ''} ${affiliateUser.last_name || ''}`.trim() || 'N/A'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{affiliateUser.user_name || 'N/A'}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 truncate">{formData.affiliate_user_key}</div>
                        </div>
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                      )
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">Click to select user</div>
                    )}
                  </button>
                  {formData.affiliate_user_key && (
                    <button
                      type="button"
                      onClick={handleClearAffiliateUser}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* User Selection Modals */}
          <UserSelectionModal
            isOpen={showPrimaryUserModal}
            onClose={() => setShowPrimaryUserModal(false)}
            onSelect={handlePrimaryUserSelect}
            currentUserKey={formData.primary_user_key}
            businessKey=""
          />
          <UserSelectionModal
            isOpen={showAffiliateUserModal}
            onClose={() => setShowAffiliateUserModal(false)}
            onSelect={handleAffiliateUserSelect}
            currentUserKey={formData.affiliate_user_key}
            businessKey=""
          />

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Business'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

NewBusinessModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default NewBusinessModal;

