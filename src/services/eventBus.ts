/**
 * EventBus — Pub/Sub pattern for cross-component communication
 *
 * Allows components to communicate without direct coupling.
 * Example: When PDF opens → emit('document:opened') → Sidebar, Toolbar, Footer all react.
 */

type EventHandler = (data?: any) => void;

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, handler: EventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Return unsubscribe function
    return () => this.off(event, handler);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: string, data?: any): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (e) {
          console.error(`EventBus handler error for "${event}":`, e);
        }
      });
    }
  }

  /**
   * Clear all handlers for a specific event (or all events)
   */
  clear(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Event name constants
export const EVENTS = {
  // Document events
  DOCUMENT_OPENED: 'document:opened',
  DOCUMENT_CLOSED: 'document:closed',
  DOCUMENT_ERROR: 'document:error',

  // Page events
  PAGE_CHANGED: 'page:changed',
  PAGE_NAVIGATION: 'page:navigation',

  // Zoom events
  ZOOM_CHANGED: 'zoom:changed',

  // Theme events
  THEME_CHANGED: 'theme:changed',

  // Search events
  SEARCH_QUERY: 'search:query',
  SEARCH_RESULTS: 'search:results',

  // UI events
  SIDEBAR_TOGGLE: 'sidebar:toggle',
  STATUS_UPDATE: 'status:update',
} as const;

export type EventType = typeof EVENTS[keyof typeof EVENTS];