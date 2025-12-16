// src/components/Forms/ItemFormModal.jsx
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { itemAPI, chartOfAccountsAPI, taxTypeAPI } from '../../services/api';

const ItemFormModal = ({
  show,
  onClose,
  onSuccess,
  initialData = null
}) => {
  const [message, setMessage] = useState({ type: '', text: '' });
  const [accounts, setAccounts] = useState([]);
  const [taxTypes, setTaxTypes] = useState([]);
  const [formData, setFormData] = useState({
    itemCode: '',
    name: '',
    description: '',
    costPrice: '',
    salePrice: '',
    purchaseAccount: '',
    taxRateOnPurchase: '',
    saleAccount: '',
    taxRateOnSale: '',
  });

  // Fetch accounts and tax types on mount
  useEffect(() => {
    if (show) {
      fetchAccounts();
      fetchTaxTypes();
    }
  }, [show]);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        itemCode: initialData.itemCode || '',
        name: initialData.name || '',
        description: initialData.description || '',
        costPrice: initialData.costPrice || '',
        salePrice: initialData.salePrice || '',
        purchaseAccount: initialData.purchaseAccount?._id || initialData.purchaseAccount || '',
        taxRateOnPurchase: initialData.taxRateOnPurchase?._id || initialData.taxRateOnPurchase || '',
        saleAccount: initialData.saleAccount?._id || initialData.saleAccount || '',
        taxRateOnSale: initialData.taxRateOnSale?._id || initialData.taxRateOnSale || '',
      });
    } else {
      setFormData({
        itemCode: '',
        name: '',
        description: '',
        costPrice: '',
        salePrice: '',
        purchaseAccount: '',
        taxRateOnPurchase: '',
        saleAccount: '',
        taxRateOnSale: '',
      });
    }
    setMessage({ type: '', text: '' });
  }, [initialData]);

  const fetchAccounts = async () => {
    try {
      const response = await chartOfAccountsAPI.getAll();
      setAccounts(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
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
        response = await itemAPI.update(initialData._id, formData);
        setMessage({ type: 'success', text: 'Item updated successfully!' });
      } else {
        response = await itemAPI.create(formData);
        setMessage({ type: 'success', text: 'Item created successfully!' });
      }

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response.data.data || response.data);
        }
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error saving item:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save item' });
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="text-2xl font-bold text-secondary-900">
              {initialData ? 'Edit Item' : 'Add New Item'}
            </h2>
            <p className="text-sm text-secondary-600 mt-1">
              {initialData ? 'Update item information and pricing' : 'Create a new item for inventory'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-secondary-600" />
          </button>
        </div>

        {/* Message Alert in Modal */}
        {message.text && (
          <div className="px-6 pt-6">
            <div
              className={`p-4 rounded-lg flex items-start space-x-3 animate-slideDown ${
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
          <div className="px-6 py-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    Item Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="itemCode"
                    value={formData.itemCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                    placeholder="e.g., ITM-001"
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
                    placeholder="Enter item name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                    placeholder="Item description..."
                  />
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Purchase Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">Cost Price</label>
                  <input
                    type="number"
                    name="costPrice"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">Purchase Account</label>
                  <select
                    name="purchaseAccount"
                    value={formData.purchaseAccount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">Tax Rate on Purchase</label>
                  <select
                    name="taxRateOnPurchase"
                    value={formData.taxRateOnPurchase}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                  >
                    <option value="">No tax</option>
                    {taxTypes.map((tax) => (
                      <option key={tax._id} value={tax._id}>
                        {tax.name} ({tax.taxPercentage}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sale Information */}
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Sale Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">Sale Price</label>
                  <input
                    type="number"
                    name="salePrice"
                    step="0.01"
                    min="0"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">Sale Account</label>
                  <select
                    name="saleAccount"
                    value={formData.saleAccount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">Tax Rate on Sale</label>
                  <select
                    name="taxRateOnSale"
                    value={formData.taxRateOnSale}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                  >
                    <option value="">No tax</option>
                    {taxTypes.map((tax) => (
                      <option key={tax._id} value={tax._id}>
                        {tax.name} ({tax.taxPercentage}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-secondary-50 border-t border-secondary-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
            >
              {initialData ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;
