import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { Workspace } from './components/Workspace';
import { Footer } from './components/Footer';

function App() {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Document state (dummy for Phase 2)
  const [hasDocument, setHasDocument] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Host info state (from Phase 1)
  const [hostInfo, setHostInfo] = useState('Connecting...');

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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

  // Dummy handlers for Phase 2
  const handleOpen = () => {
    // Phase 4: Will open file dialog and load PDF
    setHasDocument(true);
    setDocumentName('sample.pdf');
    setTotalPages(5);
    setCurrentPage(1);
    setZoomLevel(100);
  };

  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(z + 25, 400));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(z - 25, 25));
  };

  const handleZoomFit = () => setZoomLevel(100);
  const handleZoomWidth = () => setZoomLevel(150);

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    // Phase 4: Will search in PDF
    console.log('Search:', query);
  };

  const handleToggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
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