// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';

// Import pages
import Dashboard from './pages/Dashboard/Dashboard';
import SalesInvoice from './pages/Sales/SalesInvoice';
import Bills from './pages/Purchase/Bills';
import Contacts from './pages/Contacts/Contacts';
import ChartOfAccounts from './pages/Accounts/ChartOfAccounts';
import BankAccount from './pages/Accounts/BankAccount';
import BankAccountTypes from './pages/Accounts/BankAccountTypes';
import AccountType from './pages/Accounts/AccountType';
import TaxTypes from './pages/Accounts/TaxTypes';
import Projects from './pages/Projects/Projects';

import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales/invoices" element={<SalesInvoice />} />
          <Route path="/purchase/bills" element={<Bills />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/accounts/chart-of-accounts" element={<ChartOfAccounts />} />
          <Route path="/accounts/bank-accounts" element={<BankAccount />} />
          <Route path="/accounts/bank-account-types" element={<BankAccountTypes />} />
          <Route path="/accounts/account-types" element={<AccountType />} />
          <Route path="/accounts/tax-types" element={<TaxTypes />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;