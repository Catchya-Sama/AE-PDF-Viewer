import { useState, useEffect } from 'react';
import { pdfManager } from '../services/pdfManager';
import type { PageBookmark } from '../services/storageManager';

interface SidebarProps {
  documentKey?: number;
  totalPages?: number;
  currentPage?: number;
  onPageSelect?: (page: number) => void;
  bookmarks?: PageBookmark[];
  onRemoveBookmark?: (page: number) => void;
}

// Dummy thumbnails for when no document is loaded
const DUMMY_PAGES = 5;

export function Sidebar({
  documentKey = 0,
  totalPages = 0,
  currentPage = 0,
  onPageSelect,
  bookmarks = [],
  onRemoveBookmark,
}: SidebarProps) {
  const hasDocument = totalPages > 0;
  const pages = hasDocument ? totalPages : DUMMY_PAGES;

  // State for real thumbnails (data URLs)
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loadingThumbs, setLoadingThumbs] = useState(false);
  const [activeTab, setActiveTab] = useState<'pages' | 'bookmarks'>('pages');

  useEffect(() => {
    setActiveTab('pages');
  }, [documentKey]);

  // Generate thumbnails when document is loaded
  useEffect(() => {
    if (!hasDocument) {
      setThumbnails({});
      return;
    }

    let cancelled = false;
    const thumbnailSession = pdfManager.createThumbnailSession();
    setThumbnails({});
    setLoadingThumbs(true);

    const generateThumbs = async () => {
      const thumbs: Record<number, string> = {};
      for (let i = 1; i <= totalPages; i++) {
        if (cancelled) return;
        try {
          const dataUrl = await pdfManager.generateThumbnail(i, 120, thumbnailSession);
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
  }, [hasDocument, totalPages, documentKey]);

  return (
    <aside className="app-sidebar">
      <div className="sidebar-tabs">
        <button className={activeTab === 'pages' ? 'active' : ''} onClick={() => setActiveTab('pages')}>
          Pages
        </button>
        <button
          className={activeTab === 'bookmarks' ? 'active' : ''}
          onClick={() => setActiveTab('bookmarks')}
          disabled={!hasDocument}
        >
          Bookmarks{bookmarks.length ? ` (${bookmarks.length})` : ''}
        </button>
      </div>
      {activeTab === 'pages' ? <>
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
      </> : (
        <div className="bookmark-list">
          {bookmarks.length === 0 ? (
            <div className="bookmark-empty">
              No bookmarks yet.<br />Open a page and click ☆ to save it.
            </div>
          ) : bookmarks.map((bookmark) => (
            <div className={`bookmark-row ${bookmark.page === currentPage ? 'active' : ''}`} key={bookmark.id}>
              <button className="bookmark-open" onClick={() => onPageSelect?.(bookmark.page)}>
                <span className="bookmark-star">★</span>
                <span>{bookmark.label}</span>
              </button>
              <button
                className="bookmark-remove"
                onClick={() => onRemoveBookmark?.(bookmark.page)}
                title="Remove bookmark"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}