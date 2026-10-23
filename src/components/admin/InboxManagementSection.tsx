import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Search, 
  Filter, 
  Trash2, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  X, 
  Send,
  AlertCircle,
  ExternalLink,
  User,
  Tag
} from 'lucide-react';
import { InboxMessage } from '../../types';
import { 
  getInboxMessages, 
  markMessageStatus, 
  deleteInboxMessage 
} from '../../services/inboxService';

interface InboxManagementSectionProps {
  onNotify: (type: 'success' | 'error', text: string) => void;
}

export const InboxManagementSection: React.FC<InboxManagementSectionProps> = ({ onNotify }) => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadData = () => {
    setMessages(getInboxMessages());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('home_tutor_inbox_change', loadData);
    return () => {
      window.removeEventListener('home_tutor_inbox_change', loadData);
    };
  }, []);

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const handleOpenMessage = (msg: InboxMessage) => {
    setSelectedMessage(msg);
    setReplyText(msg.replyNote || '');
    if (msg.status === 'unread') {
      markMessageStatus(msg.id, 'read');
      loadData();
    }
  };

  const handleMarkReplied = (id: string) => {
    markMessageStatus(id, 'replied', replyText.trim() || undefined);
    loadData();
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(prev => prev ? { ...prev, status: 'replied', replyNote: replyText } : null);
    }
    onNotify('success', 'Message status updated to "Replied"');
  };

  const handleDelete = (id: string) => {
    deleteInboxMessage(id);
    loadData();
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
    setDeleteConfirmId(null);
    onNotify('success', 'Message deleted successfully');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="bg-white rounded-3xl border border-[#DDD6FE] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#4C1D95]/10 text-[#4C1D95] rounded-2xl">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Messages & Inquiries Inbox</h2>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold animate-pulse">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Parent and student inquiries submitted via website contact forms
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Total Messages: <strong>{messages.length}</strong></span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {['all', 'unread', 'read', 'replied'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-[#3B0764] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Inquiries' : st}
              {st === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Grid / List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Messages List Column */}
        <div className={`${selectedMessage ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-3`}>
          {filteredMessages.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No inquiries found</p>
              <p className="text-xs text-slate-500 mt-1">There are currently no inquiry messages.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleOpenMessage(msg)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedMessage?.id === msg.id
                    ? 'bg-[#F5F3FF] border-[#8B5CF6] shadow-sm'
                    : msg.status === 'unread'
                    ? 'bg-amber-50/40 border-amber-200 hover:border-[#8B5CF6]'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      msg.status === 'unread'
                        ? 'bg-amber-500 text-white'
                        : msg.status === 'replied'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{msg.senderName}</span>
                        {msg.status === 'unread' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500">{msg.phone}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(msg.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className={`inline-block px-2 py-0.5 text-[10px] rounded-md font-semibold mt-1 ${
                      msg.status === 'unread'
                        ? 'bg-amber-100 text-amber-800'
                        : msg.status === 'replied'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5">
                  <h4 className="text-xs font-bold text-slate-800 truncate">{msg.subject}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{msg.message}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-medium text-slate-600">
                    {msg.inquiryType}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {msg.status !== 'replied' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkReplied(msg.id);
                        }}
                        className="text-[11px] text-emerald-600 font-bold hover:underline"
                      >
                        Mark Replied
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(msg.id);
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded"
                      title="Delete inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Message Detail Column */}
        {selectedMessage && (
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#DDD6FE] p-6 shadow-sm space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8B5CF6] tracking-wider">
                  {selectedMessage.inquiryType}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedMessage.subject}</h3>
                <span className="text-xs text-slate-400">
                  Received: {new Date(selectedMessage.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sender Contact Info Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{selectedMessage.senderName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedMessage.status === 'unread'
                    ? 'bg-amber-100 text-amber-800'
                    : selectedMessage.status === 'replied'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {selectedMessage.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <a
                  href={`tel:${selectedMessage.phone}`}
                  className="flex items-center gap-1.5 hover:text-[#4C1D95] font-semibold"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedMessage.phone}</span>
                </a>

                {selectedMessage.email && (
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="flex items-center gap-1.5 hover:text-[#4C1D95]"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedMessage.email}</span>
                  </a>
                )}
              </div>

              {/* Quick WhatsApp Action Button */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${selectedMessage.senderName}, thank you for contacting Home Tutor Academy regarding: "${selectedMessage.subject}". How can we help you?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#00C938] hover:bg-[#00ad30] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Inquiry Message:</span>
              <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {selectedMessage.message}
              </div>
            </div>

            {/* Internal Reply Note */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Internal Administrative Note / Reply Record:
              </label>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Add note, e.g. Called parent, matched with Tutor Sarah for Monday demo class..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(selectedMessage.id)}
                className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Message</span>
              </button>

              <button
                type="button"
                onClick={() => handleMarkReplied(selectedMessage.id)}
                className="px-4 py-2 bg-[#3B0764] hover:bg-[#2e0550] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF48]" />
                <span>Save Note & Mark Replied</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Message?</h3>
              <p className="text-xs text-slate-500 mt-1">Are you sure you want to permanently delete this inquiry message?</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
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
