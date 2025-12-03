// src/pages/Contacts/Contacts.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Mail, Phone, Building } from 'lucide-react';
import { contactAPI } from '../../services/api';
import './Contacts.css';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    contactName: '',
    accountNumber: '',
    email: '',
    phone: '',
    website: '',
    businessRegistrationNumber: '',
    notes: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
    financialDetails: {
      bankAccountName: '',
      bankAccountNumber: '',
      bankDetails: '',
      taxIdNumber: '',
    },
  });
  const [sameAsBilling, setSameAsBilling] = useState(false);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactAPI.getAll();
      setContacts(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      alert('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  // Filter contacts based on search
  const filteredContacts = contacts.filter((contact) =>
    contact.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open modal for adding new contact
  const handleAddNew = () => {
    setEditingContact(null);
    setFormData({
      contactName: '',
      accountNumber: '',
      email: '',
      phone: '',
      website: '',
      businessRegistrationNumber: '',
      notes: '',
      billingAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      deliveryAddress: {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      financialDetails: {
        bankAccountName: '',
        bankAccountNumber: '',
        bankDetails: '',
        taxIdNumber: '',
      },
    });
    setSameAsBilling(false);
    setShowModal(true);
  };

  // Open modal for editing contact
  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData({
      contactName: contact.contactName || '',
      accountNumber: contact.accountNumber || '',
      email: contact.email || '',
      phone: contact.phone || '',
      website: contact.website || '',
      businessRegistrationNumber: contact.businessRegistrationNumber || '',
      notes: contact.notes || '',
      billingAddress: contact.billingAddress || {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      deliveryAddress: contact.deliveryAddress || {
        street: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
      },
      financialDetails: contact.financialDetails || {
        bankAccountName: '',
        bankAccountNumber: '',
        bankDetails: '',
        taxIdNumber: '',
      },
    });
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle nested object changes (addresses, financial details)
  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Copy billing address to delivery address
  const handleSameAsBilling = (checked) => {
    setSameAsBilling(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        deliveryAddress: { ...prev.billingAddress },
      }));
    }
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingContact) {
        // Update existing contact
        await contactAPI.update(editingContact._id, formData);
        alert('Contact updated successfully!');
      } else {
        // Create new contact
        await contactAPI.create(formData);
        alert('Contact created successfully!');
      }
      handleCloseModal();
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert(error.response?.data?.message || 'Failed to save contact');
    }
  };

  // Delete contact
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await contactAPI.delete(id);
        alert('Contact deleted successfully!');
        fetchContacts();
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact');
      }
    }
  };

  return (
    <div className="contacts-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts</h1>
          <p className="page-subtitle">Manage your customer and vendor contacts</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="card">
        {loading ? (
          <div className="loading">Loading contacts...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="empty-state">
            <p>No contacts found</p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <Plus size={20} />
              Add Your First Contact
            </button>
          </div>
        ) : (
          <div className="contacts-table">
            <table>
              <thead>
                <tr>
                  <th>Contact Name</th>
                  <th>Account Number</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>
                      <div className="contact-name">
                        <Building size={16} />
                        <strong>{contact.contactName}</strong>
                      </div>
                    </td>
                    <td>{contact.accountNumber || '-'}</td>
                    <td>
                      {contact.email ? (
                        <div className="contact-email">
                          <Mail size={14} />
                          {contact.email}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      {contact.phone ? (
                        <div className="contact-phone">
                          <Phone size={14} />
                          {contact.phone}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{contact.billingAddress?.city || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(contact)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(contact._id, contact.contactName)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
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

      {/* Modal for Add/Edit Contact */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>
                        Contact Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter contact name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Account Number</label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., ACC-001"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="contact@example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1-555-0100"
                      />
                    </div>

                    <div className="form-group">
                      <label>Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label>Business Registration Number</label>
                      <input
                        type="text"
                        name="businessRegistrationNumber"
                        value={formData.businessRegistrationNumber}
                        onChange={handleInputChange}
                        placeholder="BRN-123456"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="form-section">
                  <h3>Billing Address</h3>
                  <div className="form-grid">
                    <div className="form-group col-span-2">
                      <label>Street</label>
                      <input
                        type="text"
                        value={formData.billingAddress.street}
                        onChange={(e) =>
                          handleNestedChange('billingAddress', 'street', e.target.value)
                        }
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={formData.billingAddress.city}
                        onChange={(e) =>
                          handleNestedChange('billingAddress', 'city', e.target.value)
                        }
                        placeholder="New York"
                      />
                    </div>

                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={formData.billingAddress.state}
                        onChange={(e) =>
                          handleNestedChange('billingAddress', 'state', e.target.value)
                        }
                        placeholder="NY"
                      />
                    </div>

                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        value={formData.billingAddress.country}
                        onChange={(e) =>
                          handleNestedChange('billingAddress', 'country', e.target.value)
                        }
                        placeholder="USA"
                      />
                    </div>

                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        value={formData.billingAddress.postalCode}
                        onChange={(e) =>
                          handleNestedChange('billingAddress', 'postalCode', e.target.value)
                        }
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="form-section">
                  <div className="section-header">
                    <h3>Delivery Address</h3>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={sameAsBilling}
                        onChange={(e) => handleSameAsBilling(e.target.checked)}
                      />
                      Same as billing address
                    </label>
                  </div>
                  <div className="form-grid">
                    <div className="form-group col-span-2">
                      <label>Street</label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.street}
                        onChange={(e) =>
                          handleNestedChange('deliveryAddress', 'street', e.target.value)
                        }
                        disabled={sameAsBilling}
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.city}
                        onChange={(e) =>
                          handleNestedChange('deliveryAddress', 'city', e.target.value)
                        }
                        disabled={sameAsBilling}
                        placeholder="New York"
                      />
                    </div>

                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.state}
                        onChange={(e) =>
                          handleNestedChange('deliveryAddress', 'state', e.target.value)
                        }
                        disabled={sameAsBilling}
                        placeholder="NY"
                      />
                    </div>

                    <div className="form-group">
                      <label>Country</label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.country}
                        onChange={(e) =>
                          handleNestedChange('deliveryAddress', 'country', e.target.value)
                        }
                        disabled={sameAsBilling}
                        placeholder="USA"
                      />
                    </div>

                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        value={formData.deliveryAddress.postalCode}
                        onChange={(e) =>
                          handleNestedChange('deliveryAddress', 'postalCode', e.target.value)
                        }
                        disabled={sameAsBilling}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Details */}
                <div className="form-section">
                  <h3>Financial Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Bank Account Name</label>
                      <input
                        type="text"
                        value={formData.financialDetails.bankAccountName}
                        onChange={(e) =>
                          handleNestedChange('financialDetails', 'bankAccountName', e.target.value)
                        }
                        placeholder="Business Account"
                      />
                    </div>

                    <div className="form-group">
                      <label>Bank Account Number</label>
                      <input
                        type="text"
                        value={formData.financialDetails.bankAccountNumber}
                        onChange={(e) =>
                          handleNestedChange(
                            'financialDetails',
                            'bankAccountNumber',
                            e.target.value
                          )
                        }
                        placeholder="1234567890"
                      />
                    </div>

                    <div className="form-group col-span-2">
                      <label>Bank Details</label>
                      <input
                        type="text"
                        value={formData.financialDetails.bankDetails}
                        onChange={(e) =>
                          handleNestedChange('financialDetails', 'bankDetails', e.target.value)
                        }
                        placeholder="Chase Bank, NY Branch"
                      />
                    </div>

                    <div className="form-group">
                      <label>Tax ID Number</label>
                      <input
                        type="text"
                        value={formData.financialDetails.taxIdNumber}
                        onChange={(e) =>
                          handleNestedChange('financialDetails', 'taxIdNumber', e.target.value)
                        }
                        placeholder="TAX-123456"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="form-section">
                  <h3>Notes</h3>
                  <div className="form-group">
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Additional notes about this contact..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingContact ? 'Update Contact' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;