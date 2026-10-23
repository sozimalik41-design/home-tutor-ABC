import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Calendar, 
  UserCheck, 
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { AdmissionApplication } from '../../types';
import { 
  getAdmissions, 
  addAdmissionApplication, 
  updateAdmissionStatus, 
  deleteAdmissionApplication 
} from '../../services/admissionService';

interface AdmissionsManagementSectionProps {
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export const AdmissionsManagementSection: React.FC<AdmissionsManagementSectionProps> = ({ onNotify }) => {
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<AdmissionApplication | null>(null);

  // New application form
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    gradeLevel: 'Matric / O-Levels (Grade 10)',
    subjects: 'Mathematics, Physics',
    teachingMode: 'Home Tuition' as 'Home Tuition' | 'Online' | 'Hybrid',
    city: 'Lahore',
    address: '',
    preferredTiming: 'Evening (5:00 PM - 7:00 PM)',
    budget: 3000,
    notes: ''
  });

  const loadData = () => {
    setAdmissions(getAdmissions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('home_tutor_admissions_change', loadData);
    return () => window.removeEventListener('home_tutor_admissions_change', loadData);
  }, []);

  const handleStatusChange = (id: string, status: AdmissionApplication['status']) => {
    const success = updateAdmissionStatus(id, status);
    if (success) {
      loadData();
      onNotify('success', `Application status updated to: ${status.toUpperCase()}`);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this admission application?')) {
      deleteAdmissionApplication(id);
      loadData();
      onNotify('success', 'Admission application deleted successfully.');
    }
  };

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.parentPhone.trim()) {
      onNotify('error', 'Student name and phone number are required.');
      return;
    }

    addAdmissionApplication({
      studentName: formData.studentName.trim(),
      parentName: formData.parentName.trim() || 'Parent',
      parentPhone: formData.parentPhone.trim(),
      parentEmail: formData.parentEmail.trim() || undefined,
      gradeLevel: formData.gradeLevel,
      subjects: formData.subjects.split(',').map(s => s.trim()).filter(Boolean),
      teachingMode: formData.teachingMode,
      city: formData.city,
      address: formData.address.trim() || undefined,
      preferredTiming: formData.preferredTiming,
      budget: formData.budget,
      notes: formData.notes.trim() || undefined
    });

    setIsAddModalOpen(false);
    setFormData({
      studentName: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      gradeLevel: 'Matric / O-Levels (Grade 10)',
      subjects: 'Mathematics, Physics',
      teachingMode: 'Home Tuition',
      city: 'Lahore',
      address: '',
      preferredTiming: 'Evening (5:00 PM - 7:00 PM)',
      budget: 3000,
      notes: ''
    });
    loadData();
    onNotify('success', 'New admission record added successfully.');
  };

  const filtered = admissions.filter(app => {
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.parentPhone.includes(searchQuery) ||
      app.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-[#DDD6FE] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4C1D95] mb-1">
            <GraduationCap className="w-4 h-4 text-[#A78BFA]" />
            <span>Admissions Desk & Student Applications</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#1F2937]">
            Admission Applications Portal
          </h2>
          <p className="text-xs text-[#6B7280] mt-1 max-w-2xl">
            Review, evaluate, and manage incoming parent and student admission applications and enrollment status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#A78BFA]" />
          <span>Add Admission</span>
        </button>
      </div>

      {/* Toolbar: Filters and Search */}
      <div className="bg-white rounded-2xl p-4 border border-[#DDD6FE] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'enrolled', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-[#4C1D95] text-white shadow-xs'
                  : 'bg-[#F5F3FF] text-[#1F2937] hover:bg-[#DDD6FE]/60 border border-[#DDD6FE]'
              }`}
            >
              {st} ({st === 'all' ? admissions.length : admissions.filter(a => a.status === st).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, parent, city..."
            className="w-full bg-[#F5F3FF]/60 border border-[#DDD6FE] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-[#DDD6FE] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-[#F5F3FF] text-[#4C1D95] font-bold uppercase tracking-wider text-[11px] border-b border-[#DDD6FE]">
              <tr>
                <th className="px-6 py-4">Student & Parent</th>
                <th className="px-6 py-4">Grade & Subjects</th>
                <th className="px-6 py-4">Mode & City</th>
                <th className="px-6 py-4">Budget / Fee</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-[#F5F3FF]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#1F2937] text-sm">{app.studentName}</div>
                      <div className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#4C1D95]" />
                        <span>{app.parentPhone}</span>
                        <span>• {app.parentName}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{app.gradeLevel}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {app.subjects.join(', ')}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        app.teachingMode === 'Home Tuition' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {app.teachingMode}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">{app.city}</div>
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-[#1F2937]">
                      PKR {app.budget.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'enrolled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            title="Approve Application"
                          >
                            Approve
                          </button>
                        )}

                        {app.status === 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'enrolled')}
                            className="px-2.5 py-1 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Enroll as Active Student"
                          >
                            <UserCheck className="w-3 h-3 text-[#A78BFA]" />
                            <span>Enroll</span>
                          </button>
                        )}

                        {app.status !== 'rejected' && app.status !== 'enrolled' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(app.id, 'rejected')}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Decline Application"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No admission applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Admission Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-[#DDD6FE] shadow-2xl my-auto animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#DDD6FE]/60 pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#4C1D95]" />
                <h3 className="text-base font-bold text-[#1F2937]">
                  New Student Admission Entry
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="e.g. Rayyan Shah"
                    className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="e.g. Shahid Mehmood"
                    className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent Phone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.parentEmail}
                    onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                    placeholder="parent@example.com"
                    className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Grade Level
                  </label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  >
                    <option value="Primary (Grade 1 - 5)">Primary (Grade 1 - 5)</option>
                    <option value="Middle School (Grade 6 - 8)">Middle School (Grade 6 - 8)</option>
                    <option value="Matric / O-Levels (Grade 10)">Matric / O-Levels (Grade 10)</option>
                    <option value="FSc / A-Levels (Grade 12)">FSc / A-Levels (Grade 12)</option>
                    <option value="MDCAT / ECAT Prep">MDCAT / ECAT Prep</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teaching Mode
                  </label>
                  <select
                    value={formData.teachingMode}
                    onChange={(e) => setFormData({ ...formData, teachingMode: e.target.value as any })}
                    className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  >
                    <option value="Home Tuition">Home Tuition (In-Person)</option>
                    <option value="Online">Online Interactive</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Lahore / Islamabad"
                    className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monthly Tuition Budget (PKR)
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value, 10) || 0 })}
                    placeholder="3000"
                    className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subjects Required (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  placeholder="Mathematics, Physics, Chemistry"
                  className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Home Address / Area
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. House 14-B, DHA Phase 5"
                  className="w-full bg-[#F5F3FF]/50 border border-[#DDD6FE] rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Admission Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
