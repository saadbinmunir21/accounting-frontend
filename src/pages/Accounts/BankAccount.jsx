// src/pages/Accounts/BankAccount.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import { bankAccountAPI, bankAccountTypeAPI } from '../../services/api';

const BankAccount = () => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [bankAccountTypes, setBankAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    bankAccountType: '',
  });

  // Fetch data on mount
  useEffect(() => {
    fetchBankAccounts();
    fetchBankAccountTypes();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await bankAccountAPI.getAll();
      setBankAccounts(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setMessage({ type: 'error', text: 'Failed to fetch bank accounts' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBankAccountTypes = async () => {
    try {
      const response = await bankAccountTypeAPI.getAll();
      setBankAccountTypes(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching bank account types:', error);
    }
  };

  // Filter bank accounts based on search
  const filteredBankAccounts = bankAccounts.filter((account) =>
    account.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.accountName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open modal for adding new bank account
  const handleAddNew = () => {
    setEditingAccount(null);
    setFormData({
      bankName: '',
      accountName: '',
      bankAccountType: '',
    });
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  // Open modal for editing bank account
  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName || '',
      accountName: account.accountName || '',
      bankAccountType: account.bankAccountType?._id || account.bankAccountType || '',
    });
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setMessage({ type: '', text: '' });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingAccount) {
        await bankAccountAPI.update(editingAccount._id, formData);
        setMessage({ type: 'success', text: 'Bank account updated successfully!' });
      } else {
        await bankAccountAPI.create(formData);
        setMessage({ type: 'success', text: 'Bank account created successfully!' });
      }
      setTimeout(() => {
        handleCloseModal();
        fetchBankAccounts();
      }, 1500);
    } catch (error) {
      console.error('Error saving bank account:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save bank account' });
    }
  };

  // Delete bank account
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await bankAccountAPI.delete(id);
        setMessage({ type: 'success', text: 'Bank account deleted successfully!' });
        fetchBankAccounts();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        console.error('Error deleting bank account:', error);
        setMessage({ type: 'error', text: 'Failed to delete bank account' });
      }
    }
  };

  const getBankAccountTypeName = (account) => {
    if (typeof account.bankAccountType === 'object' && account.bankAccountType?.name) {
      return account.bankAccountType.name;
    }
    const type = bankAccountTypes.find((t) => t._id === account.bankAccountType);
    return type?.name || '-';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Bank Accounts</h1>
          <p className="text-secondary-600 mt-1">Manage your bank accounts</p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-5 py-2.5 font-semibold flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Bank Account</span>
        </button>
      </div>

      {/* Message Alert */}
      {message.text && !showModal && (
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
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search bank accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
          />
        </div>
      </div>

      {/* Bank Accounts Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-secondary-600">Loading bank accounts...</p>
          </div>
        ) : filteredBankAccounts.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
            <p className="text-lg font-semibold text-secondary-900 mb-2">No bank accounts found</p>
            <p className="text-secondary-600 mb-6">Get started by creating your first bank account</p>
            <button
              onClick={handleAddNew}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-5 py-2.5 font-semibold inline-flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Add Bank Account</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200 bg-secondary-50">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-secondary-700">Bank Name</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-secondary-700">Account Name</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-secondary-700">Account Type</th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-secondary-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBankAccounts.map((account) => (
                  <tr key={account._id} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="font-semibold text-secondary-900">{account.bankName}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-secondary-900">{account.accountName}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-sm text-secondary-700">{getBankAccountTypeName(account)}</span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(account._id, account.accountName)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Bank Account */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-large w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-secondary-900">
                {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
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
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    Bank Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                    placeholder="e.g., Chase Bank"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    Account Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                    placeholder="e.g., Business Checking"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    Bank Account Type <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="bankAccountType"
                    value={formData.bankAccountType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900"
                  >
                    <option value="">Select account type</option>
                    {bankAccountTypes.map((type) => (
                      <option key={type._id} value={type._id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-secondary-50 border-t border-secondary-200 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 bg-white text-secondary-700 font-semibold rounded-lg border border-secondary-300 hover:bg-secondary-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  {editingAccount ? 'Update Bank Account' : 'Create Bank Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccount;
