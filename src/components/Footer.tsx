interface FooterProps {
  currentPage?: number;
  totalPages?: number;
  zoomLevel?: number;
  documentName?: string;
  status?: 'idle' | 'loading' | 'ready' | 'error';
  statusMessage?: string;
}

export function Footer({
  currentPage = 0,
  totalPages = 0,
  zoomLevel = 100,
  documentName = '',
  status = 'idle',
  statusMessage = '',
}: FooterProps) {
  const hasDocument = totalPages > 0;

  return (
    <footer className="app-footer">
      <div className="footer-left">
        <span>
          {hasDocument
            ? `${documentName} | Page ${currentPage} / ${totalPages}`
            : 'No document loaded'}
        </span>
      </div>
      <div className="footer-right">
        <span>{hasDocument ? `${zoomLevel}%` : ''}</span>
        <div className="footer-status">
          <span className={`status-dot ${status}`} />
          <span>{statusMessage || status}</span>
        </div>
      </div>
    </footer>
  );
}