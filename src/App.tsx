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
import { pdfManager } from './services/pdfManager';

function App() {
  // Theme state — managed by themeManager
  const [theme, setTheme] = useState(themeManager.getTheme());

  // Document state
  const [hasDocument, setHasDocument] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(configManager.get('defaultZoom'));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Open file dialog and load PDF
  const handleOpen = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Use CEP file dialog via CSInterface
      let filePath = '';
      let fileName = '';

      // @ts-ignore
      if (typeof CSInterface !== 'undefined') {
        // @ts-ignore
        const cs = new CSInterface();

        // Use ExtendScript to open file dialog
        const script = `
          var file = File.openDialog("Select PDF File", "*.pdf", false);
          if (file) {
            file.fsName + "|" + file.name;
          } else {
            "";
          }
        `;

        const result = await new Promise<string>((resolve) => {
          // @ts-ignore
          cs.evalScript(script, resolve);
        });

        if (result && result !== 'EvalScript error.') {
          const parts = result.split('|');
          filePath = parts[0] || '';
          fileName = parts[1] || '';
        }
      }

      if (!filePath) {
        setIsLoading(false);
        return;
      }

      // Convert Windows path to file:// URL for fetch
      const fileUrl = 'file:///' + filePath.replace(/\\/g, '/').replace(/^\//, '');

      // Load PDF with pdfManager
      const info = await pdfManager.loadDocument(fileUrl, fileName);

      setHasDocument(true);
      setDocumentName(info.fileName);
      setTotalPages(info.numPages);
      setCurrentPage(1);
      setZoomLevel(configManager.get('defaultZoom'));

      // Save to recent files
      storageManager.addRecentFile(filePath, fileName);
    } catch (e) {
      console.error('App: Error opening PDF', e);
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
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
    // Actual search will be handled by pdfManager
    if (hasDocument && query.trim()) {
      pdfManager.search(query).catch(console.error);
    }
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
          currentPage={currentPage}
          zoomLevel={zoomLevel}
          isLoading={isLoading}
          error={error}
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