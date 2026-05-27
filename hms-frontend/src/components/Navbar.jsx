import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageTitle = (path) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard';
      case '/patients':
        return 'Patients';
      case '/doctors':
        return 'Doctors';
      case '/appointments':
        return 'Appointments';
      case '/billing':
        return 'Billing & Invoices';
      case '/pharmacy':
        return 'Pharmacy Inventory';
      case '/settings':
        return 'Settings';
      default:
        return 'MediCare HMS';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
      {/* Page Title */}
      <h2 className="text-xl font-bold text-white">{getPageTitle(location.pathname)}</h2>

      {/* Right Menu */}
      <div className="flex items-center gap-4">
        {/* Notifications Button */}
        <button 
          title="Notifications"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-slate-900"></span>
        </button>

        {/* User initials avatar */}
        {user && (
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/10">
              {getInitials(user.username)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-white leading-tight">{user.username}</p>
              <p className="text-xs text-slate-400 font-medium leading-none mt-0.5">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
