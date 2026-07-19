import { useState, useEffect } from 'react';
import { pdfManager } from '../services/pdfManager';

interface SidebarProps {
  totalPages?: number;
  currentPage?: number;
  onPageSelect?: (page: number) => void;
}

// Dummy thumbnails for when no document is loaded
const DUMMY_PAGES = 5;

export function Sidebar({
  totalPages = 0,
  currentPage = 0,
  onPageSelect,
}: SidebarProps) {
  const hasDocument = totalPages > 0;
  const pages = hasDocument ? totalPages : DUMMY_PAGES;

  // State for real thumbnails (data URLs)
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loadingThumbs, setLoadingThumbs] = useState(false);

  // Generate thumbnails when document is loaded
  useEffect(() => {
    if (!hasDocument) {
      setThumbnails({});
      return;
    }

    let cancelled = false;
    setLoadingThumbs(true);

    const generateThumbs = async () => {
      const thumbs: Record<number, string> = {};
      for (let i = 1; i <= totalPages; i++) {
        if (cancelled) return;
        try {
          const dataUrl = await pdfManager.generateThumbnail(i, 120);
          if (!cancelled) {
            thumbs[i] = dataUrl;
            setThumbnails({ ...thumbs });
          }
        } catch (e) {
          console.error(`Sidebar: Error generating thumbnail for page ${i}`, e);
        }
      }
      if (!cancelled) {
        setLoadingThumbs(false);
      }
    };

    generateThumbs();

    return () => {
      cancelled = true;
    };
  }, [hasDocument, totalPages]);

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        {hasDocument
          ? `${pages} Pages${loadingThumbs ? ' (loading...)' : ''}`
          : 'No Document'}
      </div>
      <div className="thumbnail-list">
        {Array.from({ length: pages }, (_, i) => {
          const pageNum = i + 1;
          const isActive = pageNum === currentPage;
          const thumb = thumbnails[pageNum];

          return (
            <div
              key={pageNum}
              className={`thumbnail-item ${isActive ? 'active' : ''}`}
              onClick={() => onPageSelect?.(pageNum)}
            >
              <div className="thumbnail-placeholder">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={`Page ${pageNum}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : hasDocument ? (
                  '...'
                ) : (
                  `Page ${pageNum}`
                )}
              </div>
              <div className="thumbnail-label">{pageNum}</div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}