import type { AppConfig } from '../services/configManager';
import type { Theme } from '../services/themeManager';

interface SettingsPanelProps {
  config: AppConfig;
  theme: Theme;
  onConfigChange: <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => void;
  onThemeChange: (theme: Theme) => void;
  onReset: () => void;
  onClose: () => void;
}

export function SettingsPanel({
  config,
  theme,
  onConfigChange,
  onThemeChange,
  onReset,
  onClose,
}: SettingsPanelProps) {
  return (
    <div className="settings-backdrop" onMouseDown={onClose}>
      <section className="settings-panel" onMouseDown={(event) => event.stopPropagation()}>
        <header className="settings-header">
          <strong>Settings</strong>
          <button onClick={onClose} title="Close settings">×</button>
        </header>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Appearance</h3>
            <label className="settings-row">
              <span>Theme</span>
              <select value={theme} onChange={(event) => onThemeChange(event.target.value as Theme)}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </label>
            <label className="settings-row">
              <span>Sidebar width</span>
              <select
                value={config.sidebarWidth}
                onChange={(event) => onConfigChange('sidebarWidth', Number(event.target.value))}
              >
                <option value={160}>Compact (160 px)</option>
                <option value={200}>Default (200 px)</option>
                <option value={240}>Wide (240 px)</option>
                <option value={280}>Extra wide (280 px)</option>
              </select>
            </label>
          </div>

          <div className="settings-section">
            <h3>Viewer</h3>
            <label className="settings-row">
              <span>Zoom step</span>
              <select
                value={config.zoomStep}
                onChange={(event) => onConfigChange('zoomStep', Number(event.target.value))}
              >
                <option value={10}>10%</option>
                <option value={25}>25%</option>
                <option value={50}>50%</option>
              </select>
            </label>
            <label className="settings-check">
              <input
                type="checkbox"
                checked={config.restoreLastSession}
                onChange={(event) => onConfigChange('restoreLastSession', event.target.checked)}
              />
              <span>Restore the last PDF when the panel opens</span>
            </label>
          </div>
        </div>

        <footer className="settings-footer">
          <button
            className="settings-reset"
            onClick={onReset}
            title="Reset preferences only; bookmarks and recent files are kept"
          >
            Reset preferences
          </button>
          <button className="settings-done" onClick={onClose}>Done</button>
        </footer>
      </section>
    </div>
  );
}