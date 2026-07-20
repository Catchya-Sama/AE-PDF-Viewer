import { useRef, useEffect } from 'react';
import { pdfManager } from '../services/pdfManager';

interface WorkspaceProps {
  hasDocument?: boolean;
  currentPage?: number;
  zoomLevel?: number;
  isLoading?: boolean;
  error?: string | null;
  zoomMode?: 'custom' | 'fit' | 'width';
  onZoomCalculated?: (zoom: number) => void;
}

export function Workspace({
  hasDocument = false,
  currentPage = 0,
  zoomLevel = 100,
  isLoading = false,
  error = null,
  zoomMode = 'custom',
  onZoomCalculated,
}: WorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const imageOverlayRef = useRef<HTMLDivElement>(null);

  // Render page when currentPage or zoomLevel changes
  useEffect(() => {
    if (!hasDocument || !canvasRef.current || currentPage === 0) return;

    let cancelled = false;
    const renderPage = async () => {
      try {
        let scale = zoomLevel / 100;
        if (zoomMode !== 'custom' && workspaceRef.current) {
          const dimensions = await pdfManager.getPageDimensions(currentPage);
          const availableWidth = Math.max(workspaceRef.current.clientWidth - 32, 1);
          const availableHeight = Math.max(workspaceRef.current.clientHeight - 32, 1);
          const widthScale = availableWidth / dimensions.width;
          scale = zoomMode === 'width'
            ? widthScale
            : Math.min(widthScale, availableHeight / dimensions.height);
          if (!cancelled) onZoomCalculated?.(Math.max(1, Math.round(scale * 100)));
        }
        if (cancelled) return;
        await pdfManager.renderPage(
          currentPage,
          canvasRef.current!,
          scale,
          imageOverlayRef.current || undefined
        );
      } catch (e) {
        console.error('Workspace: Render error', e);
      }
    };

    renderPage();
    const handleResize = () => renderPage();
    if (zoomMode !== 'custom') window.addEventListener('resize', handleResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', handleResize);
    };
  }, [hasDocument, currentPage, zoomLevel, zoomMode, onZoomCalculated]);

  // Error must be checked before the empty state. During a failed load,
  // hasDocument is still false; checking it first would hide the real error.
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

  // Loading must also be checked before the empty state because the document
  // is only marked as loaded after PDF.js has parsed it successfully.
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

  // Document loaded — render canvas
  return (
    <div className="app-workspace" ref={workspaceRef}>
      <div className="canvas-stage">
        <div className="pdf-page-frame">
          <canvas ref={canvasRef} className="pdf-canvas" />
          <div ref={imageOverlayRef} className="pdf-image-layer" />
        </div>
      </div>
    </div>
  );
}