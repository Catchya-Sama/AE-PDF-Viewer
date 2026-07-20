import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { Workspace } from './components/Workspace';
import { Footer } from './components/Footer';
import { SearchResults } from './components/SearchResults';
import { SettingsPanel } from './components/SettingsPanel';
import { themeManager } from './services/themeManager';
import { configManager } from './services/configManager';
import type { AppConfig } from './services/configManager';
import { eventBus, EVENTS } from './services/eventBus';
import {
  storageManager,
  type PageBookmark,
  type PdfSession,
  type RecentFile,
} from './services/storageManager';
import { pdfManager, type SearchResult } from './services/pdfManager';

function App() {
  // Theme state — managed by themeManager
  const [theme, setTheme] = useState(themeManager.getTheme());
  const [sidebarVisible, setSidebarVisible] = useState(
    configManager.get('sidebarVisible')
  );
  const [config, setConfig] = useState<AppConfig>(() => configManager.getAll());
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Document state
  const [hasDocument, setHasDocument] = useState(false);
  const [documentName, setDocumentName] = useState('');
  const [documentPath, setDocumentPath] = useState('');
  const [documentKey, setDocumentKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(configManager.get('defaultZoom'));
  const [zoomMode, setZoomMode] = useState<'custom' | 'fit' | 'width'>('custom');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [activeSearchResult, setActiveSearchResult] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const searchGenerationRef = useRef(0);
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(() => storageManager.getRecentFiles());
  const [recentOpen, setRecentOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<PageBookmark[]>([]);
  const openGenerationRef = useRef(0);
  const openInProgressRef = useRef(false);
  const restoreAttemptedRef = useRef(false);
  const skipNextSessionSaveRef = useRef(false);

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

  const openPdfFile = async (
    filePath: string,
    fileName: string,
    restore?: Pick<PdfSession, 'currentPage' | 'zoomMode' | 'zoomLevel'>
  ): Promise<boolean> => {
    if (openInProgressRef.current) return false;
    const generation = ++openGenerationRef.current;
    openInProgressRef.current = true;
    try {
      setError(null);
      setIsLoading(true);
      setRecentOpen(false);

      if (!pdfManager.fileExists(filePath)) {
        storageManager.removeRecentFile(filePath);
        setRecentFiles(storageManager.getRecentFiles());
        const saved = storageManager.getLastSession();
        if (saved?.filePath === filePath) storageManager.clearLastSession();
        throw new Error(`PDF file no longer exists: ${fileName}`);
      }

      const info = await pdfManager.loadDocument(filePath, fileName);
      if (generation !== openGenerationRef.current) return false;

      const restoredPage = restore
        ? Math.max(1, Math.min(restore.currentPage, info.numPages))
        : 1;
      const restoredZoomMode = restore?.zoomMode || 'fit';
      const restoredZoom = restore?.zoomLevel || configManager.get('defaultZoom');
      storageManager.removeBookmarksAfterPage(filePath, info.numPages);

      // State updates are batched. Prevent the autosave effect from briefly
      // combining the new document path with page/zoom from the old document.
      skipNextSessionSaveRef.current = true;
      setHasDocument(true);
      setDocumentName(info.fileName);
      setDocumentPath(filePath);
      setDocumentKey((key) => key + 1);
      setTotalPages(info.numPages);
      setCurrentPage(restoredPage);
      setZoomLevel(restoredZoom);
      setZoomMode(restoredZoomMode);
      setBookmarks(storageManager.getBookmarks(filePath));
      searchGenerationRef.current += 1;
      setSearchQuery('');
      setSearchResults([]);
      setActiveSearchResult(-1);
      setIsSearching(false);

      storageManager.addRecentFile(filePath, fileName);
      setRecentFiles(storageManager.getRecentFiles());
      storageManager.saveLastSession({
        filePath,
        fileName: info.fileName,
        currentPage: restoredPage,
        zoomMode: restoredZoomMode,
        zoomLevel: restoredZoom,
      });
      return true;
    } catch (e) {
      if (generation === openGenerationRef.current) {
        console.error('App: Error opening PDF', e);
        setError(String(e));
      }
      return false;
    } finally {
      if (generation === openGenerationRef.current) setIsLoading(false);
      openInProgressRef.current = false;
    }
  };

  // Open file dialog, then delegate all loading/state work to openPdfFile.
  const handleOpen = async () => {
    if (openInProgressRef.current) return;
    try {

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
        return;
      }

      await openPdfFile(filePath, fileName);
    } catch (e) {
      console.error('App: File dialog error', e);
      setError(String(e));
    }
  };

  useEffect(() => {
    if (restoreAttemptedRef.current) return;
    restoreAttemptedRef.current = true;
    if (!configManager.get('restoreLastSession')) return;
    const session = storageManager.getLastSession();
    if (session) void openPdfFile(session.filePath, session.fileName, session);
  }, []);

  useEffect(() => {
    if (!hasDocument || !documentPath || isLoading) return;
    if (skipNextSessionSaveRef.current) {
      skipNextSessionSaveRef.current = false;
      return;
    }
    storageManager.saveLastSession({
      filePath: documentPath,
      fileName: documentName,
      currentPage,
      zoomMode,
      zoomLevel,
    });
  }, [hasDocument, documentPath, documentName, currentPage, zoomMode, zoomLevel, isLoading]);

  const handleOpenRecent = async (file: RecentFile) => {
    await openPdfFile(file.path, file.name);
  };

  const handleRemoveRecent = (path: string) => {
    storageManager.removeRecentFile(path);
    setRecentFiles(storageManager.getRecentFiles());
  };

  const handleClearRecent = () => {
    storageManager.clearRecentFiles();
    setRecentFiles([]);
    setRecentOpen(false);
  };

  const handleToggleBookmark = () => {
    if (!hasDocument || !documentPath) return;
    const isBookmarked = bookmarks.some((bookmark) => bookmark.page === currentPage);
    if (isBookmarked) {
      storageManager.removeBookmark(documentPath, currentPage);
    } else {
      storageManager.addBookmark(documentPath, documentName, currentPage);
    }
    setBookmarks(storageManager.getBookmarks(documentPath));
  };

  const handleRemoveBookmark = (page: number) => {
    if (!documentPath) return;
    storageManager.removeBookmark(documentPath, page);
    setBookmarks(storageManager.getBookmarks(documentPath));
  };

  const handleZoomIn = () => {
    setZoomMode('custom');
    const maxZoom = configManager.get('maxZoom');
    const step = configManager.get('zoomStep');
    setZoomLevel((z) => {
      const newZoom = Math.min(z + step, maxZoom);
      eventBus.emit(EVENTS.ZOOM_CHANGED, newZoom);
      return newZoom;
    });
  };

  const handleZoomOut = () => {
    setZoomMode('custom');
    const minZoom = configManager.get('minZoom');
    const step = configManager.get('zoomStep');
    setZoomLevel((z) => {
      const newZoom = Math.max(z - step, minZoom);
      eventBus.emit(EVENTS.ZOOM_CHANGED, newZoom);
      return newZoom;
    });
  };

  const handleZoomFit = () => setZoomMode('fit');

  const handleZoomWidth = () => setZoomMode('width');

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

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const generation = ++searchGenerationRef.current;

    if (!hasDocument || !trimmedQuery) {
      setSearchResults([]);
      setActiveSearchResult(-1);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = window.setTimeout(async () => {
      try {
        eventBus.emit(EVENTS.SEARCH_QUERY, trimmedQuery);
        const results = await pdfManager.search(trimmedQuery);
        if (generation !== searchGenerationRef.current) return;
        setSearchResults(results);
        setActiveSearchResult(results.length ? 0 : -1);
      } catch (searchError) {
        if (generation !== searchGenerationRef.current) return;
        console.error('App: Search error', searchError);
        setSearchResults([]);
        setActiveSearchResult(-1);
      } finally {
        if (generation === searchGenerationRef.current) setIsSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery, hasDocument, documentKey]);

  const handleSearch = (query: string) => setSearchQuery(query);

  const selectSearchResult = (index: number) => {
    const result = searchResults[index];
    if (!result) return;
    setActiveSearchResult(index);
    setCurrentPage(result.page);
    eventBus.emit(EVENTS.PAGE_CHANGED, result.page);
  };

  const handlePreviousSearchResult = () => {
    if (!searchResults.length) return;
    const index = (activeSearchResult - 1 + searchResults.length) % searchResults.length;
    selectSearchResult(index);
  };

  const handleNextSearchResult = () => {
    if (!searchResults.length) return;
    const index = (activeSearchResult + 1) % searchResults.length;
    selectSearchResult(index);
  };

  const closeSearchResults = () => {
    searchGenerationRef.current += 1;
    setSearchQuery('');
    setSearchResults([]);
    setActiveSearchResult(-1);
    setIsSearching(false);
  };

  const handleToggleTheme = () => {
    themeManager.toggleTheme();
  };

  const handleToggleSidebar = () => {
    setSidebarVisible((visible) => {
      const next = !visible;
      configManager.set('sidebarVisible', next);
      setConfig(configManager.getAll());
      eventBus.emit(EVENTS.SIDEBAR_TOGGLE, next);
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
      return next;
    });
  };

  const handleConfigChange = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    configManager.set(key, value);
    setConfig(configManager.getAll());
    if (key === 'sidebarWidth') {
      window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    }
  };

  const handleResetSettings = () => {
    configManager.reset();
    themeManager.setTheme('dark');
    const defaults = configManager.getAll();
    setConfig(defaults);
    setSidebarVisible(defaults.sidebarVisible);
    window.setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  };

  return (
    <div
      className="app"
      style={{ '--sidebar-width': `${config.sidebarWidth}px` } as React.CSSProperties}
    >
      <Header
        onToggleTheme={handleToggleTheme}
        onToggleSidebar={handleToggleSidebar}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={theme}
        sidebarVisible={sidebarVisible}
      />
      <div className={`app-main ${sidebarVisible ? '' : 'sidebar-hidden'}`}>
        {sidebarVisible && (
          <Sidebar
            documentKey={documentKey}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageSelect={handlePageSelect}
            bookmarks={bookmarks}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}
        <Toolbar
          onOpen={handleOpen}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomFit={handleZoomFit}
          onZoomWidth={handleZoomWidth}
          onSearch={handleSearch}
          onPrevPage={handlePrevPage}
          onNextPage={handleNextPage}
          onToggleBookmark={handleToggleBookmark}
          searchQuery={searchQuery}
          recentFiles={recentFiles}
          recentOpen={recentOpen}
          isLoading={isLoading}
          onToggleRecent={() => setRecentOpen((open) => !open)}
          onOpenRecent={handleOpenRecent}
          onRemoveRecent={handleRemoveRecent}
          onClearRecent={handleClearRecent}
          currentPage={currentPage}
          totalPages={totalPages}
          zoomLevel={zoomLevel}
          hasDocument={hasDocument}
          isBookmarked={bookmarks.some((bookmark) => bookmark.page === currentPage)}
        />
        <Workspace
          hasDocument={hasDocument}
          currentPage={currentPage}
          zoomLevel={zoomLevel}
          isLoading={isLoading}
          error={error}
          zoomMode={zoomMode}
          onZoomCalculated={setZoomLevel}
        />
        <SearchResults
          query={searchQuery}
          results={searchResults}
          activeIndex={activeSearchResult}
          isSearching={isSearching}
          onSelect={selectSearchResult}
          onPrevious={handlePreviousSearchResult}
          onNext={handleNextSearchResult}
          onClose={closeSearchResults}
        />
      </div>
      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        zoomLevel={zoomLevel}
        documentName={documentName}
        status={error ? 'error' : isLoading ? 'loading' : hasDocument ? 'ready' : 'idle'}
        statusMessage={
          error
            ? `PDF error: ${error}`
            : isLoading
              ? 'Reading and parsing PDF...'
              : hostInfo
        }
      />
      {settingsOpen && (
        <SettingsPanel
          config={config}
          theme={theme}
          onConfigChange={handleConfigChange}
          onThemeChange={(nextTheme) => themeManager.setTheme(nextTheme)}
          onReset={handleResetSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

export default App;