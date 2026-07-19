import { useRef, useEffect } from 'react';
import { pdfManager } from '../services/pdfManager';

interface WorkspaceProps {
  hasDocument?: boolean;
  currentPage?: number;
  zoomLevel?: number;
  isLoading?: boolean;
  error?: string | null;
}

export function Workspace({
  hasDocument = false,
  currentPage = 0,
  zoomLevel = 100,
  isLoading = false,
  error = null,
}: WorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render page when currentPage or zoomLevel changes
  useEffect(() => {
    if (!hasDocument || !canvasRef.current || currentPage === 0) return;

    const renderPage = async () => {
      try {
        const scale = zoomLevel / 100;
        await pdfManager.renderPage(currentPage, canvasRef.current!, scale);
      } catch (e) {
        console.error('Workspace: Render error', e);
      }
    };

    renderPage();
  }, [hasDocument, currentPage, zoomLevel]);

  // Empty state — no document loaded
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

  // Error state
  if (error) {
    return (
      <div className="app-workspace">
        <div className="workspace-empty">
          <div className="workspace-empty-icon">⚠</div>
          <div className="workspace-empty-text">
            Error loading document
          </div>
          <div className="workspace-empty-hint">
            {error}
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="app-workspace">
        <div className="workspace-empty">
          <div className="workspace-empty-icon">⏳</div>
          <div className="workspace-empty-text">
            Loading document...
          </div>
        </div>
      </div>
    );
  }

  // Document loaded — render canvas
  return (
    <div className="app-workspace">
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          background: '#fff',
        }}
      />
    </div>
  );
}