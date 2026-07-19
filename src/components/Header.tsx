interface HeaderProps {
  onToggleTheme?: () => void;
  theme?: 'dark' | 'light';
}

export function Header({ onToggleTheme, theme = 'dark' }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-left">
        <div className="header-logo">P</div>
        <span className="header-title">PDF Viewer</span>
      </div>
      <div className="header-right">
        <button
          className="header-btn"
          onClick={onToggleTheme}
          title="Toggle theme"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  );
}