import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { Workspace } from './components/Workspace';
import { Footer } from './components/Footer';
import { themeManager } from './services/themeManager';
import { configManager } from './services/configManager';
import { eventBus, EVENTS } from './services/eventBus';
import { storageManager } from './services/storageManager';

function App() {
  // Theme state — now managed by themeManager
  const [theme, setTheme] = useState(themeManager.getTheme());

  // Document state (dummy for Phase 2/3)
  const [hasDocument, setHasDocument] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(configManager.get('defaultZoom'));

  // Host info state (from Phase 1)
  const [hostInfo, setHostInfo] = useState('Connecting...');

  // Subscribe to theme changes from themeManager
  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.THEME_CHANGED, (newTheme: 'dark' | 'light') => {
      setTheme(newTheme);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Ping the ExtendScript host bridge
    try {
      // @ts-ignore
      if (typeof CSInterface !== 'undefined') {
        // @ts-ignore
        const cs = new CSInterface();
        // @ts-ignore
        cs.evalScript('getHostInfo()', (result: string) => {
          if (result && result !== 'EvalScript error.') {
            try {
              const info = JSON.parse(result);
              setHostInfo(
                `${info.appName} v${info.appVersion} | Project: ${info.projectName || 'None'}`
              );
            } catch {
              setHostInfo('Could not parse host info');
            }
          } else {
            setHostInfo('host.jsx not loaded');
          }
        });
      } else {
        setHostInfo('Running outside CEP');
      }
    } catch (e) {
      setHostInfo('Bridge error: ' + String(e));
    }
  }, []);

  // Dummy handlers for Phase 2/3
  const handleOpen = () => {
    // Phase 4: Will open file dialog and load PDF
    setHasDocument(true);
    setDocumentName('sample.pdf');
    setTotalPages(5);
    setCurrentPage(1);
    setZoomLevel(configManager.get('defaultZoom'));

    // Emit event for other components
    eventBus.emit(EVENTS.DOCUMENT_OPENED, { name: 'sample.pdf', pages: 5 });

    // Save to recent files
    storageManager.addRecentFile('/dummy/sample.pdf', 'sample.pdf');
  };

  const handleZoomIn = () => {
    const maxZoom = configManager.get('maxZoom');
    const step = configManager.get('zoomStep');
    setZoomLevel((z) => {
      const newZoom = Math.min(z + step, maxZoom);
      eventBus.emit(EVENTS.ZOOM_CHANGED, newZoom);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    const minZoom = configManager.get('minZoom');
    const step = configManager.get('zoomStep');
    setZoomLevel((z) => {
      const newZoom = Math.max(z - step, minZoom);
      eventBus.emit(EVENTS.ZOOM_CHANGED, newZoom);
      return newZoom;
    });
  };

  const handleZoomFit = () => {
    const defaultZoom = configManager.get('defaultZoom');
    setZoomLevel(defaultZoom);
    eventBus.emit(EVENTS.ZOOM_CHANGED, defaultZoom);
  };

  const handleZoomWidth = () => setZoomLevel(150);

  const handlePrevPage = () => {
    setCurrentPage((p) => {
      const newPage = Math.max(p - 1, 1);
      eventBus.emit(EVENTS.PAGE_CHANGED, newPage);
      return newPage;
    });
  };

  const handleNextPage = () => {
    setCurrentPage((p) => {
      const newPage = Math.min(p + 1, totalPages);
      eventBus.emit(EVENTS.PAGE_CHANGED, newPage);
      return newPage;
    });
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
    eventBus.emit(EVENTS.PAGE_CHANGED, page);
  };

  const handleSearch = (query: string) => {
    eventBus.emit(EVENTS.SEARCH_QUERY, query);
  };

  const handleToggleTheme = () => {
    themeManager.toggleTheme();
  };

  return (
    <div className="app">
      <Header onToggleTheme={handleToggleTheme} theme={theme} />
      <div className="app-main">
        <Sidebar
          totalPages={totalPages}
          currentPage={currentPage}
          onPageSelect={handlePageSelect}
        />
        <Toolbar
          onOpen={handleOpen}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomFit={handleZoomFit}
          onZoomWidth={handleZoomWidth}
          onSearch={handleSearch}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          currentPage={currentPage}
          totalPages={totalPages}
          zoomLevel={zoomLevel}
          hasDocument={hasDocument}
        />
        <Workspace
          hasDocument={hasDocument}
          documentName={documentName}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        zoomLevel={zoomLevel}
        documentName={documentName}
        status={hasDocument ? 'ready' : 'idle'}
        statusMessage={hostInfo}
      />
    </div>
  );
}

export default App;