import React, { useState, useEffect } from 'react';
import { Search, Plus, Pencil, Trash, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getAll as getAllPatients, 
  create as createPatient, 
  update as updatePatient, 
  remove as removePatient, 
  search as searchPatients 
} from '../api/patientApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal and Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    address: '',
    bloodGroup: 'O+',
  });

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['MALE', 'FEMALE', 'OTHER'];

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let res;
      if (searchQuery.trim() !== '') {
        res = await searchPatients(searchQuery);
      } else {
        res = await getAllPatients();
      }
      setPatients(res.data || []);
      setCurrentPage(1); // Reset to page 1 on query changes
    } catch (error) {
      toast.error('Failed to load patients list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchQuery]);

  const handleOpenAddModal = () => {
    setSelectedPatient(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: 'MALE',
      address: '',
      bloodGroup: 'O+',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth || '',
      gender: patient.gender || 'MALE',
      address: patient.address || '',
      bloodGroup: patient.bloodGroup || 'O+',
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
    try {
      if (selectedPatient) {
        // Update patient
        await updatePatient(selectedPatient.id, formData);
        toast.success('Patient updated successfully!');
      } else {
        // Create patient
        await createPatient(formData);
        toast.success('Patient registered successfully!');
      }
      setIsModalOpen(false);
      fetchPatients();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error occurred. Make sure fields are valid.';
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const handleDeleteTrigger = (id) => {
    setPatientToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    try {
      await removePatient(patientToDelete);
      toast.success('Patient record deleted successfully.');
      fetchPatients();
    } catch (error) {
      toast.error('Could not delete patient record.');
      console.error(error);
    } finally {
      setPatientToDelete(null);
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

  // Filter patients based on blood group selection
  const filteredPatients = patients.filter((patient) => {
    if (bloodGroupFilter && patient.bloodGroup !== bloodGroupFilter) {
      return false;
    }
    return true;
  });

  // Pagination logic
  const totalItems = filteredPatients.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Patients Management</h1>
          <p className="text-sm text-slate-400">View, search, register, and update patient profiles</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition duration-150 shadow-lg shadow-blue-600/10 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name..."
            className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Blood Group Filter */}
        <div className="w-full md:w-60">
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">All Blood Groups</option>
            {bloodGroups.map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Showing counts info */}
      <p className="text-sm text-slate-450 font-medium">
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} patients
      </p>

      {/* Patients Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700">
          <LoadingSpinner />
        </div>
      ) : patients.length === 0 ? (
        <div className="h-64 flex flex-col justify-center items-center text-slate-500 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
          <User className="w-12 h-12 text-slate-650 mb-3" />
          <p className="text-lg font-medium text-slate-400">No patient records found</p>
          <p className="text-sm text-slate-450 mt-1">Try refining your search query or add a new patient profile.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700 text-xs text-slate-450 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Blood</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm">
                {currentItems.map((patient, index) => (
                  <tr key={patient.id} className="hover:bg-slate-750/30 transition duration-150">
                    <td className="px-6 py-4 font-semibold text-slate-400">{patient.id}</td>
                    <td className="px-6 py-4 font-semibold text-white">{patient.firstName} {patient.lastName}</td>
                    <td className="px-6 py-4 text-slate-300">{patient.email}</td>
                    <td className="px-6 py-4 text-slate-400">{patient.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{patient.gender.toLowerCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-700 border border-slate-650 text-slate-300 font-bold px-2 py-0.5 rounded-lg text-xs">
                        {patient.bloodGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(patient.registeredAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(patient)}
                          title="Edit Profile"
                          className="p-1.5 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrigger(patient.id)}
                          title="Delete Record"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-900/40 border-t border-slate-700 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-650 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <span className="text-xs font-semibold text-slate-400">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-650 text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-xs font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Sheet for Add/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPatient ? 'Edit Patient Profile' : 'Register New Patient'}
        onSubmit={handleFormSubmit}
        submitLabel={selectedPatient ? 'Update' : 'Register'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* DOB */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Gender */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            >
              {genders.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Blood Group */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400">Blood Group</label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleFormChange}
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
        message="Do you really want to delete this patient profile? All corresponding appointments and invoice logs will become orphaned."
      />
    </div>
  );
};

export default Patients;
