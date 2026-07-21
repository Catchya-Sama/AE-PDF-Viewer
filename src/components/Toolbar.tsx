interface ToolbarProps {
  onOpen?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  onZoomWidth?: () => void;
  onSearch?: (query: string) => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  currentPage?: number;
  totalPages?: number;
  zoomLevel?: number;
  hasDocument?: boolean;
}

export function Toolbar({
  onOpen,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomWidth,
  onSearch,
  onPrevPage,
  onNextPage,
  currentPage = 0,
  totalPages = 0,
  zoomLevel = 100,
  hasDocument = false,
}: ToolbarProps) {
  return (
    <div className="app-toolbar">
      {/* Open file */}
      <div className="toolbar-group">
        <button
          className="toolbar-btn primary"
          onClick={onOpen}
          title="Open PDF"
        >
          Open
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Page navigation */}
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onPrevPage}
          disabled={!hasDocument}
          title="Previous page"
        >
          ◀
        </button>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '40px', textAlign: 'center' }}>
          {hasDocument ? `${currentPage} / ${totalPages}` : '0 / 0'}
        </span>
        <button
          className="toolbar-btn"
          onClick={onNextPage}
          disabled={!hasDocument}
          title="Next page"
        >
          ▶
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Zoom controls */}
      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={onZoomOut}
          disabled={!hasDocument}
          title="Zoom out"
        >
          −
        </button>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '36px', textAlign: 'center' }}>
          {hasDocument ? `${zoomLevel}%` : '—'}
        </span>
        <button
          className="toolbar-btn"
          onClick={onZoomIn}
          disabled={!hasDocument}
          title="Zoom in"
        >
          +
        </button>
        <button
          className="toolbar-btn"
          onClick={onZoomFit}
          disabled={!hasDocument}
          title="Fit page"
        >
          Fit
        </button>
        <button
          className="toolbar-btn"
          onClick={onZoomWidth}
          disabled={!hasDocument}
          title="Fit width"
        >
          Width
        </button>
      </div>

      <div className="toolbar-spacer" />

      {/* Search */}
      <div className="toolbar-group">
        <input
          type="text"
          className="toolbar-input"
          placeholder="Search..."
          disabled={!hasDocument}
          onChange={(e) => onSearch?.(e.target.value)}
        />
      </div>
    </div>
  );
}