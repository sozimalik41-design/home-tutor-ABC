import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  GraduationCap, 
  DollarSign, 
  MapPin, 
  Briefcase,
  UserCheck,
  ShieldCheck,
  Clock,
  Filter,
  X
} from 'lucide-react';
import { Tutor } from '../../types';
import { tutorService } from '../../services/tutorService';
import { CITIES, CLASSES_LEVELS, POPULAR_SUBJECTS } from '../../data/mockData';

export const TutorManagementSection: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState<'All' | 'Male' | 'Female' | 'Prefer not to say'>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    gender: 'Male' | 'Female' | 'Prefer not to say';
    title: string;
    qualification: string;
    university: string;
    experienceYears: number;
    hourlyRate: number;
    salaryAmount: number;
    salaryFrequency: 'monthly' | 'per_class' | 'hourly';
    studentTuitionFee: number;
    city: string;
    teachingArea: string;
    subjects: string[];
    classes: string[];
    mode: ('In-Person' | 'Online' | 'Hybrid')[];
    status: 'active' | 'inactive' | 'pending' | 'verified';
    bio: string;
    availability: string[];
  }>({
    name: '',
    gender: 'Female',
    title: 'Senior Subject Specialist',
    qualification: '',
    university: '',
    experienceYears: 3,
    hourlyRate: 25,
    salaryAmount: 1800,
    salaryFrequency: 'monthly',
    studentTuitionFee: 2200,
    city: 'Lahore',
    teachingArea: '',
    subjects: ['Mathematics'],
    classes: ['Matric / O-Levels (Grade 9 - 10)'],
    mode: ['In-Person', 'Online'],
    status: 'verified',
    bio: '',
    availability: ['Monday 4:00 PM - 7:00 PM', 'Wednesday 4:00 PM - 7:00 PM']
  });

  const loadTutors = async () => {
    setIsLoading(true);
    try {
      const res = await tutorService.getTutors();
      setTutors(res.tutors);
    } catch (e) {
      console.warn('Failed to load tutors:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTutors();
  }, []);

  const handleOpenAddModal = () => {
    setEditingTutor(null);
    setFormData({
      name: '',
      gender: 'Female',
      title: 'Senior Subject Specialist',
      qualification: '',
      university: '',
      experienceYears: 3,
      hourlyRate: 25,
      salaryAmount: 1800,
      salaryFrequency: 'monthly',
      studentTuitionFee: 2200,
      city: 'Lahore',
      teachingArea: '',
      subjects: ['Mathematics'],
      classes: ['Matric / O-Levels (Grade 9 - 10)'],
      mode: ['In-Person', 'Online'],
      status: 'verified',
      bio: '',
      availability: ['Monday 4:00 PM - 7:00 PM', 'Wednesday 4:00 PM - 7:00 PM']
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tutor: Tutor) => {
    setEditingTutor(tutor);
    setFormData({
      name: tutor.name,
      gender: tutor.gender || 'Prefer not to say',
      title: tutor.title,
      qualification: tutor.qualification,
      university: tutor.university,
      experienceYears: tutor.experienceYears,
      hourlyRate: tutor.hourlyRate,
      salaryAmount: tutor.salaryAmount,
      salaryFrequency: tutor.salaryFrequency,
      studentTuitionFee: tutor.studentTuitionFee,
      city: tutor.cities[0] || 'Lahore',
      teachingArea: tutor.teachingArea || '',
      subjects: tutor.subjects,
      classes: tutor.classes,
      mode: tutor.mode,
      status: tutor.status,
      bio: tutor.bio,
      availability: tutor.availability
    });
    setIsModalOpen(true);
  };

  const handleSaveTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.qualification.trim()) {
      setActionMessage({ type: 'error', text: 'Please fill all required fields.' });
      return;
    }

    const payload: Partial<Tutor> = {
      id: editingTutor ? editingTutor.id : undefined,
      ...formData,
      cities: [formData.city]
    };

    const res = await tutorService.saveTutor(payload);
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: editingTutor ? `Tutor "${formData.name}" updated successfully.` : `Tutor "${formData.name}" added successfully.`
      });
      setIsModalOpen(false);
      loadTutors();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to save tutor.' });
    }
  };

  const handleDeleteTutor = async (id: string) => {
    const res = await tutorService.deleteTutor(id);
    if (res.success) {
      setActionMessage({ type: 'success', text: 'Tutor profile deleted successfully.' });
      setDeleteConfirmId(null);
      loadTutors();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to delete tutor.' });
    }
  };

  // Filtered tutors
  const filteredTutors = tutors.filter(t => {
    if (filterGender !== 'All' && t.gender !== filterGender) return false;
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = t.name.toLowerCase().includes(q);
      const matchSubj = t.subjects.some(s => s.toLowerCase().includes(q));
      const matchArea = t.teachingArea && t.teachingArea.toLowerCase().includes(q);
      if (!matchName && !matchSubj && !matchArea) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Tutor Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage educator profiles, gender classification, salary compensation, and tuition rates.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4 font-bold text-[#A78BFA]" />
          <span>Add New Tutor</span>
        </button>
      </div>

      {/* Action notification */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutor by name, subject, or teaching area..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
          />
        </div>

        {/* Gender Filter */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-xs font-semibold text-slate-500 mr-1">Gender:</span>
          {(['All', 'Female', 'Male', 'Prefer not to say'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setFilterGender(g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterGender === g
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
          >
            <option value="All">All Statuses</option>
            <option value="verified">Verified</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Tutors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tutor Profile</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Subjects & Classes</th>
                <th className="px-4 py-3">Coverage Area</th>
                <th className="px-4 py-3">Tutor Salary</th>
                <th className="px-4 py-3">Student Fee</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTutors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No tutors found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredTutors.map((tutor) => (
                  <tr key={tutor.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Profile */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0">
                          {tutor.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            {tutor.name}
                          </span>
                          <span className="text-[11px] text-slate-500 truncate block max-w-[180px]">
                            {tutor.qualification}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        tutor.gender === 'Female' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : tutor.gender === 'Male'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {tutor.gender || 'Not specified'}
                      </span>
                    </td>

                    {/* Subjects */}
                    <td className="px-4 py-3">
                      <div className="max-w-[200px]">
                        <span className="font-medium text-slate-800 truncate block">
                          {tutor.subjects.slice(0, 2).join(', ')}
                          {tutor.subjects.length > 2 ? ` (+${tutor.subjects.length - 2})` : ''}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {tutor.classes[0]}
                        </span>
                      </div>
                    </td>

                    {/* Area */}
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-semibold text-slate-800 block">{tutor.cities[0]}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                          {tutor.teachingArea || 'All Areas'}
                        </span>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 tabular-nums">
                        ${tutor.salaryAmount}
                        <span className="text-[10px] font-normal text-slate-400 block">
                          per {tutor.salaryFrequency}
                        </span>
                      </div>
                    </td>

                    {/* Student Tuition Fee */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-emerald-800 tabular-nums">
                        ${tutor.studentTuitionFee}
                        <span className="text-[10px] font-normal text-slate-400 block">
                          tuition fee
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tutor.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                        tutor.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        tutor.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {tutor.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(tutor)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                          title="Edit Tutor"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(tutor.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          title="Delete Tutor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Tutor Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete this tutor profile? This action will also unassign associated class sessions.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteTutor(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Tutor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingTutor ? `Edit Tutor: ${editingTutor.name}` : 'Add New Home Tutor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTutor} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Kamran Khan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Mathematics & Calculus Coach"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Highest Qualification <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. Ph.D. in Applied Mathematics"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    City Location
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    {CITIES.slice(1).map((c, idx) => (
                      <option key={idx} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teaching Area / Neighborhood
                  </label>
                  <input
                    type="text"
                    value={formData.teachingArea}
                    onChange={(e) => setFormData({ ...formData, teachingArea: e.target.value })}
                    placeholder="e.g. DHA, Gulberg & Cantt"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              {/* Financial Compensation Breakdown */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 text-xs block">
                  Compensation & Tuition Fee Structure (Separate Records)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tutor Salary / Payout ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.salaryAmount}
                      onChange={(e) => setFormData({ ...formData, salaryAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Salary Frequency
                    </label>
                    <select
                      value={formData.salaryFrequency}
                      onChange={(e) => setFormData({ ...formData, salaryFrequency: e.target.value as any })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    >
                      <option value="monthly">Monthly Payout</option>
                      <option value="per_class">Per Class Payout</option>
                      <option value="hourly">Hourly Payout</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Student Tuition Fee ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.studentTuitionFee}
                      onChange={(e) => setFormData({ ...formData, studentTuitionFee: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Profile Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    <option value="verified">Verified & Background Checked</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending Verification</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hourly Public Rate ($/hr)
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 25 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-[#00FF48] hover:bg-emerald-400 text-slate-950 transition-colors shadow-xs cursor-pointer"
                >
                  Save Tutor Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
