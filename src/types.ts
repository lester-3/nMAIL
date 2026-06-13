export interface Email {
  id: string;
  from_name: string;
  from_email: string;
  to_name: string;
  to_email: string;
  subject: string;
  body: string;
  folder: string;
  starred: number;
  read: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailPayload {
  from_name: string;
  from_email: string;
  to_name?: string;
  to_email: string;
  subject: string;
  body: string;
  folder?: string;
}

export interface FolderStat {
  folder: string;
  count: number;
}

export interface FolderStats {
  total: FolderStat[];
  unread: FolderStat[];
}

export const FOLDERS = [
  { key: 'inbox', label: 'Inbox', icon: 'inbox' },
  { key: 'starred', label: 'Starred', icon: 'star' },
  { key: 'sent', label: 'Sent', icon: 'send' },
  { key: 'drafts', label: 'Drafts', icon: 'draft' },
  { key: 'trash', label: 'Trash', icon: 'delete' },
] as const;
