import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import * as api from '../api';
import {
  Menu, Star, Send, Paperclip, Activity, Search,
  ChevronDown, ChevronRight, CircleUser, SlidersHorizontal,
  CalendarDays, ChevronLeft, ChevronRight as ChevronRightNav,
  Plus, Tag, Users, Inbox, MoreHorizontal, ArrowLeft,
  Trash2, Save, Grid3x3, Mail, Calendar,
  HardDrive, FileText, Image, FolderOpen, Search as SearchIcon,
  Upload, UserPlus, Video, Clock,
} from 'lucide-react';

// ─── Types ───
type AppType = 'mail' | 'contacts' | 'calendar' | 'drive' | 'photos';

interface Email {
  id: string; read: boolean; folder: 'inbox' | 'sent'; type: 'primary' | 'promotions';
  sender: string; from: string; to_name: string; to_email: string;
  subject: string; body: string; preview: string; date: string;
  dateLabel: string; hasAttachment: boolean; viewCount: number; senderCount: number;
}

interface Contact { id: string; name: string; email: string; phone: string; avatar_path?: string; }

interface DriveFile {
  id: string; name: string; type: 'folder' | 'pdf' | 'doc' | 'image' | 'sheet' | 'video'; size: string;
  dataUrl?: string;
}

interface PhotoItem {
  id: string; color: string; month: string; label: string;
  dataUrl?: string; dateTaken?: string; timeTaken?: string;
  description?: string; tags?: string[];
}

interface Event { day: number; title: string; }

// ─── Data ───
const initialEmails: Email[] = [
  { id: '1', read: false, folder: 'inbox', type: 'primary', sender: 'Alice Johnson', from: 'alice@example.com', to_name: '', to_email: 'me@nmail.com', subject: 'Updated Q3 roadmap for review', body: 'Hey team, I have made some changes to the roadmap based on our last meeting. Let me know your thoughts.', preview: 'Hey team, I have made some changes to the roadmap...', date: '2024-10-11T10:32:00', dateLabel: '10:32 AM', hasAttachment: true, viewCount: 4, senderCount: 2 },
  { id: '2', read: false, folder: 'inbox', type: 'primary', sender: 'GitHub', from: 'noreply@github.com', to_name: '', to_email: 'me@nmail.com', subject: 'Your PR #142 has been reviewed', body: 'opencode-dev left a review on your pull request.', preview: 'opencode-dev left a review on your pull request...', date: '2024-10-11T09:15:00', dateLabel: '9:15 AM', hasAttachment: false, viewCount: 12, senderCount: 1 },
  { id: '3', read: false, folder: 'inbox', type: 'primary', sender: 'Sarah Williams', from: 'sarah@example.com', to_name: '', to_email: 'me@nmail.com', subject: 'Lunch next week?', body: 'Hi! Are you free for lunch sometime next week?', preview: 'Hi! Are you free for lunch sometime next week?...', date: '2024-10-10T14:00:00', dateLabel: 'Yesterday', hasAttachment: false, viewCount: 1, senderCount: 1 },
  { id: '4', read: true, folder: 'inbox', type: 'primary', sender: 'David Park', from: 'david@example.com', to_name: '', to_email: 'me@nmail.com', subject: 'Proposal: Dark mode implementation', body: 'I have put together a proposal for adding dark mode support.', preview: 'I have put together a proposal for adding dark mode support...', date: '2024-10-10T11:00:00', dateLabel: 'Yesterday', hasAttachment: true, viewCount: 8, senderCount: 3 },
  { id: '5', read: true, folder: 'inbox', type: 'promotions', sender: 'Stripe', from: 'notifications@stripe.com', to_name: '', to_email: 'me@nmail.com', subject: 'New payment received — $49.99', body: 'You have received a payment of $49.99.', preview: 'You have received a payment of $49.99...', date: '2024-10-09T15:00:00', dateLabel: 'Oct 9', hasAttachment: false, viewCount: 3, senderCount: 1 },
  { id: '6', read: false, folder: 'inbox', type: 'promotions', sender: 'Tech Weekly', from: 'newsletter@techweekly.com', to_name: '', to_email: 'me@nmail.com', subject: 'AI, Rust and the Future of WebDev', body: 'This week: AI-powered code review is here.', preview: 'This week: AI-powered code review is here...', date: '2024-10-08T08:00:00', dateLabel: 'Oct 8', hasAttachment: false, viewCount: 156, senderCount: 1 },
  { id: '7', read: true, folder: 'sent', type: 'primary', sender: 'Me', from: 'me@nmail.com', to_name: 'Bob Chen', to_email: 'bob@example.com', subject: 'Invoice for October 2024', body: 'Dear Bob, please find attached the invoice.', preview: 'Dear Bob, please find attached the invoice...', date: '2024-10-05T09:00:00', dateLabel: 'Oct 5', hasAttachment: true, viewCount: 7, senderCount: 1 },
  { id: '8', read: false, folder: 'sent', type: 'primary', sender: 'Me', from: 'me@nmail.com', to_name: 'Engineering Team', to_email: 'eng-team@example.com', subject: 'Reminder: Team Standup tomorrow', body: 'Hi team, just a reminder about our standup.', preview: 'Hi team, just a reminder about our standup.', date: '2024-10-03T10:00:00', dateLabel: 'Oct 3', hasAttachment: false, viewCount: 22, senderCount: 1 },
  { id: '9', read: false, folder: 'inbox', type: 'promotions', sender: 'Slack', from: 'notifications@slack.com', to_name: '', to_email: 'me@nmail.com', subject: '13 unread messages in #general', body: 'You have 13 unread messages.', preview: 'You have 13 unread messages in #general...', date: '2024-10-11T08:45:00', dateLabel: '8:45 AM', hasAttachment: false, viewCount: 34, senderCount: 1 },
  { id: '10', read: true, folder: 'inbox', type: 'primary', sender: 'Bob Chen', from: 'bob@example.com', to_name: '', to_email: 'me@nmail.com', subject: 'Re: Sprint planning notes', body: 'Thanks for sharing the sprint notes.', preview: 'Thanks for sharing the sprint planning notes...', date: '2024-10-09T16:20:00', dateLabel: 'Oct 9', hasAttachment: false, viewCount: 5, senderCount: 2 },
];

const initialContacts: Contact[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 (555) 123-4567' },
  { id: '2', name: 'Bob Chen', email: 'bob@example.com', phone: '+1 (555) 234-5678' },
  { id: '3', name: 'Sarah Williams', email: 'sarah@example.com', phone: '+1 (555) 345-6789' },
  { id: '4', name: 'David Park', email: 'david@example.com', phone: '+1 (555) 456-7890' },
  { id: '5', name: 'Michael Lee', email: 'michael@example.com', phone: '+1 (555) 567-8901' },
  { id: '6', name: 'Emily Davis', email: 'emily@example.com', phone: '+1 (555) 678-9012' },
];

const initialDriveFiles: DriveFile[] = [
  { id: '1', name: 'Documents', type: 'folder', size: '12 MB' },
  { id: '2', name: 'Photos 2024', type: 'folder', size: '1.2 GB' },
  { id: '3', name: 'Q3 Report.pdf', type: 'pdf', size: '2.4 MB' },
  { id: '4', name: 'Proposal.docx', type: 'doc', size: '845 KB' },
  { id: '5', name: 'Budget 2025.xlsx', type: 'sheet', size: '156 KB' },
  { id: '6', name: 'Team Photo.jpg', type: 'image', size: '3.1 MB' },
  { id: '7', name: 'Meeting Notes', type: 'folder', size: '4 MB' },
  { id: '8', name: 'Invoice Template.pdf', type: 'pdf', size: '520 KB' },
  { id: '9', name: 'Architecture.png', type: 'image', size: '1.8 MB' },
  { id: '10', name: 'Demo Reel.mp4', type: 'video', size: '45 MB' },
  { id: '11', name: 'Tutorial.mp4', type: 'video', size: '128 MB' },
];

const initialPhotos: PhotoItem[] = [
  { id: '1', color: '#ea4335', month: 'October 2024', label: 'Beach Sunset', dateTaken: '2024-10-05', timeTaken: '18:30', description: 'Beautiful sunset at Santa Monica pier', tags: ['Alice Johnson'] },
  { id: '2', color: '#fbbc04', month: 'October 2024', label: 'Mountain Hike', dateTaken: '2024-10-10', timeTaken: '09:15', description: 'Hiking trail in the Rockies', tags: ['David Park'] },
  { id: '3', color: '#34a853', month: 'October 2024', label: 'City Skyline', dateTaken: '2024-10-08', description: 'Downtown skyline at dusk' },
  { id: '4', color: '#4285f4', month: 'October 2024', label: 'Coffee Shop', dateTaken: '2024-10-03', tags: ['Sarah Williams'] },
  { id: '5', color: '#7c4dff', month: 'September 2024', label: 'Park Picnic', dateTaken: '2024-09-20', description: 'Weekend picnic at Central Park' },
  { id: '6', color: '#ea4335', month: 'September 2024', label: 'Lake View', dateTaken: '2024-09-15', tags: ['Alice Johnson', 'Bob Chen'] },
  { id: '7', color: '#fbbc04', month: 'September 2024', label: 'Flower Garden' },
  { id: '8', color: '#34a853', month: 'August 2024', label: 'Road Trip' },
  { id: '9', color: '#4285f4', month: 'August 2024', label: 'Concert Night', description: 'Amazing live performance' },
  { id: '10', color: '#7c4dff', month: 'August 2024', label: 'BBQ Party', tags: ['Bob Chen', 'Emily Davis'] },
  { id: '11', color: '#ea4335', month: 'August 2024', label: 'Wedding', description: 'Cousin wedding reception' },
  { id: '12', color: '#fbbc04', month: 'July 2024', label: 'Fireworks', dateTaken: '2024-07-04', description: 'Fourth of July fireworks' },
];

const topics = ['Social', 'Updates', 'Forums', 'Travel', 'Finance', 'News'];

const apps: { id: AppType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'mail', label: 'Mail', icon: Mail, color: '#ea4335' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, color: '#34a853' },
  { id: 'drive', label: 'Drive', icon: HardDrive, color: '#fbbc04' },
  { id: 'photos', label: 'Photos', icon: Image, color: '#ea4335' },
];

const COLORS = ['#ea4335', '#fbbc04', '#34a853', '#4285f4', '#7c4dff', '#e91e63', '#00bcd4', '#ff5722', '#607d8b'];

function getMonthDays(year: number, month: number) {
  return { firstDay: new Date(year, month, 1).getDay(), daysInMonth: new Date(year, month + 1, 0).getDate() };
}

let localCounter = 0;
function localId(): string { return 'local_' + (++localCounter); }

function strId(id: string | number): string { return String(id); }

// ─── API mapping helpers ───
function mapEmail(e: any): Email {
  const d = new Date(e.created_at || e.date || Date.now());
  const now = new Date(); const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  let dateLabel = d.toLocaleDateString();
  if (d.toDateString() === now.toDateString()) dateLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  else if (d.toDateString() === yesterday.toDateString()) dateLabel = 'Yesterday';
  else dateLabel = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return {
    id: strId(e.id), read: e.read === 1 || e.read === true,
    folder: e.folder === 'inbox' || e.folder === 'sent' ? e.folder : 'inbox',
    type: 'primary', sender: e.from_name || e.sender || '', from: e.from_email || e.from || '',
    to_name: e.to_name || '', to_email: e.to_email || '',
    subject: e.subject || '', body: e.body || '', preview: (e.body || '').slice(0, 80),
    date: e.created_at || e.date || new Date().toISOString(), dateLabel,
    hasAttachment: false, viewCount: 0, senderCount: 1,
  };
}
function mapPhoto(p: any): PhotoItem {
  let tags: string[] = [];
  if (typeof p.tags === 'string') { try { tags = JSON.parse(p.tags); } catch { tags = []; } }
  else if (Array.isArray(p.tags)) tags = p.tags;
  return {
    id: strId(p.id), color: p.color || '#4285f4', month: p.month || '', label: p.label || '',
    dataUrl: p.file_path ? '/uploads/' + p.file_path : p.dataUrl,
    dateTaken: p.dateTaken || '', timeTaken: p.timeTaken || '',
    description: p.description || '', tags,
  };
}
function mapDriveFile(f: any): DriveFile {
  return {
    id: strId(f.id), name: f.name || '', type: f.type || 'image', size: f.size || '0 MB',
    dataUrl: f.file_path ? '/uploads/' + f.file_path : f.dataUrl,
  };
}

function colorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) { hash = ((hash << 5) - hash) + id.charCodeAt(i); hash |= 0; }
  return COLORS[Math.abs(hash) % COLORS.length];
}

// ─── Main Component ───
export default function GmailInbox() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [emails, setEmails] = useState<Email[]>(initialEmails);
  const [activeNav, setActiveNav] = useState('inbox');
  const [activeTab, setActiveTab] = useState('primary');
  const [searchFilter, setSearchFilter] = useState<'from' | 'to'>('from');
  const [searchText, setSearchText] = useState('');
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [starred, setStarred] = useState<Set<string>>(new Set(['2', '7']));
  const [topicsOpen, setTopicsOpen] = useState(true);
  const [peopleOpen, setPeopleOpen] = useState(true);
  const [dateSort, setDateSort] = useState<'newest' | 'oldest'>('newest');
  const [randomKey, setRandomKey] = useState(0);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Email | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [newComposeIds, setNewComposeIds] = useState<Set<string>>(new Set());
  const [activeApp, setActiveApp] = useState<AppType>('mail');
  const [showWaffle, setShowWaffle] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load data from backend
  useEffect(() => {
    async function loadData() {
      try {
        const [e, c, p, d, pr] = await Promise.all([
          api.fetchEmails('all'),
          api.fetchContacts(),
          api.fetchPhotos(),
          api.fetchDriveFiles(),
          api.fetchProfile(),
        ]);
        const mapped = e.map(mapEmail);
        setEmails(mapped);
        setContacts(c);
        setPhotos(p.map(mapPhoto));
        setDriveFiles(d.map(mapDriveFile));
        setStarred(new Set(e.filter((em: any) => em.starred === 1 || em.starred === true).map((em: any) => strId(em.id))));
        if (pr) setUserProfile(pr);
        // Auto-open the newest inbox email after loading
        const firstInbox = mapped.find((em: Email) => em.folder === 'inbox');
        if (firstInbox) {
          setSelectedEmailId(firstInbox.id);
          setDraft({ ...firstInbox });
        }
      } catch (err) {
        console.error('Failed to load data, using defaults', err);
        const firstInbox = emails.find(em => em.folder === 'inbox');
        if (firstInbox) {
          setSelectedEmailId(firstInbox.id);
          setDraft({ ...firstInbox });
        }
      }
      setLoaded(true);
    }
    loadData();
  }, []);

  // Profile state
  const [userProfile, setUserProfile] = useState({ name: 'Me', email: 'me@nmail.com', phone: '', avatar_path: '' });
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: 'Me', email: 'me@nmail.com', phone: '', avatar_path: '' });

  // Calendar state
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<{ [key: string]: Event[] }>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');

  // Drive state
  const [driveSearch, setDriveSearch] = useState('');
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(initialDriveFiles);
  const [driveFilter, setDriveFilter] = useState<'photos' | 'videos'>('photos');
  const [editingDriveFile, setEditingDriveFile] = useState<DriveFile | null>(null);
  const [driveFileDraft, setDriveFileDraft] = useState<DriveFile | null>(null);
  const [editingDriveLinkedPhoto, setEditingDriveLinkedPhoto] = useState<PhotoItem | null>(null);

  // Photos state
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null);
  const [photoDraft, setPhotoDraft] = useState<PhotoItem | null>(null);

  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [contactDraft, setContactDraft] = useState<Contact | null>(null);
  const [showContactConfirmDelete, setShowContactConfirmDelete] = useState(false);

  // Selected person state
  const [selectedPerson, setSelectedPerson] = useState<Contact | null>(null);

  const switchApp = useCallback((app: AppType) => {
    setActiveApp(app); setShowWaffle(false); setTransitionKey(prev => prev + 1);
    setSelectedPerson(null);
  }, []);

  // ─── Email handlers ───
  const toggleCheck = (id: string) => setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = (ids: string[]) => setChecked(prev => prev.size === ids.length ? new Set() : new Set(ids));
  const toggleStar = (id: string) => {
    setStarred(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); api.updateEmail(id, { starred: n.has(id) ? 1 : 0 }).catch(() => {}); return n; });
  };
  const openEmail = (email: Email) => {
    setSelectedEmailId(email.id); setDraft({ ...email });
    if (!email.read) {
      setEmails(p => p.map(e => e.id === email.id ? { ...e, read: true, viewCount: e.viewCount + 1 } : e));
      api.updateEmail(email.id, { read: 1 }).catch(() => {});
    }
  };
  const closeEmail = () => {
    if (draft && newComposeIds.has(draft.id)) {
      setEmails(p => p.filter(e => e.id !== draft.id));
      setNewComposeIds(prev => { const n = new Set(prev); n.delete(draft.id); return n; });
    }
    setSelectedEmailId(null); setDraft(null); setShowConfirmDelete(false);
  };
  const updateDraft = (field: keyof Email, value: string | number | boolean) => {
    if (!draft) return;
    const u = { ...draft, [field]: value };
    if (field === 'subject' || field === 'body') u.preview = (u.body || '').slice(0, 80);
    setDraft(u);
  };
  const saveEmail = async () => {
    if (!draft) return;
    try {
      if (newComposeIds.has(draft.id)) {
        const result = await api.createEmail({
          from_name: draft.sender, from_email: draft.from, to_name: draft.to_name,
          to_email: draft.to_email, subject: draft.subject, body: draft.body, folder: draft.folder,
        });
        setEmails(p => p.map(e => e.id === draft.id ? { ...draft, id: strId(result.id) } : e));
        setNewComposeIds(prev => { const n = new Set(prev); n.delete(draft.id); return n; });
      } else {
        await api.updateEmail(draft.id, {
          from_name: draft.sender, from_email: draft.from, to_name: draft.to_name,
          to_email: draft.to_email, subject: draft.subject, body: draft.body,
        });
        setEmails(p => p.map(e => e.id === draft.id ? draft : e));
      }
      closeEmail();
    } catch (err) { console.error('Failed to save email:', err); }
  };
  const deleteEmail = async () => {
    if (!draft) return;
    try { await api.deleteEmailApi(draft.id); } catch {}
    setEmails(p => p.filter(e => e.id !== draft.id)); closeEmail();
  };
  const composeNew = () => {
    const id = localId();
    const n: Email = { id, read: true, folder: 'sent', type: 'primary', sender: userProfile.name || 'Me', from: userProfile.email || 'me@nmail.com', to_name: '', to_email: '', subject: '', body: '', preview: '', date: new Date().toISOString(), dateLabel: 'Just now', hasAttachment: false, viewCount: 0, senderCount: 1 };
    setEmails(p => [n, ...p]); setDraft(n); setSelectedEmailId(n.id);
    setNewComposeIds(prev => new Set(prev).add(id));
  };

  // ─── Contact handlers ───
  const openContact = (contact: Contact) => setContactDraft({ ...contact });
  const closeContact = () => { setContactDraft(null); setShowContactConfirmDelete(false); };
  const updateContact = (field: keyof Contact, value: string) => setContactDraft(prev => prev ? { ...prev, [field]: value } : null);
  const saveContact = async () => {
    if (!contactDraft || !contactDraft.name.trim()) return;
    try {
      if (contactDraft.id.startsWith('local_')) {
        const result = await api.createContact({ name: contactDraft.name, email: contactDraft.email, phone: contactDraft.phone });
        setContacts(p => [...p, { ...contactDraft, id: strId(result.id) }]);
      } else {
        await api.updateContactApi(contactDraft.id, { name: contactDraft.name, email: contactDraft.email, phone: contactDraft.phone });
        setContacts(p => p.map(c => c.id === contactDraft.id ? contactDraft : c));
      }
      closeContact();
    } catch (err) { console.error('Failed to save contact:', err); }
  };
  const deleteContact = async () => {
    if (!contactDraft) return;
    try { await api.deleteContactApi(contactDraft.id); } catch {}
    setContacts(p => p.filter(c => c.id !== contactDraft.id)); closeContact();
  };
  const addNewContact = () => setContactDraft({ id: localId(), name: '', email: '', phone: '' });

  // ─── Photo CRUD handlers ───
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    e.target.value = '';
    for (const file of Array.from(files)) {
      const now = new Date();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('label', file.name);
      formData.append('dateTaken', now.toISOString().split('T')[0]);
      formData.append('timeTaken', now.toTimeString().slice(0, 5));
      try {
        const saved = await api.createPhoto(formData);
        const photo = mapPhoto(saved);
        setPhotos(prev => [...prev, photo]);
        setDriveFiles(prev => [...prev, { id: localId(), name: saved.label || file.name, type: 'image', size: `${(file.size / 1024 / 1024).toFixed(1)} MB`, dataUrl: photo.dataUrl }]);
        setEditingPhoto(photo);
        setPhotoDraft({ ...photo });
      } catch (err) { console.error('Failed to upload photo:', err); }
    }
  };
  const deletePhoto = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    try { await api.deletePhotoApi(id); } catch {}
    setPhotos(prev => prev.filter(p => p.id !== id));
    if (photo) setDriveFiles(prev => prev.filter(f => f.name !== photo.label));
    setEditingPhoto(null); setPhotoDraft(null);
  };
  const startEditPhoto = (photo: PhotoItem) => {
    setEditingPhoto(photo);
    setPhotoDraft({ ...photo });
  };
  const updatePhotoDraft = (field: string, value: any) => {
    setPhotoDraft(prev => prev ? { ...prev, [field]: value } : null);
  };
  const savePhotoDraft = async () => {
    if (!photoDraft) return;
    try {
      await api.updatePhotoApi(photoDraft.id, {
        label: photoDraft.label, dateTaken: photoDraft.dateTaken, timeTaken: photoDraft.timeTaken,
        description: photoDraft.description, tags: JSON.stringify(photoDraft.tags || []),
        month: photoDraft.month, color: photoDraft.color,
      });
      setPhotos(prev => prev.map(p => p.id === photoDraft.id ? photoDraft : p));
      setDriveFiles(prev => prev.map(f => f.name === photoDraft.label ? { ...f, name: photoDraft.label } : f));
    } catch (err) { console.error('Failed to save photo:', err); }
    setEditingPhoto(null); setPhotoDraft(null);
  };
  const cancelPhotoEdit = () => {
    setEditingPhoto(null); setPhotoDraft(null);
  };

  // ─── Drive CRUD handlers ───
  const handleDriveUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    e.target.value = '';
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const saved = await api.uploadDriveFile(formData);
        setDriveFiles(prev => [...prev, mapDriveFile(saved)]);
      } catch (err) { console.error('Failed to upload:', err); }
    }
  };
  const startEditDriveFile = (file: DriveFile) => {
    setEditingDriveFile(file);
    setDriveFileDraft({ ...file });
    if (file.type === 'image') {
      setEditingDriveLinkedPhoto(photos.find(p => p.label === file.name) || null);
    } else {
      setEditingDriveLinkedPhoto(null);
    }
  };
  const updateDriveFileDraft = (field: string, value: any) => {
    setDriveFileDraft(prev => prev ? { ...prev, [field]: value } : null);
  };
  const updateDriveLinkedPhoto = (field: string, value: any) => {
    setEditingDriveLinkedPhoto(prev => prev ? { ...prev, [field]: value } : null);
  };
  const saveDriveFile = async () => {
    if (!driveFileDraft) return;
    try {
      await api.updateDriveFileApi(driveFileDraft.id, { name: driveFileDraft.name });
      setDriveFiles(prev => prev.map(f => f.id === driveFileDraft.id ? driveFileDraft : f));
      if (editingDriveLinkedPhoto) {
        await api.updatePhotoApi(editingDriveLinkedPhoto.id, {
          label: editingDriveLinkedPhoto.label, dateTaken: editingDriveLinkedPhoto.dateTaken,
          timeTaken: editingDriveLinkedPhoto.timeTaken, description: editingDriveLinkedPhoto.description,
          tags: JSON.stringify(editingDriveLinkedPhoto.tags || []),
        });
        setPhotos(prev => prev.map(p => p.id === editingDriveLinkedPhoto.id ? editingDriveLinkedPhoto : p));
      }
    } catch (err) { console.error('Failed to save drive file:', err); }
    setEditingDriveFile(null); setDriveFileDraft(null); setEditingDriveLinkedPhoto(null);
  };
  const deleteDriveFile = async (id: string) => {
    const file = driveFiles.find(f => f.id === id);
    try {
      await api.deleteDriveFileApi(id);
      if (file?.type === 'image') {
        const matchedPhoto = photos.find(p => p.label === file.name);
        if (matchedPhoto) { await api.deletePhotoApi(matchedPhoto.id).catch(() => {}); }
      }
    } catch {}
    setDriveFiles(prev => prev.filter(f => f.id !== id));
    if (file?.type === 'image') {
      const matchedPhoto = photos.find(p => p.label === file.name);
      if (matchedPhoto) setPhotos(prev => prev.filter(p => p.id !== matchedPhoto.id));
    }
    setEditingDriveFile(null); setDriveFileDraft(null); setEditingDriveLinkedPhoto(null);
  };

  // ─── Profile avatar upload ───
  const profileAvatarRef = useRef<HTMLInputElement>(null);
  const handleProfileAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await api.uploadProfileAvatar(formData);
      setUserProfile(prev => ({ ...prev, avatar_path: result.file_path || result.avatar_path }));
      setProfileDraft(prev => ({ ...prev, avatar_path: result.file_path || result.avatar_path }));
    } catch (err) { console.error('Failed to upload avatar:', err); }
  };

  // ─── Contact avatar upload ───
  const contactAvatarRef = useRef<HTMLInputElement>(null);
  const [editingPersonAvatar, setEditingPersonAvatar] = useState<Contact | null>(null);
  const handleContactAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPersonAvatar) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await api.uploadContactAvatar(editingPersonAvatar.id, formData);
      const avatarPath = result.file_path || result.avatar_path;
      setContacts(prev => prev.map(c => c.id === editingPersonAvatar.id ? { ...c, avatar_path: avatarPath } : c));
      setSelectedPerson(prev => prev && prev.id === editingPersonAvatar.id ? { ...prev, avatar_path: avatarPath } : prev);
      setEditingPersonAvatar(null);
    } catch (err) { console.error('Failed to upload contact avatar:', err); }
  };

  // ─── Person detail ───
  const openPersonDetail = (person: Contact) => {
    setSelectedPerson(person);
    setTransitionKey(prev => prev + 1);
  };

  const personEmails = useMemo(() => {
    if (!selectedPerson) return [];
    const name = selectedPerson.name.toLowerCase();
    return emails.filter(e =>
      e.sender.toLowerCase().includes(name) ||
      e.from.toLowerCase().includes(name) ||
      e.to_name.toLowerCase().includes(name) ||
      e.to_email.toLowerCase().includes(name) ||
      e.body?.toLowerCase().includes('@' + name) ||
      e.subject?.toLowerCase().includes('@' + name)
    );
  }, [selectedPerson, emails]);

  const personPhotos = useMemo(() => {
    if (!selectedPerson) return [];
    return photos.filter(p => p.tags?.some(t => t.toLowerCase() === selectedPerson.name.toLowerCase()));
  }, [selectedPerson, photos]);

  const counts = useMemo(() => ({ inbox: emails.filter(e => e.folder === 'inbox' && !e.read).length }), [emails]);

  const displayEmails = useMemo(() => {
    let r = [...emails];
    if (!showAllAccounts) {
      switch (activeNav) {
        case 'inbox': r = r.filter(e => e.folder === 'inbox'); break;
        case 'starred': r = r.filter(e => starred.has(e.id)); break;
        case 'sent': r = r.filter(e => e.folder === 'sent'); break;
        case 'attachments': r = r.filter(e => e.hasAttachment); break;
        case 'activity': r = r.filter(e => e.dateLabel === '10:32 AM' || e.dateLabel === '9:15 AM' || e.dateLabel === '8:45 AM'); break;
      }
    }
    if (activeNav === 'inbox' && !showAllAccounts) r = r.filter(e => e.type === activeTab);
    if (searchText) {
      const t = searchText.toLowerCase();
      r = r.filter(e => searchFilter === 'from' ? e.sender.toLowerCase().includes(t) || e.from.toLowerCase().includes(t) : e.to_name.toLowerCase().includes(t) || e.to_email.toLowerCase().includes(t));
    }
    r.sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()) * (dateSort === 'newest' ? 1 : -1));
    if (randomKey > 0) for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
    return r;
  }, [emails, activeNav, activeTab, searchText, searchFilter, starred, dateSort, randomKey, showAllAccounts]);

  const todayEmails = emails.filter(e => e.dateLabel === '10:32 AM' || e.dateLabel === '9:15 AM' || e.dateLabel === '8:45 AM').length;
  const promotionCount = emails.filter(e => e.folder === 'inbox' && e.type === 'promotions').length;

  const navItems = [
    { key: 'inbox', label: 'Inbox', icon: Inbox, count: counts.inbox },
    { key: 'starred', label: 'Starred', icon: Star, count: 0 },
    { key: 'sent', label: 'Sent', icon: Send, count: 0 },
    { key: 'attachments', label: 'Attachments', icon: Paperclip, count: 0 },
    { key: 'activity', label: 'Daily Activity', icon: Activity, count: 0 },
  ];

  const { firstDay, daysInMonth } = getMonthDays(calYear, calMonth);
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const monthKey = `${calYear}-${calMonth}`;

  const addEvent = () => {
    if (!selectedDay || !newEventTitle.trim()) return;
    const key = `${monthKey}-${selectedDay}`;
    setEvents(p => ({ ...p, [key]: [...(p[key] || []), { day: selectedDay, title: newEventTitle.trim() }] }));
    setNewEventTitle('');
  };

  const filteredDrive = useMemo(() => {
    let f = driveFiles.filter(i => i.name.toLowerCase().includes(driveSearch.toLowerCase()));
    if (driveFilter === 'photos') f = f.filter(i => i.type === 'image');
    else if (driveFilter === 'videos') f = f.filter(i => i.type === 'video');
    return f;
  }, [driveFiles, driveSearch, driveFilter]);

  const peopleList = useMemo(() => contacts.slice(0, 8), [contacts]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      const [e, c, p, d, pr] = await Promise.all([
        api.fetchEmails('all'),
        api.fetchContacts(),
        api.fetchPhotos(),
        api.fetchDriveFiles(),
        api.fetchProfile(),
      ]);
      setEmails(e.map(mapEmail));
      setContacts(c);
      setPhotos(p.map(mapPhoto));
      setDriveFiles(d.map(mapDriveFile));
      setStarred(new Set(e.filter((em: any) => em.starred === 1 || em.starred === true).map((em: any) => strId(em.id))));
      if (pr) setUserProfile(pr);
    } catch (err) {
      console.error('Refresh failed', err);
    }
  }, []);

  if (!loaded) {
    return (
      <div className="flex h-screen bg-[#f6f8fc] items-center justify-center font-['Google_Sans','Roboto',sans-serif]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ea4335] via-[#fbbc04] via-[#34a853] to-[#4285f4] flex items-center justify-center text-white text-3xl font-bold shadow-lg animate-[splashPop_0.6s_ease-out]">N</div>
          <span className="text-3xl font-medium text-gray-700 tracking-tight animate-[splashFade_0.8s_ease-out]">nMAIL</span>
          <div className="mt-2">
            <svg className="animate-spin h-8 w-8 text-[#0b57d0]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-sm text-gray-400 animate-pulse">Loading your inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f6f8fc] font-['Google_Sans','Roboto',sans-serif] text-[#1f1f1f]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'} flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ease-in-out`}>
        <div className="flex items-center gap-2 px-6 pt-5 pb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ea4335] via-[#fbbc04] via-[#34a853] to-[#4285f4] flex items-center justify-center text-white font-bold text-sm">N</div>
          <span className="text-xl font-medium text-gray-800">nmail</span>
        </div>
        <div className="px-4 mb-3">
          <button onClick={composeNew} className="flex items-center gap-3 px-6 py-3.5 bg-[#c2e7ff] hover:shadow-md rounded-2xl text-sm font-medium text-[#001d35] transition-shadow w-full shadow-sm">
            <Plus size={18} /><span>Compose</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.key;
            return (
              <button key={item.key} onClick={() => { setActiveNav(item.key); setChecked(new Set()); if (item.key !== 'inbox') setActiveTab('primary'); }}
                className={`flex items-center gap-3 w-full px-4 py-1.5 text-sm rounded-r-full transition-colors ${isActive ? 'bg-[#d3e3fd] text-[#001d35] font-semibold shadow-[inset_4px_0_0_#0b57d0]' : 'text-gray-700 hover:bg-gray-100'}`}>
                <Icon size={20} className={isActive ? 'text-[#0b57d0]' : 'text-gray-500'} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.key === 'inbox' && counts.inbox > 0 && <span className="text-xs font-semibold text-white bg-[#ea4335] px-2 py-0.5 rounded-full">{counts.inbox}</span>}
                {item.key === 'activity' && todayEmails > 0 && <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-0.5 rounded-full">{todayEmails}</span>}
              </button>
            );
          })}
          <div className="mt-6">
            <button onClick={() => setTopicsOpen(!topicsOpen)} className="flex items-center gap-1 px-4 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider w-full hover:text-gray-700">
              {topicsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<Tag size={14} /><span>Topics</span>
            </button>
            {topicsOpen && topics.map(topic => (
              <button key={topic} className="flex items-center gap-3 w-full px-4 py-1.5 pl-11 text-sm text-gray-700 hover:bg-gray-100 rounded-r-full"><span>{topic}</span></button>
            ))}
          </div>

          {/* People — synced with contacts */}
          <div className="mt-2">
            <div className="flex items-center justify-between px-4 py-1.5">
              <button onClick={() => setPeopleOpen(!peopleOpen)} className="flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700">
                {peopleOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<Users size={14} /><span>People</span>
              </button>
              <button onClick={() => { switchApp('contacts'); }} className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-[#0b57d0]" title="Manage contacts">
                <UserPlus size={14} />
              </button>
            </div>
            {peopleOpen && peopleList.map(person => (
              <button key={person.id} onClick={() => openPersonDetail(person)}
                className="flex items-center gap-1 w-full px-4 py-1.5 pl-11 text-sm text-gray-700 hover:bg-gray-100 rounded-r-full">
                <span className="flex-1 text-left truncate">{person.name}</span>
                {personPhotos.length > 0 && <span className="text-[10px] text-gray-400">📷{personPhotos.length}</span>}
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0 h-16">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><Menu size={20} /></button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ea4335] via-[#fbbc04] via-[#34a853] to-[#4285f4] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">N</div>
          <div className="flex-1 flex items-center max-w-[720px] relative">
            <button onClick={handleRefresh} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 mr-1" title="Refresh">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
            <Search size={18} className="absolute left-10 text-gray-400 pointer-events-none" />
            <div className="flex items-center bg-[#f1f3f4] rounded-full w-full pl-10 pr-2 py-0">
              <input type="text" placeholder="Search mail" value={searchText} onChange={e => setSearchText(e.target.value)} className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder-gray-500" />
              <div className="flex items-center gap-1 border-l border-gray-300 pl-2 ml-1">
                <button onClick={() => setSearchFilter('from')} className={`text-xs px-2 py-1 rounded-full ${searchFilter === 'from' ? 'bg-[#0b57d0] text-white' : 'text-gray-500 hover:bg-gray-200'}`}>From</button>
                <button onClick={() => setSearchFilter('to')} className={`text-xs px-2 py-1 rounded-full ${searchFilter === 'to' ? 'bg-[#0b57d0] text-white' : 'text-gray-500 hover:bg-gray-200'}`}>To</button>
              </div>
            </div>
          </div>
          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600"><SlidersHorizontal size={18} /></button>

          <div className="relative">
            <button onClick={() => setShowWaffle(!showWaffle)}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${showWaffle ? 'bg-gray-200' : ''} ${activeApp !== 'mail' ? 'text-[#0b57d0]' : 'text-gray-600'}`}>
              <Grid3x3 size={20} />
            </button>
            {showWaffle && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowWaffle(false)} />
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-40 p-4 w-64 animate-[fadeIn_0.15s_ease]">
                  <div className="grid grid-cols-2 gap-1">
                    {apps.map(app => {
                      const Icon = app.icon;
                      const isActive = activeApp === app.id;
                      return (
                        <button key={app.id} onClick={() => switchApp(app.id)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${isActive ? 'bg-[#d3e3fd] ring-2 ring-[#0b57d0]/30' : 'hover:bg-gray-100'}`}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: app.color }}>
                            <Icon size={20} />
                          </div>
                          <span className={`text-[11px] ${isActive ? 'font-semibold text-[#0b57d0]' : 'text-gray-600'}`}>{app.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          <button onClick={() => { setProfileDraft({ ...userProfile }); setEditingProfile(true); }} className="p-1 rounded-full hover:bg-gray-100 text-gray-600 flex items-center gap-1">
            {userProfile.avatar_path ? (
              <img src={'/uploads/' + userProfile.avatar_path} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ea4335] to-[#4285f4] flex items-center justify-center text-white text-[11px] font-bold">{userProfile.name.charAt(0)}</div>
            )}
          </button>
        </header>

        <div className="flex-1 bg-white rounded-2xl shadow-sm mx-2 mb-2 mt-2 overflow-hidden flex flex-col">
          <div key={transitionKey} className="flex-1 flex flex-col overflow-hidden animate-[fadeIn_0.2s_ease]">
            {selectedPerson ? (
              <PersonDetailView person={selectedPerson} emails={personEmails} photos={personPhotos}
                onBack={() => setSelectedPerson(null)} onOpenEmail={(e: Email) => { setSelectedPerson(null); openEmail(e); }}
                onViewPhoto={startEditPhoto} contacts={contacts}
                onUploadAvatar={handleContactAvatarUpload}
                editingPersonAvatar={editingPersonAvatar}
                setEditingPersonAvatar={setEditingPersonAvatar}
                contactAvatarRef={contactAvatarRef} />
            ) : activeApp === 'mail' ? (
              selectedEmailId && draft ? (
                <EmailEditor draft={draft} updateDraft={updateDraft} saveEmail={saveEmail}
                  deleteEmail={() => setShowConfirmDelete(true)} closeEmail={closeEmail}
                  showConfirmDelete={showConfirmDelete} confirmDelete={deleteEmail} cancelDelete={() => setShowConfirmDelete(false)} contacts={contacts} />
              ) : (
                <MailListView activeNav={activeNav} showAllAccounts={showAllAccounts} activeTab={activeTab}
                  setActiveTab={setActiveTab} setChecked={setChecked} checked={checked} toggleAll={toggleAll}
                  displayEmails={displayEmails} randomKey={randomKey} setRandomKey={setRandomKey}
                  setShowAllAccounts={setShowAllAccounts} dateMenuOpen={dateMenuOpen} setDateMenuOpen={setDateMenuOpen}
                  dateSort={dateSort} setDateSort={setDateSort} openEmail={openEmail} toggleCheck={toggleCheck}
                  toggleStar={toggleStar} starred={starred} promotionCount={promotionCount} />
              )
            ) : activeApp === 'calendar' ? (
              <CalendarView calYear={calYear} calMonth={calMonth} setCalYear={setCalYear} setCalMonth={setCalMonth}
                today={today} firstDay={firstDay} daysInMonth={daysInMonth} monthNames={monthNames} dayNames={dayNames}
                monthKey={monthKey} events={events} selectedDay={selectedDay} setSelectedDay={setSelectedDay}
                newEventTitle={newEventTitle} setNewEventTitle={setNewEventTitle} addEvent={addEvent} />
            ) : activeApp === 'drive' ? (
              editingDriveFile && driveFileDraft ? (
                <DriveFileEditor file={driveFileDraft} onChange={updateDriveFileDraft} onSave={saveDriveFile}
                  onDelete={() => deleteDriveFile(driveFileDraft.id)} onCancel={() => { setEditingDriveFile(null); setDriveFileDraft(null); setEditingDriveLinkedPhoto(null); }}
                  linkedPhoto={editingDriveLinkedPhoto} onPhotoChange={updateDriveLinkedPhoto} contacts={contacts} />
              ) : (
                <DriveView driveSearch={driveSearch} setDriveSearch={setDriveSearch} driveFiles={filteredDrive}
                  driveFilter={driveFilter} setDriveFilter={setDriveFilter}
                  onUpload={handleDriveUpload} onEdit={startEditDriveFile} onDelete={deleteDriveFile} />
                )
              ) : activeApp === 'photos' ? (
              editingPhoto && photoDraft ? (
                <PhotoEditor photo={photoDraft} onChange={updatePhotoDraft} onSave={savePhotoDraft}
                  onDelete={() => deletePhoto(photoDraft.id)} onCancel={cancelPhotoEdit} contacts={contacts} />
              ) : (
                <PhotosView photos={photos} onUpload={handlePhotoUpload} onEdit={startEditPhoto} onDelete={deletePhoto} />
              )
            ) : activeApp === 'contacts' ? (
              contactDraft ? (
                <ContactEditor contact={contactDraft} updateContact={updateContact} saveContact={saveContact}
                  deleteContact={deleteContact} closeContact={closeContact}
                  showConfirmDelete={showContactConfirmDelete} setShowConfirmDelete={setShowContactConfirmDelete} />
              ) : (
                <ContactsListView contacts={contacts} onOpen={openContact} onAdd={addNewContact} />
              )
            ) : null}
          </div>
        </div>
      </div>

      {/* Profile Editor Modal */}
      {editingProfile && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setEditingProfile(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-[fadeIn_0.15s_ease]" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium">Profile Settings</h2>
                <button onClick={() => setEditingProfile(false)} className="p-1 rounded-full hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-center mb-4">
                  <input ref={profileAvatarRef} type="file" accept="image/*" onChange={handleProfileAvatarUpload} className="hidden" />
                  {profileDraft.avatar_path ? (
                    <div className="relative group cursor-pointer" onClick={() => profileAvatarRef.current?.click()}>
                      <img src={'/uploads/' + profileDraft.avatar_path} alt="" className="w-16 h-16 rounded-full object-cover" />
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100">Change</span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative group" onClick={() => profileAvatarRef.current?.click()}>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ea4335] to-[#4285f4] flex items-center justify-center text-white text-2xl font-bold cursor-pointer">{profileDraft.name.charAt(0)}</div>
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100">Upload</span>
                      </div>
                    </div>
                  )}
                </div>
                <Field label="Name" value={profileDraft.name} onChange={(v: string) => setProfileDraft(p => ({ ...p, name: v }))} />
                <Field label="Email" value={profileDraft.email} onChange={(v: string) => setProfileDraft(p => ({ ...p, email: v }))} />
                <Field label="Phone" value={profileDraft.phone} onChange={(v: string) => setProfileDraft(p => ({ ...p, phone: v }))} />
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200">
                <button onClick={() => setEditingProfile(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-full">Cancel</button>
                <button onClick={async () => { setUserProfile({ ...profileDraft }); try { await api.updateProfileApi(profileDraft); } catch {} setEditingProfile(false); }} className="px-4 py-2 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full">Save</button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } @keyframes splashPop { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } } @keyframes splashFade { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// ─── Mail Sub-Components ───
function MailListView({ activeNav, showAllAccounts, activeTab, setActiveTab, checked, toggleAll, displayEmails, randomKey, setRandomKey, setShowAllAccounts, dateMenuOpen, setDateMenuOpen, dateSort, setDateSort, openEmail, toggleCheck, toggleStar, starred, promotionCount, setChecked }: any) {
  return (
    <>
      {activeNav === 'inbox' && !showAllAccounts && (
        <div className="flex items-center border-b border-gray-200 flex-shrink-0 px-4">
          <button onClick={() => { setActiveTab('primary'); setChecked(new Set()); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'primary' ? 'border-[#0b57d0] text-[#0b57d0]' : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
            <Inbox size={16} /><span>Primary</span>
          </button>
          <button onClick={() => { setActiveTab('promotions'); setChecked(new Set()); }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'promotions' ? 'border-[#0b57d0] text-[#0b57d0]' : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}>
            <Tag size={16} /><span>Promotions</span>
            <span className="text-[11px] font-medium bg-[#ea4335] text-white px-1.5 py-0.5 rounded-full leading-none">{promotionCount}</span>
          </button>
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600">
            <CheckboxIcon checked={checked.size === displayEmails.length && displayEmails.length > 0} onChange={() => toggleAll(displayEmails.map((e: Email) => e.id))} />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"><ChevronDown size={16} /></button>
        </div>
        <button onClick={() => setRandomKey((p: number) => p + 1)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
          <MoreHorizontal size={16} /><span>Random Page</span>
        </button>
        <button onClick={() => setShowAllAccounts((p: boolean) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full ${showAllAccounts ? 'bg-[#d3e3fd] text-[#0b57d0]' : 'text-gray-600 hover:bg-gray-100'}`}>
          <CircleUser size={16} /><span>All Accounts</span><ChevronDown size={14} />
        </button>
        <div className="relative">
          <button onClick={() => setDateMenuOpen((p: boolean) => !p)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
            <CalendarDays size={16} /><span>Date</span><ChevronDown size={14} />
          </button>
          {dateMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDateMenuOpen(false)} />
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 w-36">
                <button onClick={() => { setDateSort('newest'); setDateMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${dateSort === 'newest' ? 'font-semibold text-[#0b57d0]' : 'text-gray-700'}`}>Newest first</button>
                <button onClick={() => { setDateSort('oldest'); setDateMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${dateSort === 'oldest' ? 'font-semibold text-[#0b57d0]' : 'text-gray-700'}`}>Oldest first</button>
              </div>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">{displayEmails.length > 0 ? `1-${displayEmails.length} of ${displayEmails.length}` : '0 of 0'}</span>
          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-30" disabled={displayEmails.length <= 1}><ChevronLeft size={16} /></button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-30" disabled={displayEmails.length <= 1}><ChevronRightNav size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {displayEmails.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <Inbox size={48} className="opacity-40" /><p className="text-sm">No emails found</p>
          </div>
        )}
        {displayEmails.map((email: Email) => (
          <div key={`${email.id}-${randomKey}`} onClick={() => openEmail(email)}
            className="flex items-center gap-3 px-4 py-0 border-b border-gray-100 hover:bg-[#f2f6fc] cursor-pointer group h-11">
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className={`${checked.has(email.id) ? '' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <CheckboxIcon checked={checked.has(email.id)} onChange={() => toggleCheck(email.id)} />
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleStar(email.id); }} className="p-0.5">
                <Star size={16} className={`transition-colors ${starred.has(email.id) ? 'fill-[#fbbc04] text-[#fbbc04]' : 'text-transparent group-hover:text-gray-400'}`} />
              </button>
            </div>
            <span className="text-[11px] text-gray-500 w-6 text-right flex-shrink-0">{email.viewCount}</span>
            <span className="text-[11px] text-gray-500 w-5 flex-shrink-0">{email.senderCount}</span>
            {email.hasAttachment && <Paperclip size={14} className="text-gray-400 flex-shrink-0" />}
            <span className={`text-sm w-44 flex-shrink-0 truncate ${email.read ? 'text-gray-700' : 'font-bold text-gray-900'}`}>
              {email.folder === 'sent' ? `to ${email.to_name || email.to_email}` : email.sender}
            </span>
            <div className="flex-1 min-w-0 flex items-baseline gap-1.5">
              <span className={`text-sm truncate flex-shrink-0 max-w-[280px] ${email.read ? '' : 'font-bold text-gray-900'}`}>{email.subject}</span>
              <span className="text-xs text-gray-500 truncate">– {email.preview}</span>
            </div>
            <span className="text-xs text-gray-500 w-14 text-right flex-shrink-0">{email.dateLabel}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function EmailEditor({ draft, updateDraft, saveEmail, deleteEmail, closeEmail, showConfirmDelete, confirmDelete, cancelDelete, contacts }: any) {
  const [mentionInput, setMentionInput] = useState('');
  const existingMentions: string[] = (draft.body || '').match(/@(\w+(?:\s\w+)*)/g) || [];
  const uniqueMentions = [...new Set(existingMentions.map(m => m.slice(1)))];
  const availableContacts = contacts.filter((c: Contact) => !uniqueMentions.includes(c.name));
  const addMention = (name: string) => {
    updateDraft('body', (draft.body || '') + '@' + name + ' ');
    setMentionInput('');
  };
  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <button onClick={closeEmail} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={16} /><span>Back</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={saveEmail} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full">
            <Save size={15} /><span>Save</span>
          </button>
          <button onClick={deleteEmail} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[#ea4335] hover:bg-[#d93025] rounded-full">
            <Trash2 size={15} /><span>Delete</span>
          </button>
        </div>
      </div>
      {showConfirmDelete && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-b border-red-200 text-sm">
          <span className="text-red-700">Delete this email permanently?</span>
          <button onClick={confirmDelete} className="px-3 py-1 text-sm font-medium text-white bg-[#ea4335] hover:bg-[#d93025] rounded-md">Delete</button>
          <button onClick={cancelDelete} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded-md">Cancel</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="From Name" value={draft.sender} onChange={(v: string) => updateDraft('sender', v)} />
          <Field label="From Email" value={draft.from} onChange={(v: string) => updateDraft('from', v)} />
          <Field label="To Name" value={draft.to_name} onChange={(v: string) => updateDraft('to_name', v)} />
          <Field label="To Email" value={draft.to_email} onChange={(v: string) => updateDraft('to_email', v)} />
        </div>
        <Field label="Subject" value={draft.subject} onChange={(v: string) => updateDraft('subject', v)} />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Body <span className="text-gray-400 font-normal normal-case">(type @name to mention someone)</span></label>
          <textarea value={draft.body} onChange={(e: any) => updateDraft('body', e.target.value)}
            className="w-full h-48 p-3 border border-gray-300 rounded-lg text-sm font-['Roboto',monospace] outline-none resize-y focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0]" />
        </div>
        {/* Mention people */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Mention People (@)</label>
          {uniqueMentions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {uniqueMentions.map((name: string) => (
                <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#d3e3fd] text-[#0b57d0] text-xs rounded-full">
                  @{name}
                </span>
              ))}
            </div>
          )}
          {availableContacts.length > 0 ? (
            <div className="relative">
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400 font-mono">@</span>
                <input type="text" placeholder="Search contacts..." value={mentionInput} onChange={e => setMentionInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0b57d0]" />
              </div>
              {mentionInput && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
                  {availableContacts
                    .filter((c: Contact) => c.name.toLowerCase().includes(mentionInput.toLowerCase()))
                    .map((c: Contact) => (
                      <button key={c.id} onClick={() => { addMention(c.name); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-medium"
                          style={{ background: colorFromId(c.id) }}>{c.name.charAt(0)}</div>
                        @{c.name}
                      </button>
                    ))}
                  {availableContacts.filter((c: Contact) => c.name.toLowerCase().includes(mentionInput.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-xs text-gray-400">No contacts match</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No contacts available. Add contacts first.</p>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
          <span>Folder: {draft.folder}</span><span>Type: {draft.type}</span><span>Views: {draft.viewCount}</span><span>Created: {draft.dateLabel}</span>
        </div>
      </div>
    </>
  );
}

// ─── Contacts ───
function ContactsListView({ contacts, onOpen, onAdd }: any) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-medium">Contacts</h2>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full">
          <UserPlus size={15} /><span>Add Contact</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c: Contact) => (
            <div key={c.id} onClick={() => onOpen(c)}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all cursor-pointer">
              {c.avatar_path ? (
                <img src={'/uploads/' + c.avatar_path} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: colorFromId(c.id) }}>{c.name.charAt(0)}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{c.name}</p>
                <p className="text-xs text-gray-500 truncate">{c.email}</p>
                <p className="text-xs text-gray-400">{c.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactEditor({ contact, updateContact, saveContact, deleteContact, closeContact, showConfirmDelete, setShowConfirmDelete }: any) {
  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <button onClick={closeContact} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={16} /><span>Back</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={saveContact} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full">
            <Save size={15} /><span>Save</span>
          </button>
          <button onClick={() => setShowConfirmDelete(true)} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[#ea4335] hover:bg-[#d93025] rounded-full">
            <Trash2 size={15} /><span>Delete</span>
          </button>
        </div>
      </div>
      {showConfirmDelete && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border-b border-red-200 text-sm">
          <span className="text-red-700">Delete this contact permanently?</span>
          <button onClick={deleteContact} className="px-3 py-1 text-sm font-medium text-white bg-[#ea4335] hover:bg-[#d93025] rounded-md">Delete</button>
          <button onClick={() => setShowConfirmDelete(false)} className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 rounded-md">Cancel</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-6 max-w-lg space-y-4">
        <Field label="Name" value={contact.name} onChange={(v: string) => updateContact('name', v)} />
        <Field label="Email" value={contact.email} onChange={(v: string) => updateContact('email', v)} />
        <Field label="Phone" value={contact.phone} onChange={(v: string) => updateContact('phone', v)} />
      </div>
    </>
  );
}

// ─── Calendar ───
function CalendarView({ calYear, calMonth, setCalYear, setCalMonth, today, firstDay, daysInMonth, monthNames, dayNames, monthKey, events, selectedDay, setSelectedDay, newEventTitle, setNewEventTitle, addEvent }: any) {
  const dayEvents = selectedDay ? events[`${monthKey}-${selectedDay}`] || [] : [];
  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">{monthNames[calMonth]} {calYear}</h2>
          <div className="flex gap-1">
            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}
              className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}
              className="p-2 rounded-full hover:bg-gray-100"><ChevronRightNav size={18} /></button>
            <button onClick={() => { setCalMonth(today.getMonth()); setCalYear(today.getFullYear()); }}
              className="ml-2 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full border border-gray-300">Today</button>
          </div>
        </div>
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((d: string) => <div key={d} className="text-xs text-gray-500 text-center py-1 font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 border-t border-l border-gray-200">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="border-r border-b border-gray-200 min-h-[80px]" />)}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
            const hasEvents = events[`${monthKey}-${day}`]?.length > 0;
            const isSelected = selectedDay === day;
            return (
              <div key={day} onClick={() => setSelectedDay(day)}
                className={`border-r border-b border-gray-200 min-h-[80px] p-1 cursor-pointer transition-colors ${isSelected ? 'bg-[#d3e3fd]' : 'hover:bg-gray-50'}`}>
                <div className={`w-7 h-7 flex items-center justify-center text-sm rounded-full ${isToday ? 'bg-[#0b57d0] text-white font-bold' : ''}`}>{day}</div>
                {hasEvents && <div className="flex flex-wrap gap-0.5 mt-1">{events[`${monthKey}-${day}`].slice(0, 2).map((e: any, i: number) =>
                  <div key={i} className="text-[10px] bg-[#c2e7ff] rounded px-1 truncate w-full">{e.title}</div>
                )}</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-64 border-l border-gray-200 p-4 flex-shrink-0 overflow-y-auto">
        <h3 className="text-sm font-medium mb-3">{selectedDay ? `${monthNames[calMonth]} ${selectedDay}` : 'Select a day'}</h3>
        {selectedDay && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input type="text" placeholder="Event title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0b57d0]" />
              <button onClick={addEvent} className="px-3 py-1.5 text-sm bg-[#0b57d0] text-white rounded-lg hover:bg-[#1a6ae0]">Add</button>
            </div>
            {dayEvents.length === 0 && <p className="text-xs text-gray-400">No events</p>}
            {dayEvents.map((e: any, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-[#f1f3f4] rounded-lg text-sm">
                <div className="w-2 h-2 rounded-full bg-[#0b57d0]" /><span>{e.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Drive ───
function DriveView({ driveSearch, setDriveSearch, driveFiles, driveFilter, setDriveFilter, onUpload, onEdit, onDelete }: any) {
  const fileColors: Record<string, string> = { image: '#34a853', video: '#7c4dff' };
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center bg-[#f1f3f4] rounded-full px-4 py-2 max-w-md flex-1">
          <SearchIcon size={16} className="text-gray-400 mr-2" />
          <input type="text" placeholder="Search files..." value={driveSearch} onChange={e => setDriveSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none" />
        </div>
        <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full cursor-pointer ml-2">
          <Upload size={15} /><span>Upload</span>
          <input type="file" accept="image/*,video/*" multiple onChange={onUpload} className="hidden" />
        </label>
        <div className="flex items-center gap-1 ml-2">
          {['photos', 'videos'].map(f => (
            <button key={f} onClick={() => setDriveFilter(f as 'photos' | 'videos')}
              className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize ${driveFilter === f ? 'bg-[#d3e3fd] text-[#0b57d0]' : 'text-gray-500 hover:bg-gray-100'}`}>
              {f === 'photos' ? '📷 Photos' : '🎬 Videos'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {driveFiles.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <FolderOpen size={48} className="opacity-40" />
              <p className="text-sm">No {driveFilter} found. Upload some!</p>
            </div>
          )}
          {driveFiles.map((item: DriveFile) => (
            <div key={item.id} onClick={() => onEdit(item)}
              className="relative group rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer">
              {item.dataUrl && item.type === 'image' ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={item.dataUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              ) : (
                <div className="aspect-[4/3] flex flex-col items-center justify-center gap-2" style={{ background: fileColors[item.type] + '15' }}>
                  <Video size={48} style={{ color: fileColors[item.type] }} />
                  <span className="text-[10px] text-gray-500 font-medium">Video file</span>
                </div>
              )}
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                <button onClick={(e: any) => { e.stopPropagation(); onEdit(item); }}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 transition-all"><FileText size={14} /></button>
                <button onClick={(e: any) => { e.stopPropagation(); onDelete(item.id); }}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded-full hover:bg-white text-[#ea4335] transition-all"><Trash2 size={14} /></button>
              </div>
              {/* Info bar */}
              <div className="p-2">
                <p className="text-xs font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-gray-400">{item.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Drive File Editor ───
function DriveFileEditor({ file, onChange, onSave, onDelete, onCancel, linkedPhoto, onPhotoChange, contacts }: any) {
  const [tagInput, setTagInput] = useState('');
  const isImage = file.type === 'image';
  const photoTags = linkedPhoto?.tags || [];
  const addTag = (name: string) => {
    if (!photoTags.includes(name)) onPhotoChange('tags', [...photoTags, name]);
  };
  const removeTag = (name: string) => {
    onPhotoChange('tags', photoTags.filter((t: string) => t !== name));
  };
  const availableContacts = contacts.filter((c: Contact) => !photoTags.includes(c.name));
  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={16} /><span>Back</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full">
            <Save size={15} /><span>Save</span>
          </button>
          <button onClick={onDelete} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[#ea4335] hover:bg-[#d93025] rounded-full">
            <Trash2 size={15} /><span>Delete</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg space-y-4">
          {isImage && file.dataUrl ? (
            <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
              <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full aspect-video rounded-xl bg-gray-50 flex items-center justify-center mb-4">
              <Video size={64} className="text-gray-300" />
            </div>
          )}
          <Field label="File Name" value={file.name || ''} onChange={(v: string) => onChange('name', v)} />
          {isImage && linkedPhoto && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date Taken" value={linkedPhoto.dateTaken || ''} onChange={(v: string) => onPhotoChange('dateTaken', v)} />
                <Field label="Time Taken" value={linkedPhoto.timeTaken || ''} onChange={(v: string) => onPhotoChange('timeTaken', v)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wider">Description</label>
                <textarea value={linkedPhoto.description || ''} onChange={(e: any) => onPhotoChange('description', e.target.value)}
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0]" />
              </div>
              {/* Tag people */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tag People</label>
                {photoTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {photoTags.map((t: string) => (
                      <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#d3e3fd] text-[#0b57d0] text-xs rounded-full">
                        {t}
                        <button onClick={() => removeTag(t)} className="hover:text-[#ea4335]">×</button>
                      </span>
                    ))}
                  </div>
                )}
                {availableContacts.length > 0 ? (
                  <div className="relative">
                    <input type="text" placeholder="Search contacts to tag..." value={tagInput} onChange={e => setTagInput(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0b57d0]" />
                    {tagInput && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
                        {availableContacts
                          .filter((c: Contact) => c.name.toLowerCase().includes(tagInput.toLowerCase()))
                          .map((c: Contact) => (
                            <button key={c.id} onClick={() => { addTag(c.name); setTagInput(''); }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-medium"
                                style={{ background: colorFromId(c.id) }}>{c.name.charAt(0)}</div>
                              {c.name}
                            </button>
                          ))}
                        {availableContacts.filter((c: Contact) => c.name.toLowerCase().includes(tagInput.toLowerCase())).length === 0 && (
                          <div className="px-3 py-2 text-xs text-gray-400">No contacts match</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No contacts available. Add contacts first.</p>
                )}
              </div>
            </>
          )}
          {isImage && !linkedPhoto && (
            <p className="text-xs text-gray-400 italic">No linked photo data (date, description, tags) available for this file.</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
            <span>Size: {file.size}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Photos ───
function PhotosView({ photos, onUpload, onEdit, onDelete }: any) {
  const grouped: Record<string, PhotoItem[]> = {};
  photos.forEach((p: PhotoItem) => {
    if (!grouped[p.month]) grouped[p.month] = [];
    grouped[p.month].push(p);
  });
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <h2 className="text-lg font-medium">Photos</h2>
        <label className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full cursor-pointer">
          <Upload size={15} /><span>Upload</span>
          <input type="file" accept="image/*" multiple onChange={onUpload} className="hidden" />
        </label>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(grouped).map(([month, monthPhotos]) => (
          <div key={month} className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-3">{month}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {monthPhotos.map((p: PhotoItem) => (
                <div key={p.id} className="relative rounded-xl overflow-hidden group aspect-[4/3] cursor-pointer"
                  style={{ background: colorFromId(p.id) }}>
                  {p.dataUrl ? (
                    <img src={p.dataUrl} alt={p.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center"><Image size={32} className="text-white/50" /></div>
                  )}
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2">
                    <button onClick={(e: any) => { e.stopPropagation(); onEdit(p); }}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 transition-all"><FileText size={14} /></button>
                    <button onClick={(e: any) => { e.stopPropagation(); onDelete(p.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2 bg-white/90 rounded-full hover:bg-white text-[#ea4335] transition-all"><Trash2 size={14} /></button>
                  </div>
                  {/* Bottom-right metadata */}
                  <div className="absolute bottom-0 right-0 p-1.5 text-right">
                    <span className="text-[10px] text-white font-medium block drop-shadow-lg">{p.label}</span>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-white/90 mt-0.5 drop-shadow-lg">
                      {p.dateTaken && <span>{p.dateTaken}{p.timeTaken ? ` ${p.timeTaken}` : ''}</span>}
                      {p.tags && p.tags.length > 0 && <span>👥 {p.tags.join(', ')}</span>}
                    </div>
                    {p.description && <div className="text-[9px] text-white/80 truncate max-w-[140px] drop-shadow-lg">{p.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PhotoEditor({ photo, onChange, onSave, onDelete, onCancel, contacts }: any) {
  const [tagInput, setTagInput] = useState('');
  const availableContacts = contacts.filter((c: Contact) => !(photo.tags || []).includes(c.name));
  const addTag = (name: string) => {
    if (!photo.tags?.includes(name)) onChange('tags', [...(photo.tags || []), name]);
  };
  const removeTag = (name: string) => {
    onChange('tags', (photo.tags || []).filter((t: string) => t !== name));
  };
  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={16} /><span>Back</span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onSave} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#1a6ae0] rounded-full">
            <Save size={15} /><span>Save</span>
          </button>
          <button onClick={onDelete} className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-[#ea4335] hover:bg-[#d93025] rounded-full">
            <Trash2 size={15} /><span>Delete</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg space-y-4">
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-gray-100 mb-4">
            {photo.dataUrl ? (
              <img src={photo.dataUrl} alt={photo.label} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: photo.color }}>
                <Image size={48} className="text-white/40" />
              </div>
            )}
          </div>
          <Field label="Photo Label" value={photo.label || ''} onChange={(v: string) => onChange('label', v)} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date Taken" value={photo.dateTaken || ''} onChange={(v: string) => onChange('dateTaken', v)} />
            <Field label="Time Taken" value={photo.timeTaken || ''} onChange={(v: string) => onChange('timeTaken', v)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wider">Description</label>
            <textarea value={photo.description || ''} onChange={(e: any) => onChange('description', e.target.value)}
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0]" />
          </div>
          {/* Tag people */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tag People</label>
            {(photo.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {(photo.tags || []).map((t: string) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#d3e3fd] text-[#0b57d0] text-xs rounded-full">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-[#ea4335]">×</button>
                  </span>
                ))}
              </div>
            )}
            {availableContacts.length > 0 ? (
              <div className="relative">
                <input type="text" placeholder="Search contacts to tag..." value={tagInput} onChange={e => setTagInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0b57d0]" />
                {tagInput && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
                    {availableContacts
                      .filter((c: Contact) => c.name.toLowerCase().includes(tagInput.toLowerCase()))
                      .map((c: Contact) => (
                        <button key={c.id} onClick={() => { addTag(c.name); setTagInput(''); }}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-medium"
                            style={{ background: colorFromId(c.id) }}>{c.name.charAt(0)}</div>
                          {c.name}
                        </button>
                      ))}
                    {availableContacts.filter((c: Contact) => c.name.toLowerCase().includes(tagInput.toLowerCase())).length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-400">No contacts match</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No contacts available. Add contacts first.</p>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
            <span>Month: {photo.month}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Person Detail View ───
function PersonDetailView({ person, emails, photos, onBack, onOpenEmail, onViewPhoto, contacts, onUploadAvatar, editingPersonAvatar, setEditingPersonAvatar, contactAvatarRef }: any) {
  const highlightMentions = (text: string) => {
    const parts = text.split(new RegExp(`(@${person.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase().includes('@' + person.name.toLowerCase()) ? (
        <span key={i} className="text-[#0b57d0] font-semibold">{part}</span>
      ) : part
    );
  };
  return (
    <>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={16} /><span>Back</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {/* Person card */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="relative group">
            {person.avatar_path ? (
              <img src={'/uploads/' + person.avatar_path} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: colorFromId(person.id) }}>
                {person.name.charAt(0)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1">
              <input ref={contactAvatarRef} type="file" accept="image/*" onChange={(e: any) => { setEditingPersonAvatar(person); setTimeout(() => onUploadAvatar(e)); }} className="hidden" />
              <button onClick={() => { setEditingPersonAvatar(person); contactAvatarRef.current?.click(); }}
                className="w-8 h-8 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center hover:bg-gray-50 text-xs text-gray-500">
                <Upload size={14} />
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-medium">{person.name}</h2>
            <p className="text-sm text-gray-500">{person.email}</p>
            <p className="text-sm text-gray-400">{person.phone}</p>
          </div>
        </div>

        {/* Emails section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Emails ({emails.length})</h3>
          {emails.length === 0 ? (
            <p className="text-xs text-gray-400">No emails from this person</p>
          ) : (
            <div className="space-y-1">
              {emails.slice(0, 10).map((email: Email) => {
                const isMentioned = email.body?.toLowerCase().includes('@' + person.name.toLowerCase()) || email.subject?.toLowerCase().includes('@' + person.name.toLowerCase());
                return (
                  <div key={email.id} onClick={() => onOpenEmail(email)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                    <Mail size={14} className={isMentioned ? 'text-[#0b57d0]' : 'text-gray-400'} />
                    <span className={`text-sm truncate flex-1 ${email.read ? '' : 'font-bold'}`}>
                      {isMentioned ? highlightMentions(email.subject) : email.subject}
                    </span>
                    {isMentioned && <span className="text-[10px] font-medium text-[#0b57d0] bg-[#d3e3fd] px-1.5 py-0.5 rounded-full">@mentioned</span>}
                    <span className="text-xs text-gray-400 flex-shrink-0">{email.dateLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tagged Photos section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Tagged Photos ({photos.length})</h3>
          {photos.length === 0 ? (
            <p className="text-xs text-gray-400">No tagged photos</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((p: PhotoItem) => (
                <div key={p.id} onClick={() => onViewPhoto(p)}
                  className="relative rounded-xl overflow-hidden group cursor-pointer aspect-[4/3]"
                  style={{ background: colorFromId(p.id) }}>
                  {p.dataUrl ? (
                    <img src={p.dataUrl} alt={p.label} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center"><Image size={28} className="text-white/50" /></div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <span className="text-xs text-white truncate block">{p.label}</span>
                    <span className="text-[10px] text-white/70">Tagged: {p.tags?.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Helpers ───
function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-0.5 uppercase tracking-wider">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0]" />
    </div>
  );
}

function CheckboxIcon({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-[#0b57d0] border-[#0b57d0]' : 'border-gray-400 hover:border-gray-600'}`}>
        {checked && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-white"><path d="M3 6l2 2 4-4" stroke="white" strokeWidth="2" fill="none" /></svg>}
      </div>
    </label>
  );
}
