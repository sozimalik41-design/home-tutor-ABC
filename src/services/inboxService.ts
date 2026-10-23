import { InboxMessage } from '../types';

const INBOX_KEY = 'home_tutor_inbox_messages_v1';

export const INITIAL_INBOX_MESSAGES: InboxMessage[] = [
  {
    id: 'msg-201',
    senderName: 'Mrs. S. Mansoor',
    phone: '+92 300 8472910',
    email: 'mansoor.family@example.com',
    subject: 'Home tutor inquiry for O-Level Physics in Gulberg',
    message: 'Hello, we are looking for an experienced teacher for our son Zayd in O-Levels Physics. We live in Gulberg III. How soon can a tutor be matched for a free trial class?',
    inquiryType: 'Tutor Request',
    status: 'unread',
    createdAt: '2026-10-19T10:14:00.000Z'
  },
  {
    id: 'msg-202',
    senderName: 'Bilal Farooq',
    phone: '+92 321 7766554',
    email: 'bilal.farooq@example.com',
    subject: 'MDCAT Crash Course Fee Structure',
    message: 'Can you provide the breakdown for the 90-day MDCAT sprint? Is this available in 1-on-1 home tuition mode in Faisalabad?',
    inquiryType: 'Fee Inquiry',
    status: 'read',
    createdAt: '2026-10-18T18:40:00.000Z'
  },
  {
    id: 'msg-203',
    senderName: 'Amna Khalid',
    phone: '+92 334 1122334',
    email: 'amna.khalid@example.com',
    subject: 'Teacher Job Application: A-Level Chemistry',
    message: 'I have completed my M.Phil in Chemistry from QAU and want to join Home Tutor as a certified educator. I submitted my transcript.',
    inquiryType: 'General Query',
    status: 'replied',
    replyNote: 'Verification link sent via WhatsApp. Interview scheduled for Tuesday.',
    createdAt: '2026-10-16T15:20:00.000Z'
  },
  {
    id: 'msg-204',
    senderName: 'Khurram Shehzad',
    phone: '+92 302 5544332',
    email: 'khurram.s@example.com',
    subject: 'Online Tuition vs Home Tuition for Grade 8',
    message: 'We are in Islamabad F-10. Do you recommend home visits or online interactive zoom classes for Grade 8 math and science?',
    inquiryType: 'Tutor Request',
    status: 'unread',
    createdAt: '2026-10-20T08:05:00.000Z'
  }
];

let cachedInbox: InboxMessage[] | null = null;

export function getInboxMessages(): InboxMessage[] {
  if (cachedInbox) return cachedInbox;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem(INBOX_KEY);
      if (saved) {
        cachedInbox = JSON.parse(saved);
        return cachedInbox!;
      }
    } catch {}
  }
  cachedInbox = [...INITIAL_INBOX_MESSAGES];
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(INBOX_KEY, JSON.stringify(cachedInbox));
    } catch {}
  }
  return cachedInbox;
}

export function saveInboxMessages(messages: InboxMessage[]): void {
  cachedInbox = messages;
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(INBOX_KEY, JSON.stringify(messages));
      window.dispatchEvent(new CustomEvent('home_tutor_inbox_change'));
    } catch {}
  }
}

export function addInboxMessage(msg: Omit<InboxMessage, 'id' | 'createdAt' | 'status'>): InboxMessage {
  const current = getInboxMessages();
  const newMsg: InboxMessage = {
    ...msg,
    id: `msg-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'unread'
  };
  const updated = [newMsg, ...current];
  saveInboxMessages(updated);
  return newMsg;
}

export function markMessageStatus(id: string, status: InboxMessage['status'], replyNote?: string): boolean {
  const current = getInboxMessages();
  const index = current.findIndex(m => m.id === id);
  if (index === -1) return false;
  current[index] = {
    ...current[index],
    status,
    ...(replyNote !== undefined ? { replyNote } : {})
  };
  saveInboxMessages([...current]);
  return true;
}

export function deleteInboxMessage(id: string): boolean {
  const current = getInboxMessages();
  const updated = current.filter(m => m.id !== id);
  saveInboxMessages(updated);
  return true;
}
