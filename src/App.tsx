import { useState, useEffect } from 'react';

// Minimal App for Phase 1 — verify React + CEP bridge works
function App() {
  const [hostInfo, setHostInfo] = useState<string>('Connecting to After Effects...');
  const [pingResult, setPingResult] = useState<string>('');

  useEffect(() => {
    // Try to ping the ExtendScript host bridge
    try {
      // @ts-ignore - CSInterface is loaded globally via index.html
      if (typeof CSInterface !== 'undefined') {
        // @ts-ignore
        const cs = new CSInterface();

        // Ping test
        // @ts-ignore
        cs.evalScript('ping()', (result: string) => {
          if (result === 'EvalScript error.' || !result) {
            setPingResult('FAILED - host.jsx not loaded');
          } else {
            setPingResult(result);
          }
        });

        // Get host info
        // @ts-ignore
        cs.evalScript('getHostInfo()', (result: string) => {
          if (result === 'EvalScript error.' || !result) {
            setHostInfo('host.jsx not loaded - check ScriptPath in manifest');
            return;
          }
          try {
            const info = JSON.parse(result);
            if (info.error) {
              setHostInfo('Error: ' + info.error);
            } else {
              setHostInfo(
                `${info.appName} v${info.appVersion} | Project: ${info.projectName || 'None'}`
              );
            }
          } catch {
            setHostInfo('Could not parse: ' + result);
          }
        });
      } else {
        setHostInfo('Running outside CEP (browser dev mode)');
      }
    } catch (e) {
      setHostInfo('Bridge error: ' + String(e));
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDF Viewer</h1>
        <span className="version">v1.0.0 — Phase 1</span>
      </header>
      <main className="app-main">
        <div className="status-card">
          <h2>System Status</h2>
          <p className="status-line">
            <strong>Host:</strong> {hostInfo}
          </p>
          <p className="status-line">
            <strong>Bridge ping:</strong> {pingResult || '...'}
          </p>
        </div>
        <div className="placeholder">
          <p>PDF engine will be integrated in Phase 4.</p>
        </div>
      </main>
    </div>
  );
}

export default App;