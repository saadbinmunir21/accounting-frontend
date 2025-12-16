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
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

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
        { id: 'quotations', title: 'Quotations', path: '/sales/quotations' },
      ],
    },
    {
      id: 'purchase',
      title: 'Purchase',
      icon: ShoppingBag,
      hasDropdown: true,
      subItems: [
        { id: 'bills', title: 'Bills', path: '/purchase/bills' },
        { id: 'purchase-orders', title: 'Purchase Orders', path: '/purchase/orders' },
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
    {
      id: 'reports',
      title: 'Reports',
      icon: FileText,
      path: '/reports',
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
    <div className="w-[260px] h-screen bg-white shadow-[2px_0_8px_rgba(0,0,0,0.05)] flex flex-col fixed left-0 top-0 overflow-y-auto z-[100] scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-gray-100 hover:scrollbar-thumb-slate-500">
      {/* Sidebar Header */}
      <div className="px-5 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 m-0">Qonseio</h2>
      </div>

      {/* Sidebar Navigation */}
      <nav className="p-3 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isDropdownOpen = openDropdown === item.id;
          const isActive = isParentActive(item.id);

          return (
            <div key={item.id} className="mb-1">
              {item.hasDropdown ? (
                <>
                  {/* Dropdown Menu Item */}
                  <div
                    className={`flex items-center justify-between px-4 py-3 rounded-[10px] cursor-pointer transition-all duration-200 text-sm font-medium
                      ${isActive 
                        ? 'bg-emerald-500 text-white' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                      }`}
                    onClick={() => toggleDropdown(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span>{item.title}</span>
                    </div>
                    <div className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-0' : ''}`}>
                      {isDropdownOpen ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  </div>

                  {/* Dropdown Submenu with Animation */}
                  {isDropdownOpen && (
                    <div className="mt-1 ml-3 pl-7 border-l-2 border-gray-200 animate-slideDown">
                      {item.subItems.map((subItem, index) => (
                        <Link
                          key={subItem.id}
                          to={subItem.path}
                          className={`block px-4 py-2.5 rounded-lg text-sm font-normal transition-all duration-200 mb-0.5
                            ${isSubItemActive(subItem.id)
                              ? 'bg-emerald-500 text-white font-medium'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            } animate-fadeIn`}
                          style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'backwards' }}
                          onClick={() => handleSubItemClick(item.id, subItem.id)}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                // Regular Menu Item
                <Link
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-[10px] cursor-pointer transition-all duration-200 text-sm font-medium no-underline
                    ${isActive 
                      ? 'bg-emerald-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <div className="flex items-center gap-3">
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