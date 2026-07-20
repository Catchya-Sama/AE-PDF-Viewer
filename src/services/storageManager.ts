/**
 * StorageManager — Persistent data storage using localStorage
 *
 * CEP supports localStorage, so we can persist data across sessions.
 * Stores: recent files, bookmarks, preferences, last session state.
 */

const STORAGE_PREFIX = 'aepdf_';

class StorageManager {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Check if localStorage is available
   */
  private checkAvailability(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('StorageManager: localStorage not available', e);
      return false;
    }
  }

  /**
   * Get full key with prefix
   */
  private getKey(key: string): string {
    return STORAGE_PREFIX + key;
  }

  /**
   * Get a value from storage
   */
  get<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.isAvailable) return defaultValue;

    try {
      const fullKey = this.getKey(key);
      const value = localStorage.getItem(fullKey);
      if (value === null) return defaultValue;
      return JSON.parse(value) as T;
    } catch (e) {
      console.error(`StorageManager: Error getting key "${key}"`, e);
      return defaultValue;
    }
  }

  /**
   * Set a value in storage
   */
  set<T>(key: string, value: T): boolean {
    if (!this.isAvailable) return false;

    try {
      const fullKey = this.getKey(key);
      localStorage.setItem(fullKey, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`StorageManager: Error setting key "${key}"`, e);
      return false;
    }
  }

  /**
   * Remove a value from storage
   */
  remove(key: string): boolean {
    if (!this.isAvailable) return false;

    try {
      const fullKey = this.getKey(key);
      localStorage.removeItem(fullKey);
      return true;
    } catch (e) {
      console.error(`StorageManager: Error removing key "${key}"`, e);
      return false;
    }
  }

  /**
   * Clear all app-specific data from storage
   */
  clear(): void {
    if (!this.isAvailable) return;

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.error('StorageManager: Error clearing storage', e);
    }
  }

  // ===== Recent Files =====

  /**
   * Get list of recent files
   */
  getRecentFiles(): RecentFile[] {
    return this.get<RecentFile[]>('recentFiles', []) || [];
  }

  /**
   * Add a file to recent files list
   */
  addRecentFile(path: string, name: string): void {
    const recent = this.getRecentFiles();
    const existing = recent.findIndex((f) => f.path === path);
    if (existing !== -1) {
      recent.splice(existing, 1);
    }
    recent.unshift({ path, name, lastOpened: Date.now() });
    // Keep only last 10 files
    if (recent.length > 10) {
      recent.length = 10;
    }
    this.set('recentFiles', recent);
  }

  /**
   * Remove a file from recent files list
   */
  removeRecentFile(path: string): void {
    const recent = this.getRecentFiles();
    const filtered = recent.filter((f) => f.path !== path);
    this.set('recentFiles', filtered);
  }

  /**
   * Clear all recent files
   */
  clearRecentFiles(): void {
    this.remove('recentFiles');
  }

  // ===== Page Bookmarks =====

  getBookmarks(filePath: string): PageBookmark[] {
    const normalizedPath = this.normalizePath(filePath);
    const bookmarks = this.get<PageBookmark[]>('bookmarks', []) || [];
    return bookmarks
      .filter((bookmark) => this.normalizePath(bookmark.filePath) === normalizedPath)
      .sort((first, second) => first.page - second.page);
  }

  addBookmark(filePath: string, fileName: string, page: number, label?: string): PageBookmark {
    const bookmarks = this.get<PageBookmark[]>('bookmarks', []) || [];
    const normalizedPath = this.normalizePath(filePath);
    const existing = bookmarks.find(
      (bookmark) => this.normalizePath(bookmark.filePath) === normalizedPath && bookmark.page === page
    );
    if (existing) return existing;

    const bookmark: PageBookmark = {
      id: `${normalizedPath}::${page}`,
      filePath,
      fileName,
      page,
      label: label?.trim() || `Page ${page}`,
      createdAt: Date.now(),
    };
    bookmarks.push(bookmark);
    this.set('bookmarks', bookmarks);
    return bookmark;
  }

  removeBookmark(filePath: string, page: number): void {
    const normalizedPath = this.normalizePath(filePath);
    const bookmarks = this.get<PageBookmark[]>('bookmarks', []) || [];
    this.set('bookmarks', bookmarks.filter(
      (bookmark) => !(this.normalizePath(bookmark.filePath) === normalizedPath && bookmark.page === page)
    ));
  }

  removeBookmarksAfterPage(filePath: string, lastPage: number): void {
    const normalizedPath = this.normalizePath(filePath);
    const bookmarks = this.get<PageBookmark[]>('bookmarks', []) || [];
    this.set('bookmarks', bookmarks.filter(
      (bookmark) => this.normalizePath(bookmark.filePath) !== normalizedPath || bookmark.page <= lastPage
    ));
  }

  private normalizePath(path: string): string {
    return path.replace(/\//g, '\\').toLowerCase();
  }

  // ===== Last Session =====

  getLastSession(): PdfSession | null {
    const session = this.get<PdfSession>('lastSession');
    if (!session || session.version !== 1 || !session.filePath || !session.fileName) {
      return null;
    }
    return session;
  }

  saveLastSession(session: Omit<PdfSession, 'version' | 'savedAt'>): void {
    this.set<PdfSession>('lastSession', {
      version: 1,
      ...session,
      savedAt: Date.now(),
    });
  }

  clearLastSession(): void {
    this.remove('lastSession');
  }
}

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: number;
}

export interface PdfSession {
  version: 1;
  filePath: string;
  fileName: string;
  currentPage: number;
  zoomMode: 'fit' | 'width' | 'custom';
  zoomLevel: number;
  savedAt: number;
}

export interface PageBookmark {
  id: string;
  filePath: string;
  fileName: string;
  page: number;
  label: string;
  createdAt: number;
}

// Export singleton instance
export const storageManager = new StorageManager();