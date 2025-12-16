// src/components/Forms/AccountFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { chartOfAccountsAPI, accountTypeAPI, taxTypeAPI } from '../../services/api';

const AccountFormModal = ({
  show,
  onClose,
  onSuccess,
  initialData = null
}) => {
  const [message, setMessage] = useState({ type: '', text: '' });
  const [accountTypes, setAccountTypes] = useState([]);
  const [taxTypes, setTaxTypes] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    accountType: '',
    tax: '',
  });

  // Fetch account types and tax types on mount
  useEffect(() => {
    if (show) {
      fetchAccountTypes();
      fetchTaxTypes();
    }
  }, [show]);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        accountType: initialData.accountType?._id || initialData.accountType || '',
        tax: initialData.tax?._id || initialData.tax || '',
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        accountType: '',
        tax: '',
      });
    }
    setMessage({ type: '', text: '' });
  }, [initialData]);

  const fetchAccountTypes = async () => {
    try {
      const response = await accountTypeAPI.getAll();
      setAccountTypes(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching account types:', error);
    }
  };

  const fetchTaxTypes = async () => {
    try {
      const response = await taxTypeAPI.getAll();
      setTaxTypes(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching tax types:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (initialData) {
        response = await chartOfAccountsAPI.update(initialData._id, formData);
        setMessage({ type: 'success', text: 'Account updated successfully!' });
      } else {
        response = await chartOfAccountsAPI.create(formData);
        setMessage({ type: 'success', text: 'Account created successfully!' });
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response.data.data || response.data);
        }
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving account:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save account' });
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-large w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-secondary-900">
            {initialData ? 'Edit Account' : 'Add New Account'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-secondary-600" />
          </button>
        </div>

        {/* Message Alert in Modal */}
        {message.text && (
          <div className="px-6 pt-4">
            <div
              className={`p-4 rounded-lg flex items-start space-x-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message.text}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                  placeholder="e.g., 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                  placeholder="Account name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Account Type <span className="text-red-600">*</span>
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                >
                  <option value="">Select account type</option>
                  {accountTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">Tax Type</label>
                <select
                  name="tax"
                  value={formData.tax}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                >
                  <option value="">No tax</option>
                  {taxTypes.map((tax) => (
                    <option key={tax._id} value={tax._id}>
                      {tax.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                placeholder="Account description..."
              />
            </div>
          </div>

          <div className="bg-secondary-50 border-t border-secondary-200 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white text-secondary-700 font-semibold rounded-lg border border-secondary-300 hover:bg-secondary-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {initialData ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountFormModal;
