/**
 * ConfigurationManager — Default configuration with user overrides
 *
 * Manages user preferences like default zoom, sidebar width, page view mode, etc.
 * Merges defaults with saved user settings.
 */

import { storageManager } from './storageManager';

const CONFIG_KEY = 'config';

export interface AppConfig {
  // Viewer settings
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  zoomStep: number;

  // Sidebar settings
  sidebarWidth: number;
  sidebarMinWidth: number;
  sidebarMaxWidth: number;
  sidebarVisible: boolean;

  // Page settings
  pageViewMode: 'single' | 'continuous' | 'facing';
  scrollMode: 'vertical' | 'horizontal' | 'wrapped';

  // Search settings
  searchCaseSensitive: boolean;
  searchWholeWords: boolean;

  // Recent files
  maxRecentFiles: number;

  // Session
  restoreLastSession: boolean;
}

const DEFAULT_CONFIG: AppConfig = {
  // Viewer settings
  defaultZoom: 100,
  minZoom: 25,
  maxZoom: 400,
  zoomStep: 25,

  // Sidebar settings
  sidebarWidth: 200,
  sidebarMinWidth: 140,
  sidebarMaxWidth: 400,
  sidebarVisible: true,

  // Page settings
  pageViewMode: 'single',
  scrollMode: 'vertical',

  // Search settings
  searchCaseSensitive: false,
  searchWholeWords: false,

  // Recent files
  maxRecentFiles: 10,

  // Session
  restoreLastSession: true,
};

class ConfigurationManager {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Load config from storage, merged with defaults
   */
  private loadConfig(): AppConfig {
    const saved = storageManager.get<Partial<AppConfig>>(CONFIG_KEY, {});
    return { ...DEFAULT_CONFIG, ...saved };
  }

  /**
   * Save current config to storage
   */
  private saveConfig(): void {
    storageManager.set(CONFIG_KEY, this.config);
  }

  /**
   * Get a config value by key
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  /**
   * Set a config value
   */
  set<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
    this.config[key] = value;
    this.saveConfig();
  }

  /**
   * Get all config
   */
  getAll(): AppConfig {
    return { ...this.config };
  }

  /**
   * Update multiple config values
   */
  update(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
  }

  /**
   * Reset config to defaults
   */
  reset(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.saveConfig();
  }
}

// Export singleton instance
export const configManager = new ConfigurationManager();