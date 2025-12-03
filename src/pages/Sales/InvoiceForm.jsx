// src/pages/Sales/InvoiceForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { salesInvoiceAPI, contactAPI, itemAPI, projectAPI, bankAccountAPI } from '../../services/api';
import './InvoiceForm.css';

const InvoiceForm = ({ invoice, onClose, onSuccess }) => {
  const [contacts, setContacts] = useState([]);
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    contact: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    reference: '',
    onlinePayment: '',
    amountTreatment: 'Exclusive',
    lineItems: [
      {
        item: '',
        description: '',
        qty: 1,
        price: 0,
        discount: 0,
        account: '',
        taxRate: '',
        taxRatePercent: 0,
        project: '',
      },
    ],
    notes: '',
  });

  // Fetch dropdown data
  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Load invoice data if editing
  useEffect(() => {
    if (invoice) {
      setFormData({
        contact: invoice.contact?._id || '',
        issueDate: invoice.issueDate?.split('T')[0] || '',
        dueDate: invoice.dueDate?.split('T')[0] || '',
        reference: invoice.reference || '',
        onlinePayment: invoice.onlinePayment?._id || '',
        amountTreatment: invoice.amountTreatment || 'Exclusive',
        lineItems: invoice.lineItems?.map((item) => ({
          item: item.item?._id || '',
          description: item.description || '',
          qty: item.qty || 1,
          price: item.price || 0,
          discount: item.discount || 0,
          account: item.account?._id || '',
          taxRate: item.taxRate?._id || '',
          taxRatePercent: item.taxRate?.rate || 0,
          project: item.project?._id || '',
        })) || [],
        notes: invoice.notes || '',
      });
    }
  }, [invoice]);

  const fetchDropdownData = async () => {
    try {
      const [contactsRes, itemsRes, projectsRes, bankAccountsRes] = await Promise.all([
        contactAPI.getAll(),
        itemAPI.getAll(),
        projectAPI.getAll(),
        bankAccountAPI.getAll(),
      ]);

      setContacts(contactsRes.data.data || contactsRes.data || []);
      setItems(itemsRes.data.data || itemsRes.data || []);
      setProjects(projectsRes.data.data || projectsRes.data || []);
      setBankAccounts(bankAccountsRes.data.data || bankAccountsRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  // Handle item selection (auto-populate)
  const handleItemSelect = async (index, itemId) => {
    if (!itemId) return;

    try {
      const response = await itemAPI.getSaleDetails(itemId);
      const itemData = response.data.data;

      const newLineItems = [...formData.lineItems];
      newLineItems[index] = {
        ...newLineItems[index],
        item: itemData._id,
        description: itemData.description || '',
        price: itemData.price || 0,
        account: itemData.account?._id || '',
        taxRate: itemData.taxRate?._id || '',
        taxRatePercent: itemData.taxRate?.rate || 0,
      };

      setFormData({ ...formData, lineItems: newLineItems });
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  };

  // Handle line item change
  const handleLineItemChange = (index, field, value) => {
    const newLineItems = [...formData.lineItems];
    newLineItems[index][field] = value;
    setFormData({ ...formData, lineItems: newLineItems });
  };

  // Add new line item
  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        {
          item: '',
          description: '',
          qty: 1,
          price: 0,
          discount: 0,
          account: '',
          taxRate: '',
          taxRatePercent: 0,
          project: '',
        },
      ],
    });
  };

  // Remove line item
  const removeLineItem = (index) => {
    const newLineItems = formData.lineItems.filter((_, i) => i !== index);
    setFormData({ ...formData, lineItems: newLineItems });
  };

  // Calculate line item amounts (real-time preview)
  const calculateLineItem = (lineItem) => {
    const subtotal = lineItem.qty * lineItem.price;
    const discountAmount = subtotal * (lineItem.discount / 100);
    const afterDiscount = subtotal - discountAmount;

    let taxAmount = 0;
    let amount = 0;

    if (formData.amountTreatment === 'Inclusive') {
      taxAmount = afterDiscount - afterDiscount / (1 + lineItem.taxRatePercent / 100);
      amount = afterDiscount;
    } else if (formData.amountTreatment === 'Exclusive') {
      taxAmount = afterDiscount * (lineItem.taxRatePercent / 100);
      amount = afterDiscount + taxAmount;
    } else {
      // No Tax
      taxAmount = 0;
      amount = afterDiscount;
    }

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      amount: Math.round(amount * 100) / 100,
    };
  };

  // Calculate invoice totals
  const invoiceTotals = useMemo(() => {
    const totals = formData.lineItems.reduce(
      (acc, lineItem) => {
        const calc = calculateLineItem(lineItem);
        return {
          subtotal: acc.subtotal + calc.subtotal,
          totalDiscount: acc.totalDiscount + calc.discountAmount,
          totalTax: acc.totalTax + calc.taxAmount,
          grandTotal: acc.grandTotal + calc.amount,
        };
      },
      { subtotal: 0, totalDiscount: 0, totalTax: 0, grandTotal: 0 }
    );

    return {
      subtotal: Math.round(totals.subtotal * 100) / 100,
      totalDiscount: Math.round(totals.totalDiscount * 100) / 100,
      totalTax: Math.round(totals.totalTax * 100) / 100,
      grandTotal: Math.round(totals.grandTotal * 100) / 100,
    };
  }, [formData.lineItems, formData.amountTreatment]);

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.contact) {
      alert('Please select a customer');
      return;
    }

    if (formData.lineItems.length === 0 || !formData.lineItems[0].item) {
      alert('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      // Prepare data (send raw values, backend will calculate)
      const invoiceData = {
        contact: formData.contact,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        reference: formData.reference,
        onlinePayment: formData.onlinePayment || undefined,
        amountTreatment: formData.amountTreatment,
        lineItems: formData.lineItems.map((item) => ({
          item: item.item,
          description: item.description,
          qty: parseFloat(item.qty),
          price: parseFloat(item.price),
          discount: parseFloat(item.discount),
          account: item.account,
          taxRate: item.taxRate,
          project: item.project || undefined,
        })),
        notes: formData.notes,
      };

      if (invoice) {
        // Update existing invoice
        await salesInvoiceAPI.update(invoice._id, invoiceData);
        alert('Invoice updated successfully!');
      } else {
        // Create new invoice
        await salesInvoiceAPI.create(invoiceData);
        alert('Invoice created successfully!');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert(error.response?.data?.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invoice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Invoice Header */}
            <div className="form-section">
              <h3>Invoice Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Customer <span className="required">*</span>
                  </label>
                  <select
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    required
                  >
                    <option value="">Select Customer</option>
                    {contacts.map((contact) => (
                      <option key={contact._id} value={contact._id}>
                        {contact.contactName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Issue Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Due Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="PO-12345"
                  />
                </div>

                <div className="form-group">
                  <label>Payment Account</label>
                  <select
                    value={formData.onlinePayment}
                    onChange={(e) => setFormData({ ...formData, onlinePayment: e.target.value })}
                  >
                    <option value="">Select Account</option>
                    {bankAccounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.bankName} - {account.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Tax Treatment <span className="required">*</span>
                  </label>
                  <select
                    value={formData.amountTreatment}
                    onChange={(e) => setFormData({ ...formData, amountTreatment: e.target.value })}
                    required
                  >
                    <option value="Exclusive">Tax Exclusive</option>
                    <option value="Inclusive">Tax Inclusive</option>
                    <option value="No Tax">No Tax</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="form-section">
              <div className="section-header">
                <h3>Items</h3>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addLineItem}>
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              <div className="line-items-table">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '200px' }}>Item</th>
                      <th style={{ width: '200px' }}>Description</th>
                      <th style={{ width: '80px' }}>Qty</th>
                      <th style={{ width: '100px' }}>Price</th>
                      <th style={{ width: '80px' }}>Disc %</th>
                      <th style={{ width: '100px' }}>Tax</th>
                      <th style={{ width: '100px' }}>Amount</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lineItems.map((lineItem, index) => {
                      const calc = calculateLineItem(lineItem);
                      return (
                        <tr key={index}>
                          <td>
                            <select
                              value={lineItem.item}
                              onChange={(e) => handleItemSelect(index, e.target.value)}
                              required
                            >
                              <option value="">Select Item</option>
                              {items.map((item) => (
                                <option key={item._id} value={item._id}>
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={lineItem.description}
                              onChange={(e) =>
                                handleLineItemChange(index, 'description', e.target.value)
                              }
                              placeholder="Description"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={lineItem.qty}
                              onChange={(e) =>
                                handleLineItemChange(index, 'qty', parseFloat(e.target.value) || 0)
                              }
                              min="0.01"
                              step="0.01"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={lineItem.price}
                              onChange={(e) =>
                                handleLineItemChange(index, 'price', parseFloat(e.target.value) || 0)
                              }
                              min="0"
                              step="0.01"
                              required
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              value={lineItem.discount}
                              onChange={(e) =>
                                handleLineItemChange(
                                  index,
                                  'discount',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </td>
                          <td>
                            <div className="calculated-cell">{formatCurrency(calc.taxAmount)}</div>
                          </td>
                          <td>
                            <div className="calculated-cell">
                              <strong>{formatCurrency(calc.amount)}</strong>
                            </div>
                          </td>
                          <td>
                            {formData.lineItems.length > 1 && (
                              <button
                                type="button"
                                className="btn-icon btn-delete"
                                onClick={() => removeLineItem(index)}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="invoice-totals">
              <div className="totals-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoiceTotals.subtotal)}</span>
              </div>
              <div className="totals-row">
                <span>Discount:</span>
                <span className="text-red">-{formatCurrency(invoiceTotals.totalDiscount)}</span>
              </div>
              <div className="totals-row">
                <span>Tax:</span>
                <span>{formatCurrency(invoiceTotals.totalTax)}</span>
              </div>
              <div className="totals-row total">
                <span>
                  <strong>Grand Total:</strong>
                </span>
                <span>
                  <strong>{formatCurrency(invoiceTotals.grandTotal)}</strong>
                </span>
              </div>
            </div>

            {/* Notes */}
            <div className="form-section">
              <h3>Notes</h3>
              <div className="form-group">
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Additional notes or terms..."
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;