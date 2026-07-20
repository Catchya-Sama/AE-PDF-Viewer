import type { RecentFile } from '../services/storageManager';

interface RecentFilesProps {
  files: RecentFile[];
  isOpen: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onOpen: (file: RecentFile) => void;
  onRemove: (path: string) => void;
  onClear: () => void;
}

export function RecentFiles({
  files,
  isOpen,
  disabled = false,
  onToggle,
  onOpen,
  onRemove,
  onClear,
}: RecentFilesProps) {
  return (
    <div className="recent-files-control">
      <button
        className={`toolbar-btn recent-toggle ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        disabled={disabled}
        title="Recent PDF files"
      >
        ▾
      </button>

      {isOpen && (
        <section className="recent-files-menu" aria-label="Recent PDF files">
          <div className="recent-files-header">
            <strong>Recent PDFs</strong>
            {files.length > 0 && <button onClick={onClear}>Clear</button>}
          </div>
          <div className="recent-files-list">
            {files.length === 0 ? (
              <div className="recent-files-empty">No recent PDF files.</div>
            ) : (
              files.map((file) => (
                <div className="recent-file-row" key={file.path}>
                  <button className="recent-file-open" onClick={() => onOpen(file)} title={file.path}>
                    <span className="recent-file-name">{file.name}</span>
                    <span className="recent-file-path">{file.path}</span>
                  </button>
                  <button
                    className="recent-file-remove"
                    onClick={() => onRemove(file.path)}
                    title="Remove from recent files"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}