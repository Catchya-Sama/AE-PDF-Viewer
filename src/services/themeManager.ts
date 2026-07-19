/**
 * ThemeManager — Theme persistence and management
 *
 * Handles dark/light theme switching with persistence.
 * Theme preference is saved to localStorage and restored on next session.
 */

import { storageManager } from './storageManager';
import { eventBus, EVENTS } from './eventBus';

export type Theme = 'dark' | 'light';

const THEME_KEY = 'theme';

class ThemeManager {
  private currentTheme: Theme;

  constructor() {
    // Load saved theme or default to dark
    this.currentTheme = storageManager.get<Theme>(THEME_KEY, 'dark') || 'dark';
    this.applyTheme(this.currentTheme);
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Set theme (and persist)
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    this.applyTheme(theme);
    storageManager.set(THEME_KEY, theme);
    eventBus.emit(EVENTS.THEME_CHANGED, theme);
  }

  /**
   * Toggle between dark and light
   */
  toggleTheme(): Theme {
    const newTheme: Theme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * Apply theme to document element
   */
  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}

// Export singleton instance
export const themeManager = new ThemeManager();