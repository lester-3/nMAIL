import { useState } from 'react';
import { updateEmail } from '../api';

interface EmailItem {
  id: string;
  from_name: string;
  from_email: string;
  subject: string;
  body: string;
  starred: number;
  read: number;
  created_at: string;
}

interface EmailListProps {
  emails: EmailItem[];
  selectedEmail: EmailItem | null;
  onSelectEmail: (email: EmailItem) => void;
  onRefresh: () => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'Z');
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function EmailList({ emails, selectedEmail, onSelectEmail, onRefresh }: EmailListProps): JSX.Element {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const toggleStar = async (e: React.MouseEvent, email: EmailItem) => {
    e.stopPropagation();
    await updateEmail(email.id, { starred: email.starred ? 0 : 1 });
    onRefresh();
  };

  const toggleCheck = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (checkedIds.size === emails.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(emails.map((e) => e.id)));
    }
  };

  return (
    <>
      <div className="list-toolbar">
        <div className="toolbar-left">
          <input
            type="checkbox"
            className="email-checkbox"
            checked={checkedIds.size === emails.length && emails.length > 0}
            onChange={selectAll}
          />
          <button className="toolbar-btn" title="Refresh" onClick={onRefresh}>🔄</button>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn" title="Previous">◀</button>
          <button className="toolbar-btn" title="Next">▶</button>
        </div>
      </div>

      <div className="email-list">
        {emails.length === 0 && (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>No emails found</p>
          </div>
        )}
        {emails.map((email) => (
          <div
            key={email.id}
            className={`email-item ${email.read ? '' : 'unread'} ${selectedEmail?.id === email.id ? 'selected' : ''}`}
            onClick={() => onSelectEmail(email)}
          >
            <input
              type="checkbox"
              className="email-checkbox"
              checked={checkedIds.has(email.id)}
              onChange={() => {}}
              onClick={(e) => toggleCheck(e, email.id)}
            />
            <button
              className={`email-star ${email.starred ? 'starred' : ''}`}
              onClick={(e) => toggleStar(e, email)}
            >
              ★
            </button>
            <div className="email-sender">{email.from_name || email.from_email}</div>
            <div className="email-subject-preview">
              <span className="email-subject">{email.subject}</span>
              {email.body && (
                <>
                  <span className="email-preview-sep">–</span>
                  <span className="email-preview">
                    {email.body.replace(/<[^>]*>/g, '').slice(0, 80)}
                  </span>
                </>
              )}
            </div>
            <div className="email-date">{formatDate(email.created_at)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
