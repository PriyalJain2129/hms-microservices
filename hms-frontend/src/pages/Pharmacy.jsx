import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash, Search, AlertCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getAll as getAllMeds, 
  search as searchMeds, 
  getLowStock, 
  create as createMed, 
  update as updateMed, 
  remove as removeMed,
  updateStock 
} from '../api/pharmacyApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';

const Pharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal and Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [medToDelete, setMedToDelete] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    manufacturer: '',
    category: 'Analgesics',
    price: 0.0,
    stock: 0,
    minimumStock: 10,
    expiryDate: '',
    description: '',
  });

  const categories = [
    'Analgesics',
    'Antibiotics',
    'Antivirals',
    'Antihistamines',
    'Antidepressants',
    'Cardiovascular',
    'Diabetics',
    'Vitamins/Supplements'
  ];

  const fetchPharmacyData = async () => {
    setLoading(true);
    try {
      let res;
      if (searchQuery.trim() !== '') {
        res = await searchMeds(searchQuery);
      } else {
        res = await getAllMeds();
      }
      setMedicines(res.data || []);

      // Fetch low stock alert medicines
      const lowStockRes = await getLowStock().catch(() => ({ data: [] }));
      setLowStockMeds(lowStockRes.data || []);
    } catch (error) {
      toast.error('Failed to load pharmacy inventory');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacyData();
  }, [searchQuery]);

  const handleOpenAddModal = () => {
    setSelectedMed(null);
    setFormData({
      name: '',
      genericName: '',
      manufacturer: '',
      category: 'Analgesics',
      price: '',
      stock: '',
      minimumStock: 10,
      expiryDate: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med) => {
    setSelectedMed(med);
    setFormData({
      name: med.name || '',
      genericName: med.genericName || '',
      manufacturer: med.manufacturer || '',
      category: med.category || 'Analgesics',
      price: med.price || '',
      stock: med.stock || '',
      minimumStock: med.minimumStock || 10,
      expiryDate: med.expiryDate || '',
      description: med.description || '',
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
    const { name, price, stock } = formData;
    if (!name) {
      toast.error('Medicine Name is required');
      return;
    }

    try {
      const payload = {
        name,
        genericName: formData.genericName,
        manufacturer: formData.manufacturer,
        category: formData.category,
        price: parseFloat(price) || 0.0,
        stock: parseInt(stock, 10) || 0,
        minimumStock: parseInt(formData.minimumStock, 10) || 10,
        expiryDate: formData.expiryDate || null,
        description: formData.description,
      };

      if (selectedMed) {
        await updateMed(selectedMed.id, payload);
        toast.success('Medicine record updated successfully');
      } else {
        await createMed(payload);
        toast.success('New medicine added to inventory');
      }
      setIsModalOpen(false);
      fetchPharmacyData();
    } catch (error) {
      toast.error('Failed to save medicine record.');
      console.error(error);
    }
  };

  const handleDeleteTrigger = (id) => {
    setMedToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!medToDelete) return;
    try {
      await removeMed(medToDelete);
      toast.success('Medicine removed from inventory');
      fetchPharmacyData();
    } catch (error) {
      toast.error('Could not delete medicine record');
      console.error(error);
    } finally {
      setMedToDelete(null);
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

  // Filter medicines based on category selection
  const filteredMeds = medicines.filter((med) => {
    if (categoryFilter && med.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pharmacy Inventory</h1>
          <p className="text-sm text-slate-400">Track and manage medicine stocks, categorization, pricing and expirations</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition duration-150 shadow-lg shadow-blue-600/10 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Red Low Stock Banner */}
      {lowStockMeds.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white text-sm">Low Stock Alert</h4>
            <p className="text-xs text-slate-300 mt-1">
              There are {lowStockMeds.length} medicine(s) running low on stock (stock &le; minimum stock level). Please review the inventory.
            </p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicines by name..."
            className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-60">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Showing count text */}
      <p className="text-sm text-slate-455 font-medium">
        Showing {filteredMeds.length} medicines
      </p>

      {/* Medicines Table */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-slate-800 rounded-xl border border-slate-700">
          <LoadingSpinner />
        </div>
      ) : filteredMeds.length === 0 ? (
        <div className="h-64 flex flex-col justify-center items-center text-slate-500 bg-slate-800 rounded-xl border border-slate-700 border-dashed">
          <ShoppingBag className="w-12 h-12 text-slate-650 mb-3" />
          <p className="text-lg font-medium text-slate-400">No medicines in inventory</p>
          <p className="text-sm text-slate-455 mt-1">Try adjusting your search criteria or register a new medicine.</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700 text-xs text-slate-455 font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Generic Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Manufacturer</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry Date</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm">
                {filteredMeds.map((med) => {
                  const isLow = med.stock <= med.minimumStock;
                  return (
                    <tr key={med.id} className="hover:bg-slate-750/30 transition duration-150">
                      <td className="px-6 py-4 font-semibold text-slate-450">{med.id}</td>
                      <td className="px-6 py-4 font-semibold text-white">{med.name}</td>
                      <td className="px-6 py-4 text-slate-350">{med.genericName || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-700 border border-slate-650 text-slate-300 text-xs font-semibold px-2 py-0.5 rounded-lg">
                          {med.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{med.manufacturer || 'N/A'}</td>
                      <td className="px-6 py-4 text-white font-semibold">₹{med.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${isLow ? 'text-red-400' : 'text-slate-300'}`}>
                          {med.stock} <span className="text-xs font-normal text-slate-500">(min: {med.minimumStock})</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                          isLow 
                            ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                            : 'bg-green-500/15 text-green-400 border-green-500/30'
                        }`}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(med.expiryDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(med)}
                            title="Edit Record"
                            className="p-1.5 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrigger(med.id)}
                            title="Remove Medicine"
                            className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMed ? 'Modify Medicine Inventory' : 'Add New Medicine to Stock'}
        onSubmit={handleFormSubmit}
        submitLabel={selectedMed ? 'Save Changes' : 'Add Medicine'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Medicine Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              placeholder="e.g. Paracetamol"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Generic Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Generic Name</label>
            <input
              type="text"
              name="genericName"
              value={formData.genericName}
              onChange={handleFormChange}
              placeholder="e.g. Acetaminophen"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Manufacturer */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Manufacturer</label>
            <input
              type="text"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleFormChange}
              placeholder="e.g. Pfizer, GSK"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-450 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Unit Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleFormChange}
              placeholder="0.00"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Stock */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Initial Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleFormChange}
              placeholder="0"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Minimum Stock */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Minimum Stock Limit</label>
            <input
              type="number"
              name="minimumStock"
              value={formData.minimumStock}
              onChange={handleFormChange}
              placeholder="10"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleFormChange}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Description */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows="3"
              placeholder="Provide general usage descriptions, warning notices, etc."
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
        message="Do you really want to delete this medicine record from inventory? This action is permanent."
      />
    </div>
  );
};

export default Pharmacy;
