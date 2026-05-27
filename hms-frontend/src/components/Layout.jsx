import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar (fixed width 260px) */}
      <div className="w-[260px] shrink-0">
        <Sidebar />
      </div>

      {/* Right side container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-900/60 text-slate-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
