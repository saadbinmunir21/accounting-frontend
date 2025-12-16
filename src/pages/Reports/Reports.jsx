import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Scale,
  DollarSign,
  BarChart3,
  Users,
  ShoppingCart,
  ShoppingBag,
  Percent,
  FileBarChart,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  salesInvoiceAPI,
  billAPI,
  contactAPI,
  taxTypeAPI,
  chartOfAccountsAPI,
} from '../../services/api';

const Reports = () => {
  const [selectedCategory, setSelectedCategory] = useState('financial');
  const [selectedReport, setSelectedReport] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportCategories = [
    { id: 'financial', name: 'Financial Reports', icon: Scale },
    { id: 'sales', name: 'Sales Reports', icon: ShoppingCart },
    { id: 'purchase', name: 'Purchase Reports', icon: ShoppingBag },
    { id: 'tax', name: 'Tax Reports', icon: Percent },
    { id: 'contacts', name: 'Contact Reports', icon: Users },
  ];

  const reports = {
    financial: [
      { id: 'profit-loss', name: 'Profit & Loss Statement', icon: TrendingUp },
      { id: 'balance-sheet', name: 'Balance Sheet', icon: Scale },
      { id: 'cash-flow', name: 'Cash Flow Statement', icon: BarChart3 },
      { id: 'trial-balance', name: 'Trial Balance', icon: FileBarChart },
    ],
    sales: [
      { id: 'sales-summary', name: 'Sales Summary', icon: DollarSign },
      { id: 'sales-by-customer', name: 'Sales by Customer', icon: Users },
      { id: 'sales-by-item', name: 'Sales by Item', icon: FileText },
      { id: 'invoice-details', name: 'Invoice Details', icon: FileText },
      { id: 'customer-balance', name: 'Customer Balance Summary', icon: DollarSign },
      { id: 'aged-receivables', name: 'Aged Receivables', icon: Calendar },
    ],
    purchase: [
      { id: 'purchase-summary', name: 'Purchase Summary', icon: DollarSign },
      { id: 'purchase-by-vendor', name: 'Purchase by Vendor', icon: Users },
      { id: 'purchase-by-item', name: 'Purchase by Item', icon: FileText },
      { id: 'bill-details', name: 'Bill Details', icon: FileText },
      { id: 'vendor-balance', name: 'Vendor Balance Summary', icon: DollarSign },
      { id: 'aged-payables', name: 'Aged Payables', icon: Calendar },
    ],
    tax: [
      { id: 'tax-summary', name: 'Tax Summary', icon: Percent },
      { id: 'sales-tax', name: 'Sales Tax Report', icon: ShoppingCart },
      { id: 'purchase-tax', name: 'Purchase Tax Report', icon: ShoppingBag },
    ],
    contacts: [
      { id: 'contact-list', name: 'Contact List', icon: Users },
      { id: 'customer-statement', name: 'Customer Statement', icon: FileText },
      { id: 'vendor-statement', name: 'Vendor Statement', icon: FileText },
    ],
  };

  const generateReport = async () => {
    if (!selectedReport) return;

    setLoading(true);
    try {
      let data = null;

      switch (selectedReport.id) {
        case 'profit-loss':
          data = await generateProfitLoss();
          break;
        case 'sales-summary':
          data = await generateSalesSummary();
          break;
        case 'sales-by-customer':
          data = await generateSalesByCustomer();
          break;
        case 'invoice-details':
          data = await generateInvoiceDetails();
          break;
        case 'purchase-summary':
          data = await generatePurchaseSummary();
          break;
        case 'purchase-by-vendor':
          data = await generatePurchaseByVendor();
          break;
        case 'bill-details':
          data = await generateBillDetails();
          break;
        case 'customer-balance':
          data = await generateCustomerBalance();
          break;
        case 'vendor-balance':
          data = await generateVendorBalance();
          break;
        case 'aged-receivables':
          data = await generateAgedReceivables();
          break;
        case 'aged-payables':
          data = await generateAgedPayables();
          break;
        case 'tax-summary':
          data = await generateTaxSummary();
          break;
        case 'sales-tax':
          data = await generateSalesTax();
          break;
        case 'purchase-tax':
          data = await generatePurchaseTax();
          break;
        case 'contact-list':
          data = await generateContactList();
          break;
        default:
          data = { message: 'Report generation coming soon' };
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      setReportData({ error: 'Failed to generate report' });
    } finally {
      setLoading(false);
    }
  };

  // Report Generation Functions
  const generateProfitLoss = async () => {
    const invoicesRes = await salesInvoiceAPI.getAll();
    const billsRes = await billAPI.getAll();

    const invoices = invoicesRes.data.filter((inv) => {
      const invDate = new Date(inv.issueDate);
      return invDate >= startDate && invDate <= endDate;
    });

    const bills = billsRes.data.filter((bill) => {
      const billDate = new Date(bill.issueDate);
      return billDate >= startDate && billDate <= endDate;
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalExpenses = bills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      type: 'profit-loss',
      revenue: totalRevenue,
      expenses: totalExpenses,
      netProfit,
      invoiceCount: invoices.length,
      billCount: bills.length,
    };
  };

  const generateSalesSummary = async () => {
    const res = await salesInvoiceAPI.getAll();
    const invoices = res.data.filter((inv) => {
      const invDate = new Date(inv.issueDate);
      return invDate >= startDate && invDate <= endDate;
    });

    const totalSales = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalTax = invoices.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);
    const paidInvoices = invoices.filter((inv) => inv.status === 'Paid');
    const unpaidInvoices = invoices.filter((inv) => inv.status === 'Unpaid');
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

    return {
      type: 'sales-summary',
      totalSales,
      totalTax,
      totalPaid,
      totalUnpaid,
      invoiceCount: invoices.length,
      paidCount: paidInvoices.length,
      unpaidCount: unpaidInvoices.length,
    };
  };

  const generateSalesByCustomer = async () => {
    const res = await salesInvoiceAPI.getAll();
    const invoices = res.data.filter((inv) => {
      const invDate = new Date(inv.issueDate);
      return invDate >= startDate && invDate <= endDate;
    });

    const customerSales = {};
    invoices.forEach((inv) => {
      const customerId = inv.customer?._id || 'Unknown';
      const customerName = inv.customer?.name || 'Unknown Customer';

      if (!customerSales[customerId]) {
        customerSales[customerId] = {
          name: customerName,
          totalSales: 0,
          invoiceCount: 0,
        };
      }

      customerSales[customerId].totalSales += inv.grandTotal || 0;
      customerSales[customerId].invoiceCount += 1;
    });

    return {
      type: 'sales-by-customer',
      customers: Object.values(customerSales).sort((a, b) => b.totalSales - a.totalSales),
    };
  };

  const generateInvoiceDetails = async () => {
    const res = await salesInvoiceAPI.getAll();
    const invoices = res.data.filter((inv) => {
      const invDate = new Date(inv.issueDate);
      return invDate >= startDate && invDate <= endDate;
    });

    return {
      type: 'invoice-details',
      invoices: invoices.map((inv) => ({
        number: inv.invoiceNumber,
        date: new Date(inv.issueDate).toLocaleDateString(),
        customer: inv.customer?.name || 'Unknown',
        status: inv.status,
        subtotal: inv.subtotal || 0,
        tax: inv.totalTax || 0,
        total: inv.grandTotal || 0,
      })),
    };
  };

  const generatePurchaseSummary = async () => {
    const res = await billAPI.getAll();
    const bills = res.data.filter((bill) => {
      const billDate = new Date(bill.issueDate);
      return billDate >= startDate && billDate <= endDate;
    });

    const totalPurchases = bills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
    const totalTax = bills.reduce((sum, bill) => sum + (bill.totalTax || 0), 0);
    const paidBills = bills.filter((bill) => bill.status === 'Paid');
    const unpaidBills = bills.filter((bill) => bill.status === 'Unpaid');
    const totalPaid = paidBills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);
    const totalUnpaid = unpaidBills.reduce((sum, bill) => sum + (bill.grandTotal || 0), 0);

    return {
      type: 'purchase-summary',
      totalPurchases,
      totalTax,
      totalPaid,
      totalUnpaid,
      billCount: bills.length,
      paidCount: paidBills.length,
      unpaidCount: unpaidBills.length,
    };
  };

  const generatePurchaseByVendor = async () => {
    const res = await billAPI.getAll();
    const bills = res.data.filter((bill) => {
      const billDate = new Date(bill.issueDate);
      return billDate >= startDate && billDate <= endDate;
    });

    const vendorPurchases = {};
    bills.forEach((bill) => {
      const vendorId = bill.vendor?._id || 'Unknown';
      const vendorName = bill.vendor?.name || 'Unknown Vendor';

      if (!vendorPurchases[vendorId]) {
        vendorPurchases[vendorId] = {
          name: vendorName,
          totalPurchases: 0,
          billCount: 0,
        };
      }

      vendorPurchases[vendorId].totalPurchases += bill.grandTotal || 0;
      vendorPurchases[vendorId].billCount += 1;
    });

    return {
      type: 'purchase-by-vendor',
      vendors: Object.values(vendorPurchases).sort((a, b) => b.totalPurchases - a.totalPurchases),
    };
  };

  const generateBillDetails = async () => {
    const res = await billAPI.getAll();
    const bills = res.data.filter((bill) => {
      const billDate = new Date(bill.issueDate);
      return billDate >= startDate && billDate <= endDate;
    });

    return {
      type: 'bill-details',
      bills: bills.map((bill) => ({
        number: bill.billNumber,
        date: new Date(bill.issueDate).toLocaleDateString(),
        vendor: bill.vendor?.name || 'Unknown',
        status: bill.status,
        subtotal: bill.subtotal || 0,
        tax: bill.totalTax || 0,
        total: bill.grandTotal || 0,
      })),
    };
  };

  const generateCustomerBalance = async () => {
    const res = await salesInvoiceAPI.getAll();
    const invoices = res.data;

    const customerBalances = {};
    invoices.forEach((inv) => {
      const customerId = inv.customer?._id || 'Unknown';
      const customerName = inv.customer?.name || 'Unknown Customer';

      if (!customerBalances[customerId]) {
        customerBalances[customerId] = {
          name: customerName,
          totalInvoiced: 0,
          totalPaid: 0,
          balance: 0,
        };
      }

      customerBalances[customerId].totalInvoiced += inv.grandTotal || 0;
      if (inv.status === 'Paid') {
        customerBalances[customerId].totalPaid += inv.grandTotal || 0;
      }
    });

    Object.keys(customerBalances).forEach((id) => {
      customerBalances[id].balance =
        customerBalances[id].totalInvoiced - customerBalances[id].totalPaid;
    });

    return {
      type: 'customer-balance',
      customers: Object.values(customerBalances)
        .filter((c) => c.balance > 0)
        .sort((a, b) => b.balance - a.balance),
    };
  };

  const generateVendorBalance = async () => {
    const res = await billAPI.getAll();
    const bills = res.data;

    const vendorBalances = {};
    bills.forEach((bill) => {
      const vendorId = bill.vendor?._id || 'Unknown';
      const vendorName = bill.vendor?.name || 'Unknown Vendor';

      if (!vendorBalances[vendorId]) {
        vendorBalances[vendorId] = {
          name: vendorName,
          totalBilled: 0,
          totalPaid: 0,
          balance: 0,
        };
      }

      vendorBalances[vendorId].totalBilled += bill.grandTotal || 0;
      if (bill.status === 'Paid') {
        vendorBalances[vendorId].totalPaid += bill.grandTotal || 0;
      }
    });

    Object.keys(vendorBalances).forEach((id) => {
      vendorBalances[id].balance = vendorBalances[id].totalBilled - vendorBalances[id].totalPaid;
    });

    return {
      type: 'vendor-balance',
      vendors: Object.values(vendorBalances)
        .filter((v) => v.balance > 0)
        .sort((a, b) => b.balance - a.balance),
    };
  };

  const generateAgedReceivables = async () => {
    const res = await salesInvoiceAPI.getAll();
    const unpaidInvoices = res.data.filter((inv) => inv.status === 'Unpaid');

    const aging = {
      current: [],
      days30: [],
      days60: [],
      days90: [],
      days90Plus: [],
    };

    const today = new Date();
    unpaidInvoices.forEach((inv) => {
      const dueDate = new Date(inv.dueDate);
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      const invData = {
        customer: inv.customer?.name || 'Unknown',
        invoiceNumber: inv.invoiceNumber,
        amount: inv.grandTotal || 0,
        daysOverdue,
      };

      if (daysOverdue <= 0) {
        aging.current.push(invData);
      } else if (daysOverdue <= 30) {
        aging.days30.push(invData);
      } else if (daysOverdue <= 60) {
        aging.days60.push(invData);
      } else if (daysOverdue <= 90) {
        aging.days90.push(invData);
      } else {
        aging.days90Plus.push(invData);
      }
    });

    return {
      type: 'aged-receivables',
      aging,
      totals: {
        current: aging.current.reduce((sum, inv) => sum + inv.amount, 0),
        days30: aging.days30.reduce((sum, inv) => sum + inv.amount, 0),
        days60: aging.days60.reduce((sum, inv) => sum + inv.amount, 0),
        days90: aging.days90.reduce((sum, inv) => sum + inv.amount, 0),
        days90Plus: aging.days90Plus.reduce((sum, inv) => sum + inv.amount, 0),
      },
    };
  };

  const generateAgedPayables = async () => {
    const res = await billAPI.getAll();
    const unpaidBills = res.data.filter((bill) => bill.status === 'Unpaid');

    const aging = {
      current: [],
      days30: [],
      days60: [],
      days90: [],
      days90Plus: [],
    };

    const today = new Date();
    unpaidBills.forEach((bill) => {
      const dueDate = new Date(bill.dueDate);
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));

      const billData = {
        vendor: bill.vendor?.name || 'Unknown',
        billNumber: bill.billNumber,
        amount: bill.grandTotal || 0,
        daysOverdue,
      };

      if (daysOverdue <= 0) {
        aging.current.push(billData);
      } else if (daysOverdue <= 30) {
        aging.days30.push(billData);
      } else if (daysOverdue <= 60) {
        aging.days60.push(billData);
      } else if (daysOverdue <= 90) {
        aging.days90.push(billData);
      } else {
        aging.days90Plus.push(billData);
      }
    });

    return {
      type: 'aged-payables',
      aging,
      totals: {
        current: aging.current.reduce((sum, bill) => sum + bill.amount, 0),
        days30: aging.days30.reduce((sum, bill) => sum + bill.amount, 0),
        days60: aging.days60.reduce((sum, bill) => sum + bill.amount, 0),
        days90: aging.days90.reduce((sum, bill) => sum + bill.amount, 0),
        days90Plus: aging.days90Plus.reduce((sum, bill) => sum + bill.amount, 0),
      },
    };
  };

  const generateTaxSummary = async () => {
    const invoicesRes = await salesInvoiceAPI.getAll();
    const billsRes = await billAPI.getAll();

    const invoices = invoicesRes.data.filter((inv) => {
      const invDate = new Date(inv.issueDate);
      return invDate >= startDate && invDate <= endDate;
    });

    const bills = billsRes.data.filter((bill) => {
      const billDate = new Date(bill.issueDate);
      return billDate >= startDate && billDate <= endDate;
    });

    const salesTax = invoices.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);
    const purchaseTax = bills.reduce((sum, bill) => sum + (bill.totalTax || 0), 0);
    const netTax = salesTax - purchaseTax;

    return {
      type: 'tax-summary',
      salesTax,
      purchaseTax,
      netTax,
      salesCount: invoices.length,
      purchaseCount: bills.length,
    };
  };

  const generateSalesTax = async () => {
    const res = await salesInvoiceAPI.getAll();
    const invoices = res.data.filter((inv) => {
      const invDate = new Date(inv.issueDate);
      return invDate >= startDate && invDate <= endDate;
    });

    const taxDetails = invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      customer: inv.customer?.name || 'Unknown',
      date: new Date(inv.issueDate).toLocaleDateString(),
      subtotal: inv.subtotal || 0,
      tax: inv.totalTax || 0,
      total: inv.grandTotal || 0,
    }));

    const totalTax = invoices.reduce((sum, inv) => sum + (inv.totalTax || 0), 0);

    return {
      type: 'sales-tax',
      taxDetails,
      totalTax,
    };
  };

  const generatePurchaseTax = async () => {
    const res = await billAPI.getAll();
    const bills = res.data.filter((bill) => {
      const billDate = new Date(bill.issueDate);
      return billDate >= startDate && billDate <= endDate;
    });

    const taxDetails = bills.map((bill) => ({
      billNumber: bill.billNumber,
      vendor: bill.vendor?.name || 'Unknown',
      date: new Date(bill.issueDate).toLocaleDateString(),
      subtotal: bill.subtotal || 0,
      tax: bill.totalTax || 0,
      total: bill.grandTotal || 0,
    }));

    const totalTax = bills.reduce((sum, bill) => sum + (bill.totalTax || 0), 0);

    return {
      type: 'purchase-tax',
      taxDetails,
      totalTax,
    };
  };

  const generateContactList = async () => {
    const res = await contactAPI.getAll();
    const contacts = res.data;

    return {
      type: 'contact-list',
      contacts: contacts.map((c) => ({
        name: c.name,
        type: c.type,
        email: c.email,
        phone: c.phone,
        company: c.company,
      })),
    };
  };

  useEffect(() => {
    if (selectedReport) {
      generateReport();
    }
  }, [selectedReport, startDate, endDate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderReportContent = () => {
    if (!reportData) {
      return (
        <div className="text-center py-12 text-gray-500">
          Select a report from the left sidebar to get started
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating report...</p>
        </div>
      );
    }

    if (reportData.error) {
      return (
        <div className="text-center py-12 text-red-600">
          <p>{reportData.error}</p>
        </div>
      );
    }

    switch (reportData.type) {
      case 'profit-loss':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.revenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {reportData.invoiceCount} invoices
                </p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(reportData.expenses)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{reportData.billCount} bills</p>
              </div>
              <div
                className={`${
                  reportData.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
                } p-6 rounded-lg`}
              >
                <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                <p
                  className={`text-2xl font-bold ${
                    reportData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(reportData.netProfit)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {reportData.netProfit >= 0 ? 'Profit' : 'Loss'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'sales-summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(reportData.totalSales)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {reportData.invoiceCount} invoices
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Tax Collected</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.totalTax)}
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.totalPaid)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{reportData.paidCount} invoices</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Unpaid</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(reportData.totalUnpaid)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{reportData.unpaidCount} invoices</p>
              </div>
            </div>
          </div>
        );

      case 'sales-by-customer':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.customers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      {formatCurrency(customer.totalSales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.invoiceCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'invoice-details':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.invoices.map((inv, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {inv.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inv.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inv.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          inv.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(inv.tax)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                      {formatCurrency(inv.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'purchase-summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(reportData.totalPurchases)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{reportData.billCount} bills</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Tax Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.totalTax)}
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(reportData.totalPaid)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{reportData.paidCount} bills</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Unpaid</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(reportData.totalUnpaid)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{reportData.unpaidCount} bills</p>
              </div>
            </div>
          </div>
        );

      case 'purchase-by-vendor':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Purchases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.vendors.map((vendor, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                      {formatCurrency(vendor.totalPurchases)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.billCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'bill-details':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.bills.map((bill, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {bill.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {bill.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          bill.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(bill.subtotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(bill.tax)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                      {formatCurrency(bill.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'customer-balance':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Invoiced
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance Due
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.customers.map((customer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(customer.totalInvoiced)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(customer.totalPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                      {formatCurrency(customer.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'vendor-balance':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Billed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance Due
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.vendors.map((vendor, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(vendor.totalBilled)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {formatCurrency(vendor.totalPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                      {formatCurrency(vendor.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'aged-receivables':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Current</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(reportData.totals.current)}
                </p>
                <p className="text-xs text-gray-500">{reportData.aging.current.length} invoices</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">1-30 Days</p>
                <p className="text-lg font-bold text-yellow-600">
                  {formatCurrency(reportData.totals.days30)}
                </p>
                <p className="text-xs text-gray-500">{reportData.aging.days30.length} invoices</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">31-60 Days</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(reportData.totals.days60)}
                </p>
                <p className="text-xs text-gray-500">{reportData.aging.days60.length} invoices</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">61-90 Days</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(reportData.totals.days90)}
                </p>
                <p className="text-xs text-gray-500">{reportData.aging.days90.length} invoices</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">90+ Days</p>
                <p className="text-lg font-bold text-red-700">
                  {formatCurrency(reportData.totals.days90Plus)}
                </p>
                <p className="text-xs text-gray-500">
                  {reportData.aging.days90Plus.length} invoices
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Overdue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    ...reportData.aging.current,
                    ...reportData.aging.days30,
                    ...reportData.aging.days60,
                    ...reportData.aging.days90,
                    ...reportData.aging.days90Plus,
                  ].map((inv, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inv.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            inv.daysOverdue <= 0
                              ? 'bg-green-100 text-green-800'
                              : inv.daysOverdue <= 30
                              ? 'bg-yellow-100 text-yellow-800'
                              : inv.daysOverdue <= 60
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {inv.daysOverdue <= 0 ? 'Current' : `${inv.daysOverdue} days`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'aged-payables':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Current</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(reportData.totals.current)}
                </p>
                <p className="text-xs text-gray-500">{reportData.aging.current.length} bills</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">1-30 Days</p>
                <p className="text-lg font-bold text-yellow-600">
                  {formatCurrency(reportData.totals.days30)}
                </p>
                <p className="text-xs text-gray-500">{reportData.aging.days30.length} bills</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">31-60 Days</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(reportData.totals.days60)}
                </p>
                <p className="text-xs text-gray-500">{reportData.aging.days60.length} bills</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">61-90 Days</p>
                <p className="text-lg font-bold text-red-600">
                  {formatCurrency(reportData.totals.days90)}
                </p>
                <p className="text-xs text-gray-500">{reportData.aging.days90.length} bills</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">90+ Days</p>
                <p className="text-lg font-bold text-red-700">
                  {formatCurrency(reportData.totals.days90Plus)}
                </p>
                <p className="text-xs text-gray-500">{reportData.aging.days90Plus.length} bills</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Overdue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    ...reportData.aging.current,
                    ...reportData.aging.days30,
                    ...reportData.aging.days60,
                    ...reportData.aging.days90,
                    ...reportData.aging.days90Plus,
                  ].map((bill, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.vendor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {bill.billNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                        {formatCurrency(bill.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            bill.daysOverdue <= 0
                              ? 'bg-green-100 text-green-800'
                              : bill.daysOverdue <= 30
                              ? 'bg-yellow-100 text-yellow-800'
                              : bill.daysOverdue <= 60
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {bill.daysOverdue <= 0 ? 'Current' : `${bill.daysOverdue} days`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'tax-summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sales Tax Collected</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(reportData.salesTax)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{reportData.salesCount} invoices</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Purchase Tax Paid</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(reportData.purchaseTax)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{reportData.purchaseCount} bills</p>
              </div>
              <div
                className={`${
                  reportData.netTax >= 0 ? 'bg-green-50' : 'bg-red-50'
                } p-6 rounded-lg`}
              >
                <p className="text-sm text-gray-600 mb-1">Net Tax Liability</p>
                <p
                  className={`text-2xl font-bold ${
                    reportData.netTax >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(reportData.netTax)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {reportData.netTax >= 0 ? 'Owed to Tax Authority' : 'Tax Refund Due'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'sales-tax':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Sales Tax Collected</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(reportData.totalTax)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.taxDetails.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.invoiceNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {formatCurrency(item.tax)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'purchase-tax':
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 p-6 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Purchase Tax Paid</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(reportData.totalTax)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.taxDetails.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.billNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.vendor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                        {formatCurrency(item.tax)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'contact-list':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.contacts.map((contact, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {contact.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          contact.type === 'customer'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {contact.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.company || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <p>{reportData.message || 'This report is coming soon'}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Report Categories & Reports */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-600 mt-1">Analyze your business data</p>
        </div>

        <div className="p-4 space-y-6">
          {reportCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <div key={category.id}>
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <CategoryIcon size={20} />
                  <span className="font-medium">{category.name}</span>
                </button>

                {selectedCategory === category.id && (
                  <div className="mt-2 ml-4 space-y-1">
                    {reports[category.id].map((report) => {
                      const ReportIcon = report.icon;
                      return (
                        <button
                          key={report.id}
                          onClick={() => setSelectedReport(report)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedReport?.id === report.id
                              ? 'bg-emerald-100 text-emerald-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <ReportIcon size={16} />
                          <span>{report.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Content - Report Display */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {selectedReport && (
            <>
              {/* Report Header */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      {React.createElement(selectedReport.icon, {
                        className: 'w-6 h-6 text-emerald-600',
                      })}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {selectedReport.name}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    <Download size={18} />
                    <span>Export</span>
                  </button>
                </div>

                {/* Date Range Selector */}
                <div className="flex items-center space-x-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Calendar size={18} className="text-gray-500" />
                    <span className="text-sm text-gray-600 font-medium">Date Range:</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      dateFormat="MMM dd, yyyy"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="text-gray-500">to</span>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      dateFormat="MMM dd, yyyy"
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="bg-white rounded-lg shadow-sm p-6">{renderReportContent()}</div>
            </>
          )}

          {!selectedReport && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Select a Report to Get Started
              </h3>
              <p className="text-gray-500">
                Choose a report category and report type from the left sidebar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
