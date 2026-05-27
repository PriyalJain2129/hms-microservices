import React, { useState, useEffect } from 'react';
import { Plus, Trash, CalendarRange, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getAll as getAllAppointments, 
  create as createAppointment, 
  updateStatus, 
  remove as removeAppointment 
} from '../api/appointmentApi';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal and Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    notes: '',
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getAllAppointments();
      setAppointments(res.data || []);
    } catch (error) {
      toast.error('Failed to load appointments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async () => {
    const { patientId, doctorId, date, time, notes } = formData;
    if (!patientId || !doctorId || !date || !time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Combine date and time to ISO format (e.g. YYYY-MM-DDTHH:MM:SS)
      const combinedDateTime = `${date}T${time}:00`;
      
      const payload = {
        patientId: parseInt(patientId, 10),
        doctorId: parseInt(doctorId, 10),
        appointmentDate: combinedDateTime,
        notes: notes,
      };

      await createAppointment(payload);
      toast.success('Appointment scheduled successfully!');
      setIsModalOpen(false);
      fetchAppointments();
    } catch (error) {
      const errorMsg = error.response?.data || 'Failed to book appointment. Make sure IDs are correct.';
      toast.error(typeof errorMsg === 'string' ? errorMsg : 'Error booking appointment');
      console.error(error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus(id, newStatus);
      toast.success(`Appointment status updated to ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to update appointment status.');
      console.error(error);
    }
  };

  const handleDeleteTrigger = (id) => {
    setAppointmentToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appointmentToDelete) return;
    try {
      await removeAppointment(appointmentToDelete);
      toast.success('Appointment successfully deleted.');
      fetchAppointments();
    } catch (error) {
      toast.error('Could not delete appointment record.');
      console.error(error);
    } finally {
      setAppointmentToDelete(null);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((app) => {
    // 1. Status Filter
    if (activeTab !== 'ALL' && app.status !== activeTab) {
      return false;
    }
    // 2. Date Filter
    if (dateFilter) {
      const appDateStr = app.appointmentDate ? app.appointmentDate.split('T')[0] : '';
      if (appDateStr !== dateFilter) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Appointment Bookings</h1>
          <p className="text-sm text-slate-400">Schedule, filter, monitor and modify medical appointments</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition duration-150 shadow-lg shadow-blue-600/10 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Navigation Tabs and Date Filter */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/50 p-1 border border-slate-700 rounded-xl w-full md:w-auto">
          {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition ${
                activeTab === tab 
                  ? 'bg-blue-600 text-white shadow shadow-blue-600/10' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        {/* Date Filter Input */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase shrink-0">Filter Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 text-sm transition"
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1 rounded hover:bg-red-500/10 transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700">
          <LoadingSpinner />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="h-64 flex flex-col justify-center items-center text-slate-500 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
          <CalendarRange className="w-12 h-12 text-slate-650 mb-3" />
          <p className="text-lg font-medium text-slate-400">No appointments scheduled</p>
          <p className="text-sm text-slate-450 mt-1">Try changing your filters or schedule a new appointment.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700 text-xs text-slate-455 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Doctor Name</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-750/30 transition duration-150">
                    <td className="px-6 py-4 font-semibold text-slate-450">{app.id}</td>
                    <td className="px-6 py-4 text-white font-semibold">{app.patientName}</td>
                    <td className="px-6 py-4 text-white font-semibold">{app.doctorName}</td>
                    <td className="px-6 py-4 text-slate-300 font-semibold">{formatDateTime(app.appointmentDate)}</td>
                    <td className="px-6 py-4">
                      <Badge text={app.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate" title={app.notes}>
                      {app.notes || 'No description'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {/* Status update select */}
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="px-2.5 py-1 bg-slate-700 border border-slate-650 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-blue-500 transition cursor-pointer font-medium"
                        >
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>

                        {/* Delete trigger */}
                        <button
                          onClick={() => handleDeleteTrigger(app.id)}
                          title="Delete Booking"
                          className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule New Appointment"
        onSubmit={handleFormSubmit}
        submitLabel="Confirm Booking"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Patient ID */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Patient ID</label>
            <input
              type="number"
              name="patientId"
              value={formData.patientId}
              onChange={handleFormChange}
              placeholder="e.g. 1"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Doctor ID */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Doctor ID</label>
            <input
              type="number"
              name="doctorId"
              value={formData.doctorId}
              onChange={handleFormChange}
              placeholder="e.g. 2"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Appointment Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Time */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Time (24h)</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400">Appointment Notes / Symptoms</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleFormChange}
              placeholder="Provide a brief explanation of the symptoms or consulting notes..."
              rows="3"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
            ></textarea>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialogue */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        message="Do you really want to delete this appointment booking? The action is permanent."
      />
    </div>
  );
};

export default Appointments;
