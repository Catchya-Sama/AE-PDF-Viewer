import type { SearchResult } from '../services/pdfManager';

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  activeIndex: number;
  isSearching: boolean;
  onSelect: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

export function SearchResults({
  query,
  results,
  activeIndex,
  isSearching,
  onSelect,
  onPrevious,
  onNext,
  onClose,
}: SearchResultsProps) {
  if (!query.trim()) return null;

  return (
    <section className="search-results-panel" aria-label="PDF search results">
      <div className="search-results-header">
        <div className="search-results-summary">
          <strong>{isSearching ? 'Searching…' : `${results.length} result${results.length === 1 ? '' : 's'}`}</strong>
          <span title={query}>“{query}”</span>
        </div>
        <div className="search-results-actions">
          <button
            className="search-nav-btn"
            onClick={onPrevious}
            disabled={results.length === 0}
            title="Previous result"
          >
            ↑
          </button>
          <span>{results.length ? `${activeIndex + 1} / ${results.length}` : '0 / 0'}</span>
          <button
            className="search-nav-btn"
            onClick={onNext}
            disabled={results.length === 0}
            title="Next result"
          >
            ↓
          </button>
          <button className="search-close-btn" onClick={onClose} title="Close search results">
            ×
          </button>
        </div>
      </div>

      <div className="search-results-list">
        {!isSearching && results.length === 0 ? (
          <div className="search-empty">No results found.</div>
        ) : (
          results.map((result, index) => (
            <button
              key={`${result.page}-${index}`}
              className={`search-result-item ${index === activeIndex ? 'active' : ''}`}
              onClick={() => onSelect(index)}
            >
              <span className="search-result-page">Page {result.page}</span>
              <span className="search-result-context">{result.context}</span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}