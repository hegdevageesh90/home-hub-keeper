
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Settings, 
  Calendar, 
  FileText, 
  Clock,
  Menu,
  X,
  Wrench,
  Bell
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { 
      name: 'Dashboard', 
      icon: <Home size={20} />, 
      path: '/',
    },
    { 
      name: 'Appliances', 
      icon: <Wrench size={20} />, 
      path: '/appliances',
    },
    { 
      name: 'Service Records', 
      icon: <FileText size={20} />, 
      path: '/service-records',
    },
    { 
      name: 'Reminders', 
      icon: <Bell size={20} />, 
      path: '/reminders',
    },
    { 
      name: 'Calendar', 
      icon: <Calendar size={20} />, 
      path: '/calendar',
    },
    { 
      name: 'Settings', 
      icon: <Settings size={20} />, 
      path: '/settings',
    },
  ];

  return (
    <div 
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col
                ${collapsed ? 'w-16' : 'w-64'}`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-maintenance-600" />
            <span className="font-bold text-gray-800">HomeCare</span>
          </div>
        )}
        <button 
          className="p-1 rounded hover:bg-gray-100"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>
      <nav className="flex-1 pt-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-maintenance-50 hover:text-maintenance-700 transition-colors
                          ${location.pathname === item.path ? 'bg-maintenance-50 text-maintenance-700 border-r-4 border-maintenance-500' : ''}`}
              >
                {item.icon}
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500">
            <p>© 2025 HomeCare</p>
            <p>Version 1.0.0</p>
          </div>
        )}
      </div>
    </div>
  );
};
