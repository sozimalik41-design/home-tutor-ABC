import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen,
  User,
  ArrowRight,
  X
} from 'lucide-react';
import { Student, Tutor } from '../../types';
import { studentService } from '../../services/studentService';
import { tutorService } from '../../services/tutorService';
import { CLASSES_LEVELS, POPULAR_SUBJECTS, CITIES } from '../../data/mockData';

export const StudentManagementSection: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTutor, setFilterTutor] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    fullName: string;
    gradeLevel: string;
    subjects: string[];
    assignedTutorId: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    city: string;
    address: string;
    teachingMode: 'Home Tuition' | 'Online' | 'Hybrid';
    enrollmentDate: string;
    status: 'active' | 'inactive' | 'completed' | 'paused';
    monthlyFee: number;
    notes: string;
  }>({
    fullName: '',
    gradeLevel: 'Matric / O-Levels (Grade 10)',
    subjects: ['Mathematics'],
    assignedTutorId: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    city: 'Lahore',
    address: '',
    teachingMode: 'Home Tuition',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
    monthlyFee: 2500,
    notes: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, tutorsRes] = await Promise.all([
        studentService.getStudents(),
        tutorService.getTutors()
      ]);
      setStudents(studentsRes.students);
      setTutors(tutorsRes.tutors);
    } catch (e) {
      console.warn('Failed to load students/tutors data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      gradeLevel: 'Matric / O-Levels (Grade 10)',
      subjects: ['Mathematics'],
      assignedTutorId: tutors[0]?.id || '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      city: 'Lahore',
      address: '',
      teachingMode: 'Home Tuition',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'active',
      monthlyFee: 2500,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      gradeLevel: student.gradeLevel,
      subjects: student.subjects,
      assignedTutorId: student.assignedTutorId || '',
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentEmail: student.parentEmail || '',
      city: student.city,
      address: student.address || '',
      teachingMode: student.teachingMode,
      enrollmentDate: student.enrollmentDate,
      status: student.status,
      monthlyFee: student.monthlyFee,
      notes: student.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.parentName.trim() || !formData.parentPhone.trim()) {
      setActionMessage({ type: 'error', text: 'Please fill all required student and parent fields.' });
      return;
    }

    const assignedTutor = tutors.find(t => t.id === formData.assignedTutorId);

    const payload: Partial<Student> = {
      id: editingStudent ? editingStudent.id : undefined,
      ...formData,
      assignedTutorName: assignedTutor ? assignedTutor.name : undefined
    };

    const res = await studentService.saveStudent(payload);
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: editingStudent ? `Student "${formData.fullName}" updated.` : `Student "${formData.fullName}" enrolled.`
      });
      setIsModalOpen(false);
      loadData();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to save student record.' });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const res = await studentService.deleteStudent(id);
    if (res.success) {
      setActionMessage({ type: 'success', text: 'Student record deleted.' });
      setDeleteConfirmId(null);
      loadData();
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to delete student.' });
    }
  };

  const filteredStudents = students.filter(s => {
    if (filterTutor !== 'All' && s.assignedTutorId !== filterTutor) return false;
    if (filterStatus !== 'All' && s.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchParent = s.parentName.toLowerCase().includes(q);
      const matchSubj = s.subjects.some(sub => sub.toLowerCase().includes(q));
      if (!matchName && !matchParent && !matchSubj) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            Student Records Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain private student records, assigned educators, Next Class schedules, and tuition charges.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 bg-[#00FF48] hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 font-bold" />
          <span>Enroll New Student</span>
        </button>
      </div>

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

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, parent, or subject..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Tutor:</span>
          <select
            value={filterTutor}
            onChange={(e) => setFilterTutor(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
          >
            <option value="All">All Assigned Tutors</option>
            {tutors.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Student Cards Grid with Next Class Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No student records found.
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div 
              key={student.id} 
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header: Name, Grade, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {student.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {student.gradeLevel}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    student.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    student.status === 'paused' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {student.status.toUpperCase()}
                  </span>
                </div>

                {/* Key Details */}
                <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Tutor:</span>
                    <span className="font-semibold text-slate-900">
                      {student.assignedTutorName || 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mode:</span>
                    <span className="font-medium text-slate-800">{student.teachingMode} ({student.city})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tuition Fee:</span>
                    <span className="font-bold text-emerald-800">${student.monthlyFee}/month</span>
                  </div>
                </div>

                {/* Next Class Box (Additional Feature #2) */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      Next Scheduled Class
                    </span>
                    {student.nextClass?.isToday && (
                      <span className="bg-[#00FF48] text-slate-950 px-1.5 py-0.2 rounded font-extrabold text-[9px] uppercase tracking-wider">
                        Today!
                      </span>
                    )}
                  </div>

                  {student.nextClass ? (
                    <div className="text-xs space-y-1 text-slate-800">
                      <div className="font-semibold flex items-center justify-between">
                        <span>{student.nextClass.subject}</span>
                        <span className="text-emerald-800 font-mono text-[11px]">
                          {student.nextClass.startTime} - {student.nextClass.endTime}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between">
                        <span>Date: <strong>{student.nextClass.nextClassDate}</strong></span>
                        <span>{student.nextClass.teachingMode}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">
                      No upcoming session scheduled yet.
                    </p>
                  )}
                </div>

                {/* Parent Contact Info */}
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Parent: <strong className="text-slate-700">{student.parentName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{student.parentPhone}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Enrolled: {student.enrollmentDate}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(student)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit Student"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(student.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Student"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Student Record?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this student record? This action will archive historical attendance.
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
                onClick={() => handleDeleteStudent(deleteConfirmId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingStudent ? `Edit Student: ${editingStudent.fullName}` : 'Enroll New Student'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Zayd Al-Mansoor"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Class / Grade Level <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    {CLASSES_LEVELS.slice(1).map((lvl, idx) => (
                      <option key={idx} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Home Tutor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.assignedTutorId}
                    onChange={(e) => setFormData({ ...formData, assignedTutorId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    <option value="">-- Select Tutor --</option>
                    {tutors.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.gender || 'Educator'}) - ${t.hourlyRate}/hr
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teaching Mode
                  </label>
                  <select
                    value={formData.teachingMode}
                    onChange={(e) => setFormData({ ...formData, teachingMode: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    <option value="Home Tuition">Home Tuition (In-Person)</option>
                    <option value="Online">Online Sessions</option>
                    <option value="Hybrid">Hybrid Mode</option>
                  </select>
                </div>
              </div>

              {/* Parent Contact Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <span className="font-bold text-slate-900 block text-xs">
                  Parent / Guardian Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Parent Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="e.g. Tariq Al-Mansoor"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Parent Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      placeholder="e.g. +92 300 8472910"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Parent Email
                    </label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      placeholder="parent@example.com"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    Monthly Tuition Fee ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Enrollment Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Home Physical Address (for in-person tutoring)
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. House 42, Street 18, Sector F-8/2, Islamabad"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00FF48]"
                />
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
                  Save Student Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
