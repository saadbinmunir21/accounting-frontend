// src/pages/Sales/SalesInvoice.jsx
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  X,
  Calendar,
  Filter,
} from 'lucide-react';
import { salesInvoiceAPI, contactAPI, itemAPI, projectAPI, bankAccountAPI } from '../../services/api';
import InvoiceForm from './InvoiceForm';
import './SalesInvoice.css';

const SalesInvoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Fetch invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await salesInvoiceAPI.getAll();
      setInvoices(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      alert('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.contact?.contactName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Open form for new invoice
  const handleAddNew = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  // Open form for editing
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  // Close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  // Delete invoice
  const handleDelete = async (id, invoiceNumber) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invoiceNumber}?`)) {
      try {
        await salesInvoiceAPI.delete(id);
        alert('Invoice deleted successfully!');
        fetchInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice');
      }
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const classes = {
      Draft: 'status-draft',
      Sent: 'status-sent',
      Paid: 'status-paid',
      Overdue: 'status-overdue',
      Cancelled: 'status-cancelled',
    };
    return classes[status] || 'status-draft';
  };

  return (
    <div className="sales-invoice-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Invoices</h1>
          <p className="page-subtitle">Create and manage your sales invoices</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="filters-row">
          {/* Search */}
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search by invoice number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <Filter size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="card">
        {loading ? (
          <div className="loading">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="empty-state">
            <p>No invoices found</p>
            <button className="btn btn-primary" onClick={handleAddNew}>
              <Plus size={20} />
              Create Your First Invoice
            </button>
          </div>
        ) : (
          <div className="invoices-table">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>
                      <strong>{invoice.invoiceNumber}</strong>
                    </td>
                    <td>{invoice.contact?.contactName || 'N/A'}</td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} />
                        {formatDate(invoice.issueDate)}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} />
                        {formatDate(invoice.dueDate)}
                      </div>
                    </td>
                    <td>
                      <strong>{formatCurrency(invoice.grandTotal)}</strong>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => handleEdit(invoice)}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(invoice)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(invoice._id, invoice.invoiceNumber)}
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

      {/* Invoice Form Modal */}
      {showForm && (
        <InvoiceForm
          invoice={editingInvoice}
          onClose={handleCloseForm}
          onSuccess={() => {
            handleCloseForm();
            fetchInvoices();
          }}
        />
      )}
    </div>
  );
};

export default SalesInvoice;