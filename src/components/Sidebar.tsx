interface SidebarProps {
  totalPages?: number;
  currentPage?: number;
  onPageSelect?: (page: number) => void;
}

// Dummy thumbnails for Phase 2 prototype
const DUMMY_PAGES = 5;

export function Sidebar({
  totalPages = 0,
  currentPage = 0,
  onPageSelect,
}: SidebarProps) {
  const pages = totalPages > 0 ? totalPages : DUMMY_PAGES;
  const hasDocument = totalPages > 0;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        {hasDocument ? `${pages} Pages` : 'No Document'}
      </div>
      <div className="thumbnail-list">
        {Array.from({ length: pages }, (_, i) => {
          const pageNum = i + 1;
          const isActive = pageNum === currentPage;
          return (
            <div
              key={pageNum}
              className={`thumbnail-item ${isActive ? 'active' : ''}`}
              onClick={() => onPageSelect?.(pageNum)}
            >
              <div className="thumbnail-placeholder">
                {hasDocument ? `Page ${pageNum}` : `Page ${pageNum}`}
              </div>
              <div className="thumbnail-label">{pageNum}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}