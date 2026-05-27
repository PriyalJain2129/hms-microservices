import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Pencil, 
  Trash, 
  LayoutGrid, 
  List, 
  Stethoscope, 
  Briefcase, 
  GraduationCap, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getAll as getAllDoctors, 
  create as createDoctor, 
  update as updateDoctor, 
  remove as removeDoctor, 
  search as searchDoctors 
} from '../api/doctorApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [loading, setLoading] = useState(true);

  // Modal and Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    department: 'General Medicine',
    available: true,
    qualification: '',
    experienceYears: 1,
  });

  const departments = [
    'General Medicine',
    'Cardiology',
    'Pediatrics',
    'Neurology',
    'Orthopedics',
    'Dermatology',
    'Oncology',
    'Gynecology'
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let res;
      if (searchQuery.trim() !== '') {
        res = await searchDoctors(searchQuery);
      } else {
        res = await getAllDoctors();
      }
      setDoctors(res.data || []);
    } catch (error) {
      toast.error('Failed to load doctors list');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchQuery]);

  const handleOpenAddModal = () => {
    setSelectedDoctor(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: '',
      department: 'General Medicine',
      available: true,
      qualification: '',
      experienceYears: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      firstName: doctor.firstName || '',
      lastName: doctor.lastName || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      specialization: doctor.specialization || '',
      department: doctor.department || 'General Medicine',
      available: doctor.available !== undefined ? doctor.available : true,
      qualification: doctor.qualification || '',
      experienceYears: doctor.experienceYears || 1,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFormSubmit = async () => {
    try {
      if (selectedDoctor) {
        await updateDoctor(selectedDoctor.id, formData);
        toast.success('Doctor details updated successfully!');
      } else {
        await createDoctor(formData);
        toast.success('Doctor registered successfully!');
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error occurred. Make sure fields are valid.';
      toast.error(errorMsg);
      console.error(error);
    }
  };

  const handleDeleteTrigger = (id) => {
    setDoctorToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;
    try {
      await removeDoctor(doctorToDelete);
      toast.success('Doctor record deleted successfully.');
      fetchDoctors();
    } catch (error) {
      toast.error('Could not delete doctor record.');
      console.error(error);
    } finally {
      setDoctorToDelete(null);
    }
  };

  const getInitials = (first, last) => {
    return ((first ? first[0] : '') + (last ? last[0] : '')).toUpperCase();
  };

  // Filter doctors based on department selection
  const filteredDoctors = doctors.filter((doc) => {
    if (departmentFilter && doc.department !== departmentFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Doctors Directory</h1>
          <p className="text-sm text-slate-400">Manage physician records, specialization, departments and availability</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition duration-150 shadow-lg shadow-blue-600/10 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Search, Filter & Toggle */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by doctor name..."
            className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Department Filter */}
        <div className="w-full md:w-60">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Grid/List Toggle */}
        <div className="flex bg-slate-700 border border-slate-600 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Showing doctor counts */}
      <p className="text-sm text-slate-455 font-medium">
        Showing {filteredDoctors.length} doctors
      </p>

      {/* Loading & Empty States */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700">
          <LoadingSpinner />
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="h-64 flex flex-col justify-center items-center text-slate-500 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
          <Stethoscope className="w-12 h-12 text-slate-650 mb-3" />
          <p className="text-lg font-medium text-slate-400">No doctor records found</p>
          <p className="text-sm text-slate-450 mt-1">Try adjusting your filters or register a new doctor profile.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (3 cols) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl hover:border-slate-650 transition duration-200 relative group overflow-hidden">
              {/* Specialization tag & availability dot absolute top */}
              <div className="flex justify-between items-start">
                <span className="bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {doc.department}
                </span>
                <span 
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    doc.available 
                      ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${doc.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>{doc.available ? 'Available' : 'Busy'}</span>
                </span>
              </div>

              {/* Doctor Identity Header */}
              <div className="flex items-center gap-4 mt-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-blue-500/10 shrink-0">
                  {getInitials(doc.firstName, doc.lastName)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white leading-snug truncate">Dr. {doc.firstName} {doc.lastName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{doc.specialization}</p>
                </div>
              </div>

              {/* Info grid */}
              <div className="mt-6 pt-4 border-t border-slate-700/60 grid grid-cols-2 gap-4 text-xs text-slate-350">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-450" />
                  <span className="truncate">{doc.qualification || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-450" />
                  <span>{doc.experienceYears} Years Exp</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Phone className="w-3.5 h-3.5 text-slate-450" />
                  <span>{doc.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <Mail className="w-3.5 h-3.5 text-slate-450" />
                  <span className="truncate">{doc.email}</span>
                </div>
              </div>

              {/* Action buttons inside grid card */}
              <div className="mt-6 pt-4 border-t border-slate-700 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(doc)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-650 text-blue-400 font-medium rounded-lg text-xs flex items-center gap-1 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteTrigger(doc.id)}
                  className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/40 font-medium rounded-lg text-xs flex items-center gap-1 transition"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW (Table style) */
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700 text-xs text-slate-450 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Qualification</th>
                  <th className="px-6 py-4">Experience</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm">
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-750/30 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 text-xs font-bold shrink-0">
                          {getInitials(doc.firstName, doc.lastName)}
                        </div>
                        <span className="font-semibold text-white">Dr. {doc.firstName} {doc.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{doc.specialization}</td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-md font-medium">
                        {doc.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{doc.qualification || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-400">{doc.experienceYears} Years</td>
                    <td className="px-6 py-4 text-slate-400">{doc.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-450">{doc.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${doc.available ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        <span className={`w-1 h-1 rounded-full ${doc.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span>{doc.available ? 'Available' : 'Busy'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="p-1.5 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrigger(doc.id)}
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedDoctor ? 'Edit Doctor Profile' : 'Register New Doctor'}
        onSubmit={handleFormSubmit}
        submitLabel={selectedDoctor ? 'Update' : 'Register'}
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

          {/* Specialization */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleFormChange}
              placeholder="e.g. Cardiologist"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Department */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Qualification */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Qualification</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleFormChange}
              placeholder="e.g. MBBS, MD"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Experience Years */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Experience Years</label>
            <input
              type="number"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleFormChange}
              min="0"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Available Toggle */}
          <div className="space-y-1 sm:col-span-2 pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              name="available"
              checked={formData.available}
              onChange={handleFormChange}
              className="w-5 h-5 bg-slate-700 border border-slate-650 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800 focus:ring-2 cursor-pointer"
            />
            <label htmlFor="available" className="text-sm font-semibold text-slate-300 cursor-pointer select-none">
              Mark doctor as available for consultations
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialogue */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        message="Do you really want to delete this doctor profile? Active consultations and schedules associated with Dr. will be impacted."
      />
    </div>
  );
};

export default Doctors;
