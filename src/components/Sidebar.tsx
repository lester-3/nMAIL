import { FOLDERS, type FolderStats } from '../types';

interface SidebarProps {
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  onCompose: () => void;
  stats: FolderStats | null;
}

export default function Sidebar({ currentFolder, onFolderChange, onCompose, stats }: SidebarProps) {
  const getCount = (folder: string): number | null => {
    if (folder === 'starred') return null;
    if (folder === 'drafts') return null;
    if (folder === 'trash') return null;
    if (!stats) return null;

    if (folder === 'inbox') {
      const unread = stats.unread.find((s) => s.folder === 'inbox');
      return unread?.count ?? 0;
    }
    return null;
  };

  return (
    <nav className="sidebar">
      <button className="compose-btn" onClick={onCompose}>
        <span className="icon">✏️</span>
        Compose
      </button>

      {FOLDERS.map((f) => {
        const count = getCount(f.key);
        const isActive = currentFolder === f.key;

        return (
          <div
            key={f.key}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onFolderChange(f.key)}
          >
            <span className="icon">
              {f.icon === 'inbox' && '📥'}
              {f.icon === 'star' && '⭐'}
              {f.icon === 'send' && '📤'}
              {f.icon === 'draft' && '📝'}
              {f.icon === 'delete' && '🗑️'}
            </span>
            <span className="label">{f.label}</span>
            {count !== null && count > 0 && <span className="count">{count}</span>}
          </div>
        );
      })}

      <div className="nav-section-title">Labels</div>
      <div className="nav-item">
        <span className="icon">🏷️</span>
        <span className="label">Important</span>
      </div>
      <div className="nav-item">
        <span className="icon">📌</span>
        <span className="label">Personal</span>
      </div>
      <div className="nav-item">
        <span className="icon">💼</span>
        <span className="label">Work</span>
      </div>
    </nav>
  );
}
