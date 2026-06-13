import { updateEmail as updateEmailApi, deleteEmailApi } from '../api';
import type { Email } from '../types';

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
  onRefresh: () => void;
}

function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr + 'Z');
  return date.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EmailDetail({ email, onBack, onRefresh }: EmailDetailProps) {
  const handleStar = async () => {
    await updateEmailApi(email.id, { starred: email.starred ? 0 : 1 });
    onRefresh();
  };

  const handleTrash = async () => {
    await updateEmailApi(email.id, { folder: 'trash' });
    onRefresh();
    onBack();
  };

  const handleDelete = async () => {
    await deleteEmailApi(email.id);
    onRefresh();
    onBack();
  };

  return (
    <div className="email-detail-container">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button className="icon-btn" onClick={onBack}>←</button>
        <button className="icon-btn" onClick={handleStar} title={email.starred ? 'Unstar' : 'Star'}>
          {email.starred ? '⭐' : '☆'}
        </button>
        <button className="icon-btn" onClick={handleTrash} title="Move to trash">🗑️</button>
        {email.folder === 'trash' && (
          <button className="icon-btn" onClick={handleDelete} title="Delete permanently">❌</button>
        )}
      </div>

      <div className="email-detail-header">
        <h1 className="email-detail-subject">{email.subject}</h1>
        <div className="email-detail-sender">
          <div className="email-detail-avatar">
            {(email.from_name ? email.from_name : email.from_email).charAt(0).toUpperCase()}
          </div>
          <div className="email-detail-from">
            <div className="email-detail-name">
              {email.from_name || email.from_email}
            </div>
            <div className="email-detail-email">
              {email.from_email}
            </div>
            <div className="email-detail-to">
              to {email.to_name || email.to_email}
            </div>
          </div>
          <div className="email-detail-date">
            {formatFullDate(email.created_at)}
          </div>
        </div>
      </div>

      <div
        className="email-detail-body"
        dangerouslySetInnerHTML={{ __html: email.body }}
      />
    </div>
  );
}
