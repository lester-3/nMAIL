import { useState } from 'react';
import { createEmail } from '../api';

interface ComposeModalProps {
  onClose: () => void;
  onSent: () => void;
}

export default function ComposeModal({ onClose, onSent }: ComposeModalProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || sending) return;
    setSending(true);
    try {
      await createEmail({
        from_name: 'Me',
        from_email: 'me@nmail.com',
        to_email: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
        folder: 'sent',
      });
      onSent();
      onClose();
    } catch (err) {
      console.error('Failed to send email', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="compose-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compose-header">
          <h2>New Message</h2>
          <button className="compose-close" onClick={onClose}>×</button>
        </div>
        <div className="compose-body" onKeyDown={handleKeyDown}>
          <div className="compose-field">
            <label>To</label>
            <input
              type="email"
              placeholder="Recipients"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              autoFocus
            />
          </div>
          <div className="compose-field">
            <label>Subject</label>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="compose-textarea">
            <textarea
              placeholder="Write your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
        </div>
        <div className="compose-footer">
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!to.trim() || !subject.trim() || sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Ctrl+Enter to send
          </span>
        </div>
      </div>
    </div>
  );
}
