import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Search, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  X, 
  Eye,
  Filter,
  Upload
} from 'lucide-react';
import { GalleryPhoto } from '../../types';
import { 
  getGalleryPhotos, 
  addGalleryPhoto, 
  deleteGalleryPhoto 
} from '../../services/galleryService';

interface GalleryManagementSectionProps {
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export const GalleryManagementSection: React.FC<GalleryManagementSectionProps> = ({ onNotify }) => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add form state
  const [formData, setFormData] = useState<{
    title: string;
    caption: string;
    imageUrl: string;
    category: GalleryPhoto['category'];
  }>({
    title: '',
    caption: '',
    imageUrl: '',
    category: 'Tutoring'
  });

  const loadData = () => {
    setPhotos(getGalleryPhotos());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('home_tutor_gallery_change', loadData);
    return () => {
      window.removeEventListener('home_tutor_gallery_change', loadData);
    };
  }, []);

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.imageUrl.trim()) {
      onNotify('error', 'Please fill in the title and provide an image URL');
      return;
    }

    addGalleryPhoto({
      title: formData.title.trim(),
      caption: formData.caption.trim(),
      imageUrl: formData.imageUrl.trim(),
      category: formData.category
    });

    onNotify('success', 'Photo added to gallery successfully');
    setIsAddModalOpen(false);
    setFormData({
      title: '',
      caption: '',
      imageUrl: '',
      category: 'Tutoring'
    });
    loadData();
  };

  const handleDeletePhoto = (id: string) => {
    deleteGalleryPhoto(id);
    loadData();
    setDeleteConfirmId(null);
    if (previewPhoto?.id === id) {
      setPreviewPhoto(null);
    }
    onNotify('success', 'Photo deleted from gallery');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredPhotos = photos.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.caption.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="bg-white rounded-3xl border border-[#DDD6FE] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#4C1D95]/10 text-[#4C1D95] rounded-2xl">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Photo Gallery & Campus Life</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage campus highlights, 1-on-1 tutoring sessions, faculty workshops, and student achievements
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search photos by title or caption..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['all', 'Tutoring', 'Campus', 'Awards', 'Workshops'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#3B0764] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-slate-100 overflow-hidden">
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                {photo.category}
              </span>

              <button
                type="button"
                onClick={() => setPreviewPhoto(photo)}
                className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <div className="p-2.5 bg-white/20 backdrop-blur-xs rounded-full">
                  <Eye className="w-6 h-6" />
                </div>
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 font-mono">{photo.date}</span>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{photo.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{photo.caption}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(photo)}
                  className="text-xs font-bold text-[#8B5CF6] hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(photo.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  title="Delete image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Photo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[#4C1D95]" />
                <h3 className="text-base font-bold text-slate-900">
                  Add Photo to Gallery
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Science Lab Demonstration Session..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none"
                >
                  <option value="Tutoring">1-on-1 Tutoring Session</option>
                  <option value="Campus">Campus & Study Center</option>
                  <option value="Awards">Awards & Student Results</option>
                  <option value="Workshops">Faculty Workshops</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Image URL or Upload from Device *
                </label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none"
                />
                
                <div className="mt-2 flex items-center gap-2">
                  <label className="cursor-pointer text-xs font-bold text-[#4C1D95] hover:underline flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Or choose image from device (Upload file)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {formData.imageUrl && (
                  <div className="mt-3 relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Caption / Description
                </label>
                <textarea
                  rows={2}
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Brief description about this photo..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#A78BFA] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4C1D95] hover:bg-[#3B0764] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Add to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={previewPhoto.imageUrl}
              alt={previewPhoto.title}
              className="w-full max-h-[65vh] object-contain bg-black"
            />

            <div className="p-6 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded bg-[#A78BFA] text-[#3B0764] text-[10px] font-bold uppercase">
                  {previewPhoto.category}
                </span>
                <h3 className="text-base font-bold mt-1 text-white">{previewPhoto.title}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">{previewPhoto.caption}</p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteConfirmId(previewPhoto.id)}
                className="px-3.5 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
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
              <h3 className="text-base font-bold text-slate-900">Delete Photo?</h3>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to permanently delete this photo from the gallery?</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePhoto(deleteConfirmId)}
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
