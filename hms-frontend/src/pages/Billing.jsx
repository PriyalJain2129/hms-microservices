import React, { useState, useEffect } from 'react';
import { Plus, Trash, Check, CreditCard, Coins, CalendarCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getAll as getAllInvoices, 
  create as createInvoice, 
  markPaid, 
  remove as removeInvoice,
  getTotalRevenue,
  getPendingCount
} from '../api/billingApi';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [revenue, setRevenue] = useState(0.0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal and Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    patientId: '',
    appointmentId: '',
    patientName: '',
    consultationFee: 0.0,
    medicineCost: 0.0,
    otherCharges: 0.0,
    paymentStatus: 'PENDING',
  });

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, revenueRes, pendingCountRes] = await Promise.all([
        getAllInvoices(),
        getTotalRevenue().catch(() => ({ data: 0.0 })),
        getPendingCount().catch(() => ({ data: 0 }))
      ]);

      setInvoices(invoicesRes.data || []);
      setRevenue(revenueRes.data || 0.0);
      setPendingCount(pendingCountRes.data || 0);
    } catch (error) {
      toast.error('Failed to load billing metrics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      patientId: '',
      appointmentId: '',
      patientName: '',
      consultationFee: '',
      medicineCost: '',
      otherCharges: '',
      paymentStatus: 'PENDING',
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
    const { patientId, patientName, consultationFee, medicineCost, otherCharges } = formData;
    if (!patientId || !patientName) {
      toast.error('Patient ID and Patient Name are required');
      return;
    }

    try {
      const payload = {
        patientId: parseInt(patientId, 10),
        appointmentId: formData.appointmentId ? parseInt(formData.appointmentId, 10) : null,
        patientName: patientName,
        consultationFee: parseFloat(consultationFee) || 0.0,
        medicineCost: parseFloat(medicineCost) || 0.0,
        otherCharges: parseFloat(otherCharges) || 0.0,
        paymentStatus: formData.paymentStatus,
      };

      await createInvoice(payload);
      toast.success('Invoice generated successfully!');
      setIsModalOpen(false);
      fetchBillingData();
    } catch (error) {
      toast.error('Failed to create invoice.');
      console.error(error);
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await markPaid(id);
      toast.success('Invoice marked as PAID');
      fetchBillingData();
    } catch (error) {
      toast.error('Failed to update payment status.');
      console.error(error);
    }
  };

  const handleDeleteTrigger = (id) => {
    setInvoiceToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!invoiceToDelete) return;
    try {
      await removeInvoice(invoiceToDelete);
      toast.success('Invoice deleted.');
      fetchBillingData();
    } catch (error) {
      toast.error('Could not delete invoice.');
      console.error(error);
    } finally {
      setInvoiceToDelete(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate totals for stats
  const totalInvoices = invoices.length;
  const paidInvoicesCount = invoices.filter((i) => i.paymentStatus === 'PAID').length;
  const overdueInvoicesCount = invoices.filter((i) => i.paymentStatus === 'OVERDUE').length;

  // Real-time calculation on form inputs
  const calculatedTotal = (parseFloat(formData.consultationFee) || 0) +
                          (parseFloat(formData.medicineCost) || 0) +
                          (parseFloat(formData.otherCharges) || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing & Invoices</h1>
          <p className="text-sm text-slate-400">Generate, modify, pay and delete invoices for patient consultations</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition duration-150 shadow-lg shadow-blue-600/10 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${revenue.toFixed(2)}`} 
          icon={Coins} 
          colorClass="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
        />
        <StatCard 
          title="Paid Invoices" 
          value={paidInvoicesCount} 
          icon={CalendarCheck} 
          colorClass="bg-blue-500/10 text-blue-500 border border-blue-500/20" 
        />
        <StatCard 
          title="Pending Invoices" 
          value={pendingCount} 
          icon={CreditCard} 
          colorClass="bg-amber-500/10 text-amber-500 border border-amber-500/20" 
        />
        <StatCard 
          title="Overdue Invoices" 
          value={overdueInvoicesCount} 
          icon={ShieldAlert} 
          colorClass="bg-red-500/10 text-red-500 border border-red-500/20" 
        />
      </div>

      {/* Invoices List */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700">
          <LoadingSpinner />
        </div>
      ) : invoices.length === 0 ? (
        <div className="h-64 flex flex-col justify-center items-center text-slate-500 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
          <CreditCard className="w-12 h-12 text-slate-650 mb-3" />
          <p className="text-lg font-medium text-slate-400">No invoices generated yet</p>
          <p className="text-sm text-slate-455 mt-1">Start by clicking the "Create Invoice" button to generate a new bill.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700 text-xs text-slate-455 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Invoice ID</th>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Patient ID</th>
                  <th className="px-6 py-4">Consultation</th>
                  <th className="px-6 py-4">Medicine</th>
                  <th className="px-6 py-4">Other</th>
                  <th className="px-6 py-4 font-bold">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Billed Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-750/30 transition duration-150">
                    <td className="px-6 py-4 font-semibold text-slate-450">{inv.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{inv.patientName}</td>
                    <td className="px-6 py-4 text-slate-400">{inv.patientId}</td>
                    <td className="px-6 py-4 text-slate-300">₹{inv.consultationFee ? inv.consultationFee.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 text-slate-300">₹{inv.medicineCost ? inv.medicineCost.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 text-slate-300">₹{inv.otherCharges ? inv.otherCharges.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4 font-bold text-white">₹{inv.totalAmount ? inv.totalAmount.toFixed(2) : '0.00'}</td>
                    <td className="px-6 py-4">
                      <Badge text={inv.paymentStatus} />
                    </td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(inv.billedAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {inv.paymentStatus !== 'PAID' && (
                          <button
                            onClick={() => handleMarkAsPaid(inv.id)}
                            className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 font-medium rounded-lg text-xs flex items-center gap-1 transition"
                            title="Mark as Paid"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Pay</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTrigger(inv.id)}
                          title="Delete Invoice"
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

      {/* Add Invoice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Patient Invoice"
        onSubmit={handleFormSubmit}
        submitLabel="Generate Invoice"
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
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Appointment ID */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Appointment ID (Optional)</label>
            <input
              type="number"
              name="appointmentId"
              value={formData.appointmentId}
              onChange={handleFormChange}
              placeholder="e.g. 3"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Patient Name */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400">Patient Name</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleFormChange}
              placeholder="Full name of the patient"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Consultation Fee */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Consultation Fee (₹)</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleFormChange}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Medicine Cost */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Medicine Cost (₹)</label>
            <input
              type="number"
              name="medicineCost"
              value={formData.medicineCost}
              onChange={handleFormChange}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Other Charges */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Other Charges (₹)</label>
            <input
              type="number"
              name="otherCharges"
              value={formData.otherCharges}
              onChange={handleFormChange}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Payment Status */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Payment Status</label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          {/* Auto calculated total box */}
          <div className="space-y-1 sm:col-span-2 p-4 bg-slate-900 border border-slate-750 rounded-xl mt-2 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Total Invoice Amount:</span>
            <span className="text-xl font-bold text-emerald-400">₹{calculatedTotal.toFixed(2)}</span>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialogue */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        message="Do you really want to delete this invoice? The action cannot be undone."
      />
    </div>
  );
};

export default Billing;
