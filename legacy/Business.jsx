import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { useUser } from '../../context/UserContext';
import { useBrand } from '../../context/BrandContext';
import { AuthContext } from '../../context/AuthContext';
import { format } from 'date-fns';
import { getFriendlyState, states } from '../../constants/states';
import { getStatusBadgeClasses } from '../../utils/statusBadge';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, ArrowPathIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import UserSelectionModal from '../../components/modals/UserSelectionModal';
import NewBrandModal from '../../components/modals/NewBrandModal';
import EditBrandModal from '../../components/modals/EditBrandModal';
import { Tooltip } from 'react-tooltip';
import { accountAxiosInstance } from '../../utils/axiosInstance';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';

export default function Business() {
  const { key } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentBusiness, fetchBusiness, updateBusiness, loading: contextLoading, error: contextError } = useBusiness();
  const { fetchUser } = useUser();
  const { brands, brandsLoading, fetchBrands } = useBrand();
  const { isGlobalAdmin } = useContext(AuthContext);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [primaryUser, setPrimaryUser] = useState(null);
  const [affiliateUser, setAffiliateUser] = useState(null);
  const [showPrimaryUserModal, setShowPrimaryUserModal] = useState(false);
  const [showAffiliateUserModal, setShowAffiliateUserModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    business_type: '',
    status: 'active',
    primary_contact_name: '',
    primary_contact_email: '',
    primary_contact_phone: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    zip: '',
    pricing_sms_base: 0,
    pricing_sms_segment: 0,
    pricing_mms_base: 0,
    prepay: false,
    affiliate_user_key: '',
    primary_user_key: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [acceptingRequest, setAcceptingRequest] = useState(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRole, setSelectedRole] = useState('sec:businessuser');
  const [brandsPagination, setBrandsPagination] = useState({ pageIndex: 0, pageSize: 25 });
  const [showNewBrandModal, setShowNewBrandModal] = useState(false);
  const [showEditBrandModal, setShowEditBrandModal] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState(null);

  const business = currentBusiness;

  const brandList = useMemo(
    () => brands?.map((b, i) => ({ ...b, id: b.key ?? b.id ?? `brand-${i}` })) ?? [],
    [brands]
  );
  const brandColumns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span className="text-gray-900 dark:text-white font-medium">{getValue() || '—'}</span>
        ),
      },
      {
        accessorKey: 'bandwidth_campaign_id',
        header: 'Bandwidth campaign ID',
        cell: ({ row }) => {
          const val = row.original.bandwidth_campaign_id ?? row.original.BandwidthCampaignId;
          return <span className="text-gray-700 dark:text-gray-300">{val || '—'}</span>;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(status)}`}>
              {status || '—'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const brand = row.original;
          return (
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBrandToEdit(brand);
                  setShowEditBrandModal(true);
                }}
                data-tooltip-id="edit-brand-tooltip"
                data-tooltip-content="Edit"
                className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
          );
        },
        enableSorting: false,
        size: 100,
      },
    ],
    []
  );
  const brandsTable = useReactTable({
    data: brandList,
    columns: brandColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setBrandsPagination,
    state: { pagination: brandsPagination },
  });

  const loadBusiness = useCallback(async () => {
    if (!key) {
      setError('Missing business key.');
      setLocalLoading(false);
      return;
    }
    try {
      setLocalLoading(true);
      console.log('Loading business:', key);
      await fetchBusiness(key);
      setError(null);
    } catch (err) {
      console.error('Failed to load business:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load business.');
    } finally {
      setLocalLoading(false);
    }
  }, [key, fetchBusiness]);

  useEffect(() => {
    document.title = "Alliance Forge | Business";
    loadBusiness();
  }, [loadBusiness]);

  // Initialize form data when business loads or when entering edit mode
  useEffect(() => {
    if (business && !isEditing) {
      setFormData({
        name: business.name || '',
        business_type: business.business_type || '',
        status: business.status || 'active',
        primary_contact_name: business.primary_contact_name || '',
        primary_contact_email: business.primary_contact_email || '',
        primary_contact_phone: business.primary_contact_phone || '',
        address_1: business.address_1 || '',
        address_2: business.address_2 || '',
        city: business.city || '',
        state: business.state || '',
        zip: business.zip || '',
        pricing_sms_base: business.pricing_sms_base || 0,
        pricing_sms_segment: business.pricing_sms_segment || 0,
        pricing_mms_base: business.pricing_mms_base || 0,
        prepay: business.prepay || false,
        affiliate_user_key: business.affiliate_user_key || '',
        primary_user_key: business.primary_user_key || '',
      });
    }
  }, [business, isEditing]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Fetch user data when business loads or when formData changes in edit mode
  useEffect(() => {
    const loadUsers = async () => {
      if (!business && !isEditing) return;
      
      const primaryKey = isEditing ? formData.primary_user_key : business?.primary_user_key;
      const affiliateKey = isEditing ? formData.affiliate_user_key : business?.affiliate_user_key;
      
      // Load primary user
      if (primaryKey) {
        try {
          const user = await fetchUser(primaryKey);
          setPrimaryUser(user);
        } catch (err) {
          console.error('Failed to load primary user:', err);
          setPrimaryUser(null);
        }
      } else {
        setPrimaryUser(null);
      }

      // Load affiliate user
      if (affiliateKey) {
        try {
          const user = await fetchUser(affiliateKey);
          setAffiliateUser(user);
        } catch (err) {
          console.error('Failed to load affiliate user:', err);
          setAffiliateUser(null);
        }
      } else {
        setAffiliateUser(null);
      }
    };

    loadUsers();
  }, [business, isEditing, formData.primary_user_key, formData.affiliate_user_key, fetchUser]);

  const handleEdit = () => {
    setIsEditing(true);
    setFormErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormErrors({});
    // Reset form data to current business data
    if (business) {
      setFormData({
        name: business.name || '',
        business_type: business.business_type || '',
        status: business.status || 'active',
        primary_contact_name: business.primary_contact_name || '',
        primary_contact_email: business.primary_contact_email || '',
        primary_contact_phone: business.primary_contact_phone || '',
        address_1: business.address_1 || '',
        address_2: business.address_2 || '',
        city: business.city || '',
        state: business.state || '',
        zip: business.zip || '',
        pricing_sms_base: business.pricing_sms_base || 0,
        pricing_sms_segment: business.pricing_sms_segment || 0,
        pricing_mms_base: business.pricing_mms_base || 0,
        prepay: business.prepay || false,
        affiliate_user_key: business.affiliate_user_key || '',
        primary_user_key: business.primary_user_key || '',
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value,
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

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        business_type: formData.business_type,
        primary_contact_name: formData.primary_contact_name,
        primary_contact_email: formData.primary_contact_email,
        primary_contact_phone: formData.primary_contact_phone,
        address_1: formData.address_1,
        address_2: formData.address_2,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        affiliate_user_key: formData.affiliate_user_key || null,
        primary_user_key: formData.primary_user_key || null,
      };
      
      // Only include restricted fields if user is a global admin
      if (isGlobalAdmin) {
        payload.status = formData.status;
        payload.pricing_sms_base = formData.pricing_sms_base;
        payload.pricing_sms_segment = formData.pricing_sms_segment;
        payload.pricing_mms_base = formData.pricing_mms_base;
        payload.prepay = formData.prepay;
      }
      
      console.log('Updating business:', { key, payload });
      await updateBusiness(key, payload);
      toast.success('Business updated successfully.');
      setIsEditing(false);
      await loadBusiness();
    } catch (err) {
      console.error('Save failed:', err);
      const errorMessage = err.response?.status === 409 
        ? 'Version conflict. Please refresh and try again.' 
        : err.response?.data?.message || 'Failed to save business.';
      setFormErrors({ global: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyKey = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!business?.key) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(business.key);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = business.key;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setTimeout(() => {
        toast.success('Business key copied to clipboard');
      }, 0);
    } catch (err) {
      console.error('Failed to copy business key:', err);
      toast.error('Failed to copy business key');
    }
  };

  const handleCopyUserKey = async (e, userKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userKey) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(userKey);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = userKey;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setTimeout(() => {
        toast.success('User key copied to clipboard');
      }, 0);
    } catch (err) {
      console.error('Failed to copy user key:', err);
      toast.error('Failed to copy user key');
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

  const handleAcceptClick = (request) => {
    setSelectedRequest(request);
    setSelectedRole('sec:businessuser');
    setShowAcceptModal(true);
  };

  const handleAcceptAccessRequest = async () => {
    if (!business?.key || !selectedRequest?.key || !selectedRole) return;
    
    setAcceptingRequest(selectedRequest.key);
    try {
      await accountAxiosInstance.post('/api/v2/register/access/accept', {
        business_key: business.key,
        user_key: selectedRequest.key,
        role: selectedRole,
      });
      toast.success('Access request accepted successfully.');
      // Close modal and reload business to get updated access_requests
      setShowAcceptModal(false);
      setSelectedRequest(null);
      setSelectedRole('sec:businessuser');
      await loadBusiness();
    } catch (err) {
      console.error('Failed to accept access request:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Failed to accept access request.';
      toast.error(errorMessage);
    } finally {
      setAcceptingRequest(null);
    }
  };

  const handleCancelAccept = () => {
    setShowAcceptModal(false);
    setSelectedRequest(null);
    setSelectedRole('sec:businessuser');
  };

  if (localLoading || contextLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-gray-600 dark:text-gray-400">Loading business ...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (contextError || error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
            {contextError || error || 'Business not found.'}
          </div>
        </div>
      </div>
    );
  }

  const businessTypeColors = {
    individual: 'bg-blue-600',
    enterprise: 'bg-purple-600',
    polling: 'bg-gray-600',
    affiliate: 'bg-green-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{business.name || 'N/A'}</h1>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(business.status)}`}
                >
                  {business.status || 'N/A'}
                </span>
                {business.business_type && (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${
                      businessTypeColors[business.business_type] || 'bg-gray-600'
                    }`}
                  >
                    {business.business_type}
                  </span>
                )}
              </div>
              {business.key && (
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="block text-xs text-gray-400 dark:text-gray-500 truncate cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none mt-1"
                  title="Click to copy business key"
                >
                  {business.key}
                </button>
              )}
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              {!isEditing ? (
                <>
                  <button 
                    onClick={handleEdit}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button 
                    onClick={loadBusiness}
                    disabled={contextLoading || localLoading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {contextLoading || localLoading ? (
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <ArrowPathIcon className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </button>
                  <button 
                    onClick={() => navigate('/businesses', { state: location.state })} 
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleSave}
                    disabled={saving || contextLoading}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </button>
                  <button 
                    onClick={handleCancel}
                    disabled={saving}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {(error || contextError || formErrors.global) && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error || contextError || formErrors.global}
          </div>
        )}

        <div className="space-y-6">
          {/* Business Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Business Name {isEditing && <span className="text-red-500">*</span>}
                </label>
                {isEditing ? (
                  <>
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
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.name}</p>
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    value={business.name || 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Business Type</label>
                {isEditing ? (
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a type...</option>
                    <option value="individual">Individual</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="polling">Polling</option>
                    <option value="affiliate">Affiliate</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={business.business_type || 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={!isGlobalAdmin}
                    className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm ${
                      !isGlobalAdmin 
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <option value="edit">Edit</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClasses(business.status)}`}
                    >
                      {business.status || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Primary Contact Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Primary Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="primary_contact_name"
                    value={formData.primary_contact_name}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={business.primary_contact_name || 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Email</label>
                {isEditing ? (
                  <>
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
                    />
                    {formErrors.primary_contact_email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.primary_contact_email}</p>
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    value={business.primary_contact_email || 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Phone</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="primary_contact_phone"
                    value={formData.primary_contact_phone}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={business.primary_contact_phone || 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
            </div>
          </div>

          {/* Address details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Address details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address Line 1</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address_1"
                    value={formData.address_1}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={business.address_1 || 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address Line 2</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address_2"
                    value={formData.address_2}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={business.address_2 || 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={business.city || 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                {isEditing ? (
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
                ) : (
                  <input
                    type="text"
                    value={business.state ? getFriendlyState(business.state) : 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ZIP Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                ) : (
                  <input
                    type="text"
                    value={business.zip || 'N/A'}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                    readOnly
                  />
                )}
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SMS Base</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="pricing_sms_base"
                    value={formData.pricing_sms_base}
                    onChange={handleChange}
                    step="0.0001"
                    min="0"
                    disabled={!isGlobalAdmin}
                    className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm font-mono ${
                      !isGlobalAdmin 
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white font-mono">
                    ${(business.pricing_sms_base || 0).toFixed(4)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SMS Segment</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="pricing_sms_segment"
                    value={formData.pricing_sms_segment}
                    onChange={handleChange}
                    step="0.0001"
                    min="0"
                    disabled={!isGlobalAdmin}
                    className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm font-mono ${
                      !isGlobalAdmin 
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white font-mono">
                    ${(business.pricing_sms_segment || 0).toFixed(4)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">MMS Base</label>
                {isEditing ? (
                  <input
                    type="number"
                    name="pricing_mms_base"
                    value={formData.pricing_mms_base}
                    onChange={handleChange}
                    step="0.0001"
                    min="0"
                    disabled={!isGlobalAdmin}
                    className={`block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm font-mono ${
                      !isGlobalAdmin 
                        ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white font-mono">
                    ${(business.pricing_mms_base || 0).toFixed(4)}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prepay</label>
                {isEditing ? (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="prepay"
                      checked={formData.prepay}
                      onChange={handleChange}
                      disabled={!isGlobalAdmin}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                        !isGlobalAdmin 
                          ? 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                          : 'bg-white dark:bg-gray-700'
                      }`}
                    />
                    <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {formData.prepay ? 'Yes' : 'No'}
                    </label>
                  </div>
                ) : (
                  <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white">
                    {business.prepay ? 'Yes' : 'No'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Brands */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Brands</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewBrandModal(true)}
                  disabled={!business?.key}
                  className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => fetchBrands()}
                  disabled={brandsLoading}
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowPathIcon className={`h-4 w-4 mr-2 ${brandsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
            <NewBrandModal
              isOpen={showNewBrandModal}
              onClose={() => setShowNewBrandModal(false)}
              onSuccess={() => fetchBrands()}
              businessKey={business?.key ?? ''}
            />
            <EditBrandModal
              isOpen={showEditBrandModal}
              onClose={() => {
                setShowEditBrandModal(false);
                setBrandToEdit(null);
              }}
              onSuccess={() => fetchBrands()}
              brand={brandToEdit}
            />
            <Tooltip id="edit-brand-tooltip" />
            {brandsLoading && brandList.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-4">Loading brands...</div>
            ) : brandList.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400 py-4">No brands for this business.</div>
            ) : (
              <>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      {brandsTable.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {brandsTable.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-6 py-2 whitespace-nowrap">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Show:</label>
                    <select
                      value={brandsTable.getState().pagination.pageSize}
                      onChange={(e) => brandsTable.setPageSize(Number(e.target.value))}
                      className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {brandsTable.getState().pagination.pageIndex * brandsTable.getState().pagination.pageSize + 1} to{' '}
                    {Math.min(
                      (brandsTable.getState().pagination.pageIndex + 1) * brandsTable.getState().pagination.pageSize,
                      brandList.length
                    )}{' '}
                    of {brandList.length} results
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => brandsTable.setPageIndex(0)}
                      disabled={!brandsTable.getCanPreviousPage()}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      First
                    </button>
                    <button
                      type="button"
                      onClick={() => brandsTable.previousPage()}
                      disabled={!brandsTable.getCanPreviousPage()}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => brandsTable.nextPage()}
                      disabled={!brandsTable.getCanNextPage()}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      onClick={() => brandsTable.setPageIndex(brandsTable.getPageCount() - 1)}
                      disabled={!brandsTable.getCanNextPage()}
                      className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Keys */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">User Keys</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary User</label>
                {isEditing ? (
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
                ) : (
                  <div>
                    {business.primary_user_key && primaryUser ? (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <button
                          type="button"
                          onClick={() => navigate(`/users/view/${primaryUser.key}`)}
                          className="w-full text-left"
                        >
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {`${primaryUser.first_name || ''} ${primaryUser.last_name || ''}`.trim() || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {primaryUser.user_name || 'N/A'}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCopyUserKey(e, business.primary_user_key)}
                          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                          title="Click to copy user key"
                        >
                          {business.primary_user_key}
                        </button>
                      </div>
                    ) : (
                      <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                        No primary user assigned
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Affiliate User</label>
                {isEditing ? (
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
                ) : (
                  <div>
                    {business.affiliate_user_key && affiliateUser ? (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <button
                          type="button"
                          onClick={() => navigate(`/users/view/${affiliateUser.key}`)}
                          className="w-full text-left"
                        >
                          <div className="font-medium text-gray-900 dark:text-white mb-1">
                            {`${affiliateUser.first_name || ''} ${affiliateUser.last_name || ''}`.trim() || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {affiliateUser.user_name || 'N/A'}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleCopyUserKey(e, business.affiliate_user_key)}
                          className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                          title="Click to copy user key"
                        >
                          {business.affiliate_user_key}
                        </button>
                      </div>
                    ) : (
                      <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400">
                        No affiliate user assigned
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Selection Modals */}
          <UserSelectionModal
            isOpen={showPrimaryUserModal}
            onClose={() => setShowPrimaryUserModal(false)}
            onSelect={handlePrimaryUserSelect}
            currentUserKey={formData.primary_user_key}
            businessKey={business?.key || ''}
          />
          <UserSelectionModal
            isOpen={showAffiliateUserModal}
            onClose={() => setShowAffiliateUserModal(false)}
            onSelect={handleAffiliateUserSelect}
            currentUserKey={formData.affiliate_user_key}
            businessKey={business?.key || ''}
          />

          {/* Access Requests */}
          {business?.access_requests && business.access_requests.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Access Requests</h3>
              <div className="space-y-4">
                {business.access_requests.map((request) => (
                  <div
                    key={request.key}
                    className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700/50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          {`${request.first_name || ''} ${request.last_name || ''}`.trim() || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          <span className="font-medium">Username:</span> {request.user_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          <span className="font-medium">Email:</span> {request.email || 'N/A'}
                        </div>
                        {request.key && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            <span className="font-medium">User Key:</span> {request.key}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAcceptClick(request)}
                          disabled={contextLoading || localLoading}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accept Access Request Modal */}
          {showAcceptModal && selectedRequest && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  handleCancelAccept();
                }
              }}
            >
              <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 relative max-w-lg w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-100 dark:bg-green-900">
                      <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Accept Access Request
                    </h3>
                  </div>
                  <button 
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" 
                    onClick={handleCancelAccept} 
                    aria-label="Close"
                    disabled={acceptingRequest === selectedRequest.key}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Are you sure you want to grant access to this user?
                  </p>
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {`${selectedRequest.first_name || ''} ${selectedRequest.last_name || ''}`.trim() || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Username:</span> {selectedRequest.user_name || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Email:</span> {selectedRequest.email || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="sec:businessuser">Business User</option>
                      <option value="sec:businessadmin">Business Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancelAccept}
                    disabled={acceptingRequest === selectedRequest.key}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAccessRequest}
                    disabled={acceptingRequest === selectedRequest.key || !selectedRole}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {acceptingRequest === selectedRequest.key ? (
                      <>
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Confirm Accept
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created User</label>
                <input
                  type="text"
                  value={business.created_user || 'N/A'}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created Date</label>
                <input
                  type="text"
                  value={business.created_dt ? format(new Date(business.created_dt * 1000), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Updated User</label>
                <input
                  type="text"
                  value={business.updated_user || 'N/A'}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Updated Date</label>
                <input
                  type="text"
                  value={business.updated_dt ? format(new Date(business.updated_dt * 1000), 'MMM dd, yyyy HH:mm:ss') : 'N/A'}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Version</label>
                <input
                  type="text"
                  value={business.version || 'N/A'}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

