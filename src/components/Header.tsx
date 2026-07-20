interface HeaderProps {
  onToggleTheme?: () => void;
  onToggleSidebar?: () => void;
  onOpenSettings?: () => void;
  theme?: 'dark' | 'light';
  sidebarVisible?: boolean;
}

export function Header({
  onToggleTheme,
  onToggleSidebar,
  onOpenSettings,
  theme = 'dark',
  sidebarVisible = true,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-logo">P</div>
        <span className="header-title">PDF Viewer</span>
      </div>
      <div className="header-right">
        <button
          className={`header-btn ${sidebarVisible ? 'active' : ''}`}
          onClick={onToggleSidebar}
          title={sidebarVisible ? 'Hide thumbnails' : 'Show thumbnails'}
        >
          {sidebarVisible ? '◧' : '▯'}
        </button>
        <button
          className="header-btn"
          onClick={onToggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <button className="header-btn" onClick={onOpenSettings} title="Settings">
          ⚙
        </button>
      </div>
    </header>
  );
}