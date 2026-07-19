/**
 * PdfManager — PDF.js wrapper service
 *
 * Handles loading PDF documents, rendering pages to canvas,
 * generating thumbnails, and searching text.
 *
 * Uses PDF.js v2.16.105 (legacy build for CEP 9 / Chromium 57 compatibility).
 */

// @ts-ignore - pdfjs-dist types
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - worker
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

import { eventBus, EVENTS } from './eventBus';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface PdfDocumentInfo {
  numPages: number;
  title: string;
  author: string;
  fileName: string;
  filePath: string;
}

export interface SearchResult {
  page: number;
  match: string;
  context: string;
}

class PdfManager {
  private currentDocument: any = null;
  private currentFilePath: string = '';
  private currentFileName: string = '';

  /**
   * Load a PDF document from file path
   */
  async loadDocument(filePath: string, fileName: string): Promise<PdfDocumentInfo> {
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await this.readFileAsArrayBuffer(filePath);

      // Load with PDF.js
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        // Disable worker for CEP 9 compatibility if needed
        // disableWorker: true,
      });

      this.currentDocument = await loadingTask.promise;
      this.currentFilePath = filePath;
      this.currentFileName = fileName;

      // Get metadata
      const metadata = await this.currentDocument.getMetadata();

      const info: PdfDocumentInfo = {
        numPages: this.currentDocument.numPages,
        title: metadata?.info?.Title || fileName,
        author: metadata?.info?.Author || 'Unknown',
        fileName: fileName,
        filePath: filePath,
      };

      eventBus.emit(EVENTS.DOCUMENT_OPENED, info);
      return info;
    } catch (error) {
      console.error('PdfManager: Error loading document', error);
      eventBus.emit(EVENTS.DOCUMENT_ERROR, error);
      throw error;
    }
  }

  /**
   * Read file as ArrayBuffer (CEP compatible)
   */
  private async readFileAsArrayBuffer(filePath: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      try {
        // Try fetch first (works in CEP with file:// protocol)
        fetch(filePath)
          .then((response) => response.arrayBuffer())
          .then((buffer) => resolve(buffer))
          .catch(() => {
            // Fallback: use XMLHttpRequest
            const xhr = new XMLHttpRequest();
            xhr.open('GET', filePath, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = () => {
              if (xhr.status === 200 || xhr.status === 0) {
                resolve(xhr.response);
              } else {
                reject(new Error(`Failed to load file: ${xhr.status}`));
              }
            };
            xhr.onerror = () => reject(new Error('Network error loading file'));
            xhr.send();
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Render a specific page to a canvas element
   */
  async renderPage(
    pageNum: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.0
  ): Promise<void> {
    if (!this.currentDocument) {
      throw new Error('No document loaded');
    }

    try {
      const page = await this.currentDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Cannot get canvas 2d context');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error(`PdfManager: Error rendering page ${pageNum}`, error);
      throw error;
    }
  }

  /**
   * Generate a thumbnail for a specific page
   */
  async generateThumbnail(
    pageNum: number,
    maxWidth: number = 150
  ): Promise<string> {
    if (!this.currentDocument) {
      throw new Error('No document loaded');
    }

    try {
      const page = await this.currentDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });

      // Calculate scale to fit maxWidth
      const scale = maxWidth / viewport.width;
      const thumbViewport = page.getViewport({ scale });

      // Create temporary canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Cannot get canvas 2d context');
      }

      canvas.width = thumbViewport.width;
      canvas.height = thumbViewport.height;

      await page.render({
        canvasContext: context,
        viewport: thumbViewport,
      }).promise;

      // Return as data URL
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error(`PdfManager: Error generating thumbnail for page ${pageNum}`, error);
      throw error;
    }
  }

  /**
   * Search text in the PDF document
   */
  async search(query: string): Promise<SearchResult[]> {
    if (!this.currentDocument || !query.trim()) {
      return [];
    }

    const results: SearchResult[] = [];
    const numPages = this.currentDocument.numPages;

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await this.currentDocument.getPage(i);
        const textContent = await page.getTextContent();

        let fullText = '';
        textContent.items.forEach((item: any) => {
          fullText += item.str + ' ';
        });

        // Search for query (case-insensitive)
        const lowerText = fullText.toLowerCase();
        const lowerQuery = query.toLowerCase();
        let index = lowerText.indexOf(lowerQuery);

        while (index !== -1) {
          // Get context (50 chars before and after)
          const start = Math.max(0, index - 50);
          const end = Math.min(fullText.length, index + query.length + 50);
          const context = fullText.substring(start, end).trim();

          results.push({
            page: i,
            match: query,
            context: context,
          });

          index = lowerText.indexOf(lowerQuery, index + 1);
        }
      } catch (e) {
        console.error(`PdfManager: Error searching page ${i}`, e);
      }
    }

    eventBus.emit(EVENTS.SEARCH_RESULTS, results);
    return results;
  }

  /**
   * Get page dimensions
   */
  async getPageDimensions(pageNum: number): Promise<{ width: number; height: number }> {
    if (!this.currentDocument) {
      throw new Error('No document loaded');
    }

    const page = await this.currentDocument.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    return { width: viewport.width, height: viewport.height };
  }

  /**
   * Close current document
   */
  closeDocument(): void {
    if (this.currentDocument) {
      this.currentDocument.destroy();
      this.currentDocument = null;
      this.currentFilePath = '';
      this.currentFileName = '';
      eventBus.emit(EVENTS.DOCUMENT_CLOSED);
    }
  }

  /**
   * Check if a document is loaded
   */
  hasDocument(): boolean {
    return this.currentDocument !== null;
  }

  /**
   * Get current document info
   */
  getDocumentInfo(): PdfDocumentInfo | null {
    if (!this.currentDocument) return null;
    return {
      numPages: this.currentDocument.numPages,
      title: this.currentFileName,
      author: 'Unknown',
      fileName: this.currentFileName,
      filePath: this.currentFilePath,
    };
  }
}

// Export singleton instance
export const pdfManager = new PdfManager();