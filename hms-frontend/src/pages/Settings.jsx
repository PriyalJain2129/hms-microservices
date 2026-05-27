import React, { useState } from 'react';
import { User, Lock, Info, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'about'

  // Profile fields
  const [profileData, setProfileData] = useState({
    username: user?.username || 'Admin User',
    email: user?.email || 'admin@hms.com',
  });

  // Password fields
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    toast.success('Profile details updated successfully! (Sandbox mock)');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    toast.success('Security settings updated successfully! (Sandbox mock)');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const servicePorts = [
    { name: 'API Gateway (Router)', port: '8080' },
    { name: 'Authentication Service', port: '8081' },
    { name: 'Patient Service', port: '8082' },
    { name: 'Doctor Service', port: '8083' },
    { name: 'Appointment Service', port: '8084' },
    { name: 'Billing Service', port: '8085' },
    { name: 'Pharmacy Service', port: '8086' },
    { name: 'Eureka Service Discovery', port: '8761' },
  ];

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-sm text-slate-400">Configure profile, security, and view microservice environment information</p>
      </div>

      {/* Tabs list */}
      <div className="flex bg-slate-800 border-b border-slate-700 p-1.5 rounded-xl gap-2 w-full sm:w-auto self-start">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg uppercase tracking-wider transition ${
            activeTab === 'profile' 
              ? 'bg-blue-600 text-white shadow shadow-blue-600/10' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg uppercase tracking-wider transition ${
            activeTab === 'security' 
              ? 'bg-blue-600 text-white shadow shadow-blue-600/10' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Security</span>
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-lg uppercase tracking-wider transition ${
            activeTab === 'about' 
              ? 'bg-blue-600 text-white shadow shadow-blue-600/10' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-lg">
        {/* Panel 1: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Edit Profile</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* Panel 2: Security */}
        {activeTab === 'security' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Update Password</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Password</span>
              </button>
            </div>
          </form>
        )}

        {/* Panel 3: About */}
        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">MediCare Hospital Management System</h3>
              <p className="text-xs font-semibold text-slate-450 uppercase tracking-widest">Version 1.0.0 (Production Release)</p>
              <p className="text-sm text-slate-300 mt-3 leading-relaxed">
                Medicare HMS is a production-ready, highly-scalable Hospital Management System built from scratch. It leverages a robust microservices architecture written in Java/Spring Boot and Spring Cloud, orchestrated using Docker containers, and connected to a high-performance React client.
              </p>
            </div>

            {/* Tech Stack Info */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-blue-400">Technical Stack Architecture</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-slate-900/60 border border-slate-750 rounded-xl">
                  <p className="font-semibold text-white">Backend Stack</p>
                  <ul className="list-disc list-inside mt-2 text-xs text-slate-400 space-y-1.5">
                    <li>Java 23 / Spring Boot 3.2.5</li>
                    <li>Spring Cloud (Eureka, Gateway, OpenFeign)</li>
                    <li>Spring Security / JJWT authentication</li>
                    <li>JPA Hibernate / MySQL Datastores</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-900/60 border border-slate-750 rounded-xl">
                  <p className="font-semibold text-white">Frontend Stack</p>
                  <ul className="list-disc list-inside mt-2 text-xs text-slate-400 space-y-1.5">
                    <li>React (Vite) / React Router</li>
                    <li>Tailwind CSS v4 (Harmony Palette)</li>
                    <li>Axios (JWT auto injection / 401 interceptors)</li>
                    <li>Recharts (Dashboard analytics)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Service Port Reference Table */}
            <div>
              <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider text-blue-400">Microservice Port Directory</h4>
              <div className="bg-slate-900/40 border border-slate-750 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-750 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="px-4 py-3">Service Name</th>
                      <th className="px-4 py-3 text-right">Service Host Port</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {servicePorts.map((service) => (
                      <tr key={service.port}>
                        <td className="px-4 py-2.5 text-slate-200 font-medium">{service.name}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-semibold text-blue-400">{service.port}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
