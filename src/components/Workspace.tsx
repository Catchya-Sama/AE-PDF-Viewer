interface WorkspaceProps {
  hasDocument?: boolean;
  documentName?: string;
  currentPage?: number;
  totalPages?: number;
}

export function Workspace({
  hasDocument = false,
  documentName = '',
  currentPage = 0,
  totalPages = 0,
}: WorkspaceProps) {
  if (!hasDocument) {
    return (
      <div className="app-workspace">
        <div className="workspace-empty">
          <div className="workspace-empty-icon">📄</div>
          <div className="workspace-empty-text">
            No document loaded
          </div>
          <div className="workspace-empty-hint">
            Click "Open" to load a PDF file
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-workspace">
      <div className="workspace-empty">
        <div className="workspace-empty-icon">📄</div>
        <div className="workspace-empty-text">
          {documentName}
        </div>
        <div className="workspace-empty-hint">
          Page {currentPage} of {totalPages} — PDF rendering will be integrated in Phase 4
        </div>
      </div>
    </div>
  );
}