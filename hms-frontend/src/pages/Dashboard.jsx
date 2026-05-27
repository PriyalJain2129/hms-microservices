import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import { getCount as getPatientCount } from '../api/patientApi';
import { getCount as getDoctorCount } from '../api/doctorApi';
import { getTodayCount, getAll as getAllAppointments } from '../api/appointmentApi';
import { getPendingCount } from '../api/billingApi';
import { getLowStock } from '../api/pharmacyApi';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    todayAppointments: 0,
    pendingBills: 0,
  });
  const [appointmentsByStatus, setAppointmentsByStatus] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for Patient Registrations last 7 days
  const patientRegistrationData = [
    { name: 'Mon', registrations: 4 },
    { name: 'Tue', registrations: 8 },
    { name: 'Wed', registrations: 5 },
    { name: 'Thu', registrations: 12 },
    { name: 'Fri', registrations: 9 },
    { name: 'Sat', registrations: 6 },
    { name: 'Sun', registrations: 3 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch counts in parallel
        const [
          patientsRes,
          doctorsRes,
          todayCountRes,
          pendingCountRes,
          appointmentsRes,
          lowStockRes
        ] = await Promise.all([
          getPatientCount().catch(() => ({ data: 0 })),
          getDoctorCount().catch(() => ({ data: 0 })),
          getTodayCount().catch(() => ({ data: 0 })),
          getPendingCount().catch(() => ({ data: 0 })),
          getAllAppointments().catch(() => ({ data: [] })),
          getLowStock().catch(() => ({ data: [] }))
        ]);

        // Set stats counts
        setStats({
          patients: patientsRes.data || 0,
          doctors: doctorsRes.data || 0,
          todayAppointments: todayCountRes.data || 0,
          pendingBills: pendingCountRes.data || 0,
        });

        // Group appointments by status for the bar chart
        const allAppointments = appointmentsRes.data || [];
        const statusGroups = allAppointments.reduce((acc, curr) => {
          const status = curr.status || 'SCHEDULED';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, { SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0 });

        const barChartData = [
          { name: 'Scheduled', count: statusGroups.SCHEDULED, color: '#3B82F6' },
          { name: 'Completed', count: statusGroups.COMPLETED, color: '#10B981' },
          { name: 'Cancelled', count: statusGroups.CANCELLED, color: '#EF4444' },
        ];
        setAppointmentsByStatus(barChartData);

        // Sort & get recent 5 appointments
        const sortedAppointments = [...allAppointments]
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 5);
        setRecentAppointments(sortedAppointments);

        // Set low stock medicines
        setLowStockMeds(lowStockRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="h-[75vh] flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Patients" 
          value={stats.patients} 
          icon={Users} 
          colorClass="bg-blue-500/10 text-blue-500 border border-blue-500/20" 
        />
        <StatCard 
          title="Total Doctors" 
          value={stats.doctors} 
          icon={Stethoscope} 
          colorClass="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
        />
        <StatCard 
          title="Today's Appointments" 
          value={stats.todayAppointments} 
          icon={Calendar} 
          colorClass="bg-amber-500/10 text-amber-500 border border-amber-500/20" 
        />
        <StatCard 
          title="Pending Bills" 
          value={stats.pendingBills} 
          icon={CreditCard} 
          colorClass="bg-red-500/10 text-red-500 border border-red-500/20" 
        />
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Patient Registrations Last 7 Days</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientRegistrationData} margin={{ left: -20, top: 10, right: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }} 
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="registrations" 
                  stroke="#3B82F6" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Appointments by Status</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentsByStatus} margin={{ left: -20, top: 10, right: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {appointmentsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom panels: Recent Appointments + Low Stock Medicines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments (2 cols wide) */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Recent Appointments</h3>
            <span className="text-xs font-semibold bg-slate-700 px-3 py-1.5 rounded-lg text-slate-350">Last 5 bookins</span>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="h-48 flex flex-col justify-center items-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
              <Clock className="w-8 h-8 mb-2" />
              <p>No appointments scheduled yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Patient Name</th>
                    <th className="pb-3">Doctor Name</th>
                    <th className="pb-3">Appointment Date</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60 text-sm">
                  {recentAppointments.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-750/30 transition">
                      <td className="py-3.5 font-medium text-white">{app.patientName}</td>
                      <td className="py-3.5 text-slate-300">{app.doctorName}</td>
                      <td className="py-3.5 text-slate-400">{formatDateTime(app.appointmentDate)}</td>
                      <td className="py-3.5 text-right">
                        <Badge text={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Medicines (1 col wide) */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-white">Low Stock Alert</h3>
          </div>

          {lowStockMeds.length === 0 ? (
            <div className="h-48 flex flex-col justify-center items-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
              <p className="text-emerald-500 font-medium">✓ All stock levels adequate</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2">
              {lowStockMeds.map((med) => (
                <div key={med.id} className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-750 rounded-xl hover:border-slate-700 transition">
                  <div className="min-w-0 pr-3">
                    <p className="text-sm font-semibold text-white truncate">{med.name}</p>
                    <p className="text-xs text-slate-400 truncate">{med.manufacturer}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${med.stock < 5 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                      {med.stock} left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
