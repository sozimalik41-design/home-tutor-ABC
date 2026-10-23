import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Tag, 
  AlertCircle,
  X,
  Bell
} from 'lucide-react';
import { AcademyAnnouncement } from '../../types';
import { 
  getAnnouncements, 
  addAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from '../../services/announcementService';

interface AnnouncementsManagementSectionProps {
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export const AnnouncementsManagementSection: React.FC<AnnouncementsManagementSectionProps> = ({ onNotify }) => {
  const [announcements, setAnnouncements] = useState<AcademyAnnouncement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AcademyAnnouncement | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: AcademyAnnouncement['category'];
    priority: AcademyAnnouncement['priority'];
    badge: string;
    isPublished: boolean;
  }>({
    title: '',
    content: '',
    category: 'Admissions',
    priority: 'high',
    badge: 'New Update',
    isPublished: true
  });

  const loadData = () => {
    setAnnouncements(getAnnouncements());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('home_tutor_announcements_change', loadData);
    return () => {
      window.removeEventListener('home_tutor_announcements_change', loadData);
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      content: '',
      category: 'Admissions',
      priority: 'high',
      badge: 'New Batch',
      isPublished: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: AcademyAnnouncement) => {
    setEditingItem(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      priority: ann.priority,
      badge: ann.badge || '',
      isPublished: ann.isPublished
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      onNotify('error', 'Please fill in both the title and content details.');
      return;
    }

    if (editingItem) {
      updateAnnouncement(editingItem.id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        priority: formData.priority,
        badge: formData.badge.trim() || undefined,
        isPublished: formData.isPublished
      });
      onNotify('success', 'Announcement updated successfully.');
    } else {
      addAnnouncement({
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        priority: formData.priority,
        badge: formData.badge.trim() || undefined,
        isPublished: formData.isPublished,
        date: new Date().toISOString().split('T')[0]
      });
      onNotify('success', 'New announcement published successfully.');
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleTogglePublish = (ann: AcademyAnnouncement) => {
    updateAnnouncement(ann.id, { isPublished: !ann.isPublished });
    loadData();
    onNotify('success', ann.isPublished ? 'Announcement unpublished.' : 'Announcement published live.');
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
    loadData();
    setDeleteConfirmId(null);
    onNotify('success', 'Announcement deleted successfully.');
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl border border-[#DDD6FE] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4C1D95]/10 text-[#4C1D95] rounded-2xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Announcements & Notice Board</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish academy notices, admissions updates, scholarship alerts, and exam dates
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Announcement</span>
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total: <strong>{announcements.length}</strong> | Published: <strong>{announcements.filter(a => a.isPublished).length}</strong>
        </span>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAnnouncements.map((ann) => (
          <div
            key={ann.id}
            className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between shadow-xs ${
              ann.isPublished ? 'border-slate-200 hover:border-[#8B5CF6]' : 'border-dashed border-slate-300 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  ann.priority === 'urgent'
                    ? 'bg-rose-100 text-rose-700'
                    : ann.priority === 'high'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {ann.priority} Priority
                </span>

                <span className="text-[11px] text-slate-400 font-mono">
                  {ann.date}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold text-[#8B5CF6]">{ann.category}</span>
                {ann.badge && (
                  <span className="px-2 py-0.2 bg-[#F5F3FF] text-[#4C1D95] rounded-md text-[10px] font-bold">
                    {ann.badge}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{ann.title}</h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{ann.content}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleTogglePublish(ann)}
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  ann.isPublished
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                {ann.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{ann.isPublished ? 'Published' : 'Draft'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(ann)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  title="Edit announcement"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(ann.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#4C1D95]" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Edit Announcement' : 'New Announcement'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Admissions Open for Winter 2026 Batch..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none"
                  >
                    <option value="Admissions">Admissions</option>
                    <option value="Exam Prep">Exam Prep</option>
                    <option value="Notice">Notice</option>
                    <option value="Fee Alert">Fee Alert</option>
                    <option value="Holiday">Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none"
                  >
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Priority (Red Banner)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. New Batch, Early Bird, 20% Off..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Content Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter detailed announcement information here..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="annPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-4 h-4 text-[#4C1D95] rounded border-slate-300 focus:ring-[#A78BFA]"
                />
                <label htmlFor="annPublished" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Publish immediately live on website
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Announcement?</h3>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to permanently delete this announcement?</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
