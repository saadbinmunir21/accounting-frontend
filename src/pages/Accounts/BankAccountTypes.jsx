// src/pages/Accounts/BankAccountTypes.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Landmark, AlertCircle, CheckCircle } from 'lucide-react';
import { bankAccountTypeAPI } from '../../services/api';

const BankAccountTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await bankAccountTypeAPI.getAll();
      setTypes(response.data.data || response.data);
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Failed to fetch bank account types' });
    } finally {
      setLoading(false);
    }
  };

  const filteredTypes = types.filter((type) =>
    type.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingType(null);
    setFormData({ name: '' });
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name || '',
    });
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingType(null);
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await bankAccountTypeAPI.update(editingType._id, formData);
        setMessage({ type: 'success', text: 'Bank account type updated successfully!' });
      } else {
        await bankAccountTypeAPI.create(formData);
        setMessage({ type: 'success', text: 'Bank account type created successfully!' });
      }
      setTimeout(() => {
        handleCloseModal();
        fetchTypes();
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save' });
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await bankAccountTypeAPI.delete(id);
        setMessage({ type: 'success', text: 'Deleted successfully!' });
        fetchTypes();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Bank Account Types</h1>
          <p className="text-secondary-600 mt-1">Manage bank account type categories</p>
        </div>
        <button onClick={handleAddNew} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-5 py-2.5 font-semibold flex items-center space-x-2 shadow-md hover:shadow-lg transition-all">
          <Plus className="w-5 h-5" />
          <span>Add Type</span>
        </button>
      </div>

      {message.text && !showModal && (
        <div className={`p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-soft p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-secondary-900" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-secondary-600">Loading...</p>
          </div>
        ) : filteredTypes.length === 0 ? (
          <div className="p-12 text-center">
            <Landmark className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
            <p className="text-lg font-semibold text-secondary-900 mb-2">No types found</p>
            <button onClick={handleAddNew} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-5 py-2.5 font-semibold inline-flex items-center space-x-2 shadow-md transition-all">
              <Plus className="w-5 h-5" />
              <span>Add Type</span>
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200 bg-secondary-50">
                <th className="text-left py-2 px-3 text-sm font-semibold text-secondary-700">Name</th>
                <th className="text-left py-2 px-3 text-sm font-semibold text-secondary-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.map((type) => (
                <tr key={type._id} className="border-b border-secondary-100 hover:bg-secondary-50 transition-colors">
                  <td className="py-2 px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Landmark className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="font-semibold text-secondary-900">{type.name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleEdit(type)} className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(type._id, type.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
          <div className="bg-white rounded-2xl shadow-large w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-secondary-900">{editingType ? 'Edit Bank Account Type' : 'Add New Bank Account Type'}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-secondary-100 rounded-lg transition-colors">
                <X className="w-6 h-6 text-secondary-600" />
              </button>
            </div>
            {message.text && (
              <div className="px-6 pt-4">
                <div className={`p-4 rounded-lg flex items-start space-x-3 ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                  <p className={`text-sm ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">Name <span className="text-red-600">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-secondary-900" placeholder="e.g., Checking, Savings" />
                </div>
              </div>
              <div className="bg-secondary-50 border-t border-secondary-200 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2.5 bg-white text-secondary-700 font-semibold rounded-lg border border-secondary-300 hover:bg-secondary-50 transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">{editingType ? 'Update Bank Account Type' : 'Create Bank Account Type'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountTypes;
