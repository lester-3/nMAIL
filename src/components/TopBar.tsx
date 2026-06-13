interface TopBarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function TopBar({ search, onSearchChange }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-logo">
        <div className="topbar-logo-icon">N</div>
        <span>nmail</span>
      </div>
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search mail"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="topbar-actions">
        <button className="icon-btn" title="Settings">⚙️</button>
        <button className="icon-btn" title="Support">❓</button>
        <button className="avatar-btn" title="Account">M</button>
      </div>
    </header>
  );
}
