// src/components/Layout/Sidebar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Users,
  Wallet,
  FolderKanban,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState(null);

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
    },
    {
      id: 'sales',
      title: 'Sales',
      icon: ShoppingCart,
      hasDropdown: true,
      subItems: [
        { id: 'sales-invoices', title: 'Sales Invoice', path: '/sales/invoices' },
      ],
    },
    {
      id: 'purchase',
      title: 'Purchase',
      icon: ShoppingBag,
      hasDropdown: true,
      subItems: [
        { id: 'bills', title: 'Bills', path: '/purchase/bills' },
      ],
    },
    {
      id: 'contacts',
      title: 'Contacts',
      icon: Users,
      path: '/contacts',
    },
    {
      id: 'accounts',
      title: 'Accounts',
      icon: Wallet,
      hasDropdown: true,
      subItems: [
        { id: 'chart-of-accounts', title: 'Chart of Accounts', path: '/accounts/chart-of-accounts' },
        { id: 'bank-accounts', title: 'Bank Accounts', path: '/accounts/bank-accounts' },
        { id: 'bank-account-types', title: 'Bank Account Types', path: '/accounts/bank-account-types' },
        { id: 'account-types', title: 'Account Types', path: '/accounts/account-types' },
        { id: 'tax-types', title: 'Tax Types', path: '/accounts/tax-types' },
      ],
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: FolderKanban,
      path: '/projects',
    },
  ];

  const toggleDropdown = (itemId) => {
    if (openDropdown === itemId) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(itemId);
    }
    setActiveItem(itemId);
  };

  const handleMenuClick = (itemId) => {
    setActiveItem(itemId);
    setActiveSubItem(null);
  };

  const handleSubItemClick = (parentId, subItemId) => {
    setActiveItem(parentId);
    setActiveSubItem(subItemId);
  };

  const isParentActive = (itemId) => {
    return activeItem === itemId;
  };

  const isSubItemActive = (subItemId) => {
    return activeSubItem === subItemId;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Qonseio</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isDropdownOpen = openDropdown === item.id;
          const isActive = isParentActive(item.id);

          return (
            <div key={item.id} className="nav-item-wrapper">
              {item.hasDropdown ? (
                <>
                  <div
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => toggleDropdown(item.id)}
                  >
                    <div className="nav-item-content">
                      <Icon size={20} />
                      <span>{item.title}</span>
                    </div>
                    {isDropdownOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>

                  {/* ✅ Add animation wrapper */}
                  {isDropdownOpen && (
                    <div className="dropdown-menu">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.id}
                          to={subItem.path}
                          className={`dropdown-item ${
                            isSubItemActive(subItem.id) ? 'active' : ''
                          }`}
                          onClick={() => handleSubItemClick(item.id, subItem.id)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <div className="nav-item-content">
                    <Icon size={20} />
                    <span>{item.title}</span>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;