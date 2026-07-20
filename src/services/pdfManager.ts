/**
 * PdfManager — PDF.js wrapper service
 *
 * Handles loading PDF documents, rendering pages to canvas,
 * generating thumbnails, and searching text.
 *
 * Uses the PDF.js v2.x legacy build for CEP 9 / Chromium 57 compatibility.
 */

// The legacy build avoids modern syntax unsupported by CEP 9's Chromium 57.
// @ts-ignore - pdfjs-dist legacy build has no directly resolved TS declaration
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
// Bundling the worker handler into the panel avoids CEP/Node resolving the
// relative worker URL as the invalid module path "/pdf.worker.min.js".
// @ts-ignore - worker bundle exports WorkerMessageHandler at runtime
import { WorkerMessageHandler } from 'pdfjs-dist/legacy/build/pdf.worker.js';

import { eventBus, EVENTS } from './eventBus';

interface PdfJsGlobal extends Window {
  pdfjsWorker?: {
    WorkerMessageHandler: typeof WorkerMessageHandler;
  };
}

// PDF.js checks globalThis.pdfjsWorker before attempting to require/import a
// worker URL. Registering this handler forces the supported in-process worker
// path in CEP 9 and removes all runtime dependency on URL resolution.
(window as PdfJsGlobal).pdfjsWorker = { WorkerMessageHandler };

type NodeRequire = (moduleName: string) => any;

interface CepWindow extends Window {
  require?: NodeRequire;
}

interface PdfImageData {
  width: number;
  height: number;
  kind: number;
  data: Uint8Array | Uint8ClampedArray;
}

interface CepRasterCanvas extends HTMLCanvasElement {
  __cepPdfRasterSource?: boolean;
}

class CepDomCanvasFactory {
  create(width: number, height: number): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D } {
    if (width <= 0 || height <= 0) {
      throw new Error('Invalid canvas size');
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot create CEP DOM canvas');
    return { canvas, context };
  }

  reset(target: { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D }, width: number, height: number): void {
    target.canvas.width = width;
    target.canvas.height = height;
  }

  destroy(target: { canvas: HTMLCanvasElement | null; context: CanvasRenderingContext2D | null }): void {
    if (target.canvas) {
      target.canvas.width = 0;
      target.canvas.height = 0;
    }
    target.canvas = null;
    target.context = null;
  }
}

const RGBA_32BPP = 3;

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

export interface ThumbnailSession {
  document: any;
}

class PdfManager {
  private currentDocument: any = null;
  private currentFilePath: string = '';
  private currentFileName: string = '';
  private renderTasks = new WeakMap<HTMLCanvasElement, any>();
  private canvasImageGuardInstalled = false;

  fileExists(filePath: string): boolean {
    const nodeRequire = (window as CepWindow).require;
    if (typeof nodeRequire !== 'function') return true;
    try {
      return Boolean(nodeRequire('fs').existsSync(this.toNativePath(filePath)));
    } catch (error) {
      console.warn('PdfManager: Could not check file existence', error);
      return true;
    }
  }

  /**
   * Load a PDF document from file path
   */
  async loadDocument(filePath: string, fileName: string): Promise<PdfDocumentInfo> {
    try {
      // Read file as ArrayBuffer. A native Windows path is preferred here so
      // CEP's Node integration can read it without file:// URL edge cases.
      const arrayBuffer = await this.readFileAsArrayBuffer(filePath);

      // Load with PDF.js
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        cMapUrl: './cmaps/',
        cMapPacked: true,
        standardFontDataUrl: './standard_fonts/',
        disableFontFace: false,
        useSystemFonts: true,
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
    const nativePath = this.toNativePath(filePath);
    const nodeRequire = (window as CepWindow).require;

    // Preferred path in CEP: Node can read local files reliably and does not
    // depend on CEF's file-origin/CORS behavior.
    if (typeof nodeRequire === 'function') {
      try {
        const fs = nodeRequire('fs');
        const nodeBuffer: Uint8Array = await new Promise((resolve, reject) => {
          fs.readFile(nativePath, (error: Error | null, data: Uint8Array) => {
            if (error) reject(error);
            else resolve(data);
          });
        });

        return nodeBuffer.buffer.slice(
          nodeBuffer.byteOffset,
          nodeBuffer.byteOffset + nodeBuffer.byteLength
        ) as ArrayBuffer;
      } catch (nodeError) {
        console.warn('PdfManager: Node fs read failed, trying browser fallback', nodeError);
      }
    }

    const fileUrl = this.toFileUrl(nativePath);

    // Browser/dev fallback and a secondary path for unusual CEP contexts.
    try {
      const response = await fetch(fileUrl);
      if (!response.ok && response.status !== 0) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.arrayBuffer();
    } catch (fetchError) {
      console.warn('PdfManager: fetch failed, trying XMLHttpRequest', fetchError);
      return await this.readWithXhr(fileUrl);
    }
  }

  private readWithXhr(fileUrl: string): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', fileUrl, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 0) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Cannot read local PDF (status ${xhr.status})`));
        }
      };
      xhr.onerror = () => reject(new Error(`Cannot read local PDF: ${fileUrl}`));
      xhr.send();
    });
  }

  private toNativePath(filePath: string): string {
    if (!/^file:\/\//i.test(filePath)) return filePath;

    let path = decodeURIComponent(filePath.replace(/^file:\/\/\/?/i, ''));
    if (/^\/[A-Za-z]:/.test(path)) path = path.substring(1);
    return path.replace(/\//g, '\\');
  }

  private toFileUrl(nativePath: string): string {
    if (/^file:\/\//i.test(nativePath)) return nativePath;
    return `file:///${nativePath.replace(/\\/g, '/').replace(/^\//, '')}`;
  }

  /**
   * Render a specific page to a canvas element
   */
  async renderPage(
    pageNum: number,
    canvas: HTMLCanvasElement,
    scale: number = 1.0,
    imageOverlay?: HTMLDivElement
  ): Promise<void> {
    if (!this.currentDocument) {
      throw new Error('No document loaded');
    }

    try {
      const page = await this.currentDocument.getPage(pageNum);
      await this.prepareCepImageObjects(page);
      this.installCanvasImageGuard();
      const viewport = page.getViewport({ scale });

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Cannot get canvas 2d context');
      }

      const outputScale = Math.max(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      if (imageOverlay) {
        await this.composeCepImageOverlay(page, viewport, imageOverlay);
      }

      const previousTask = this.renderTasks.get(canvas);
      if (previousTask) {
        previousTask.cancel();
        try {
          await previousTask.promise;
        } catch (error: any) {
          if (error?.name !== 'RenderingCancelledException') throw error;
        }
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: [outputScale, 0, 0, outputScale, 0, 0],
        // CEP exposes Node and DOM globals simultaneously, causing PDF.js to
        // choose NodeCanvasFactory and call the incompatible `canvas` module.
        // Force a browser canvas factory for patterns, masks and groups.
        canvasFactory: new CepDomCanvasFactory(),
        // Raster images are composited in a dedicated DOM layer below this
        // canvas. Keep PDF.js' vector/text surface transparent so the images
        // remain visible while text, fills, and table lines stay on top.
        background: 'rgba(0, 0, 0, 0)',
      };

      const renderTask = page.render(renderContext);
      this.renderTasks.set(canvas, renderTask);
      try {
        await renderTask.promise;
      } finally {
        if (this.renderTasks.get(canvas) === renderTask) {
          this.renderTasks.delete(canvas);
        }
      }
    } catch (error: any) {
      if (error?.name === 'RenderingCancelledException') return;
      console.error(`PdfManager: Error rendering page ${pageNum}`, error);
      throw error;
    }
  }

  /**
   * PDF.js still tries to paint the compatibility source canvases into the
   * main page canvas. That drawImage path is broken in CEP 9 and can abort the
   * remaining operator list (including text and table vectors). Skip only our
   * tagged raster sources; the DOM overlay paints their pixel clones instead.
   */
  private installCanvasImageGuard(): void {
    if (this.canvasImageGuardInstalled) return;
    const prototype = CanvasRenderingContext2D.prototype as any;
    const originalDrawImage = prototype.drawImage;
    prototype.drawImage = function(source: CepRasterCanvas, ...args: any[]) {
      if (source?.__cepPdfRasterSource) return;
      return originalDrawImage.call(this, source, ...args);
    };
    this.canvasImageGuardInstalled = true;
  }

  private async composeCepImageOverlay(
    page: any,
    viewport: any,
    overlay: HTMLDivElement
  ): Promise<void> {
    overlay.innerHTML = '';
    const operatorList = await page.getOperatorList();
    let transform = viewport.transform.slice() as number[];
    const stack: number[][] = [];

    operatorList.fnArray.forEach((operator: number, index: number) => {
      const args = operatorList.argsArray[index];
      if (operator === pdfjsLib.OPS.save) {
        stack.push(transform.slice());
      } else if (operator === pdfjsLib.OPS.restore) {
        transform = stack.pop() || viewport.transform.slice();
      } else if (operator === pdfjsLib.OPS.transform) {
        transform = this.multiplyTransforms(transform, args);
      } else if (operator === pdfjsLib.OPS.paintImageXObject) {
        const id = args?.[0];
        if (typeof id !== 'string') return;
        const store = id.indexOf('g_') === 0 ? page.commonObjs : page.objs;
        const image = store.has(id) ? store.get(id) : null;
        if (!(image instanceof HTMLCanvasElement)) return;

        // PDF.js paints an image into a transformed unit square while flipping
        // its source vertically. Apply the equivalent matrix directly in CSS.
        const imageTransform = this.multiplyTransforms(
          transform,
          [1, 0, 0, -1, 0, 1]
        );
        const overlayImage = this.cloneImageCanvas(image);
        overlayImage.className = 'pdf-raster-image';
        overlayImage.style.width = '1px';
        overlayImage.style.height = '1px';
        overlayImage.style.transform = `matrix(${imageTransform.join(',')})`;
        overlay.appendChild(overlayImage);
      }
    });
  }

  private cloneImageCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
    const clone = document.createElement('canvas');
    clone.width = source.width;
    clone.height = source.height;
    const sourceContext = source.getContext('2d');
    const cloneContext = clone.getContext('2d');
    if (!sourceContext || !cloneContext) {
      throw new Error('Cannot clone CEP image compatibility canvas');
    }

    // Avoid drawImage between canvases; this is the operation that silently
    // drops raster content in CEP 9. Pixel copy remains stable in CEF 57.
    const rowsPerChunk = 32;
    for (let y = 0; y < source.height; y += rowsPerChunk) {
      const rows = Math.min(rowsPerChunk, source.height - y);
      const pixels = sourceContext.getImageData(0, y, source.width, rows);
      cloneContext.putImageData(pixels, 0, y);
    }
    return clone;
  }

  private multiplyTransforms(first: number[], second: number[]): number[] {
    return [
      first[0] * second[0] + first[2] * second[1],
      first[1] * second[0] + first[3] * second[1],
      first[0] * second[2] + first[2] * second[3],
      first[1] * second[2] + first[3] * second[3],
      first[0] * second[4] + first[2] * second[5] + first[4],
      first[1] * second[4] + first[3] * second[5] + first[5],
    ];
  }

  /**
   * CEP 9 can silently drop PDF.js raster images when its old CEF engine
   * performs the internal pixel-buffer -> cached-canvas conversion. Convert
   * decoded image objects to dedicated HTMLCanvasElements up front instead.
   * PDF.js then keeps ownership of placement, transform, clipping and opacity.
   */
  private async prepareCepImageObjects(page: any): Promise<void> {
    const operatorList = await page.getOperatorList();
    const imageIds = new Set<string>();

    operatorList.fnArray.forEach((operator: number, index: number) => {
      if (operator === pdfjsLib.OPS.paintImageXObject) {
        const id = operatorList.argsArray[index]?.[0];
        if (typeof id === 'string') imageIds.add(id);
      }
    });

    await Promise.all(Array.from(imageIds).map(async (id) => {
      const store = id.indexOf('g_') === 0 ? page.commonObjs : page.objs;
      const image = await this.getPdfObject(store, id);
      if (!this.isRawPdfImage(image)) return;

      const canvas = this.createImageCanvas(image);
      const entry = store?._objs?.[id];
      if (entry?.resolved) entry.data = canvas;
    }));
  }

  private getPdfObject(store: any, id: string): Promise<any> {
    return new Promise((resolve) => {
      if (store.has(id)) {
        resolve(store.get(id));
        return;
      }
      store.get(id, resolve);
    });
  }

  private isRawPdfImage(value: any): value is PdfImageData {
    return Boolean(
      value &&
      !(value instanceof HTMLElement) &&
      value.data &&
      typeof value.width === 'number' &&
      typeof value.height === 'number'
    );
  }

  private createImageCanvas(image: PdfImageData): HTMLCanvasElement {
    const canvas = document.createElement('canvas') as CepRasterCanvas;
    canvas.__cepPdfRasterSource = true;
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot create CEP image compatibility canvas');

    // Keep temporary allocations modest for CEF 57. PDF.js ImageKind values:
    // 2 = RGB 24bpp, 3 = RGBA 32bpp. Other kinds are left to PDF.js.
    const rowsPerChunk = 32;
    const channels = image.kind === RGBA_32BPP ? 4 : 3;
    for (let y = 0; y < image.height; y += rowsPerChunk) {
      const rows = Math.min(rowsPerChunk, image.height - y);
      const pixels = context.createImageData(image.width, rows);
      const destination = pixels.data;
      const sourceOffset = y * image.width * channels;

      if (channels === 4) {
        destination.set(image.data.subarray(
          sourceOffset,
          sourceOffset + image.width * rows * 4
        ));
      } else {
        let source = sourceOffset;
        let target = 0;
        const count = image.width * rows;
        for (let pixel = 0; pixel < count; pixel += 1) {
          destination[target++] = image.data[source++];
          destination[target++] = image.data[source++];
          destination[target++] = image.data[source++];
          destination[target++] = 255;
        }
      }
      context.putImageData(pixels, 0, y);
    }
    return canvas;
  }

  /**
   * Generate a thumbnail for a specific page
   */
  createThumbnailSession(): ThumbnailSession {
    if (!this.currentDocument) {
      throw new Error('No document loaded');
    }
    return { document: this.currentDocument };
  }

  async generateThumbnail(
    pageNum: number,
    maxWidth: number = 150,
    session?: ThumbnailSession
  ): Promise<string> {
    const pdfDocument = session?.document || this.currentDocument;
    if (!pdfDocument) {
      throw new Error('No document loaded');
    }

    try {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });

      // Calculate scale to fit maxWidth
      const scale = maxWidth / viewport.width;
      const thumbViewport = page.getViewport({ scale });
      const outputScale = 1.5;

      // Create temporary canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Cannot get canvas 2d context');
      }

      canvas.width = Math.floor(thumbViewport.width * outputScale);
      canvas.height = Math.floor(thumbViewport.height * outputScale);

      await page.render({
        canvasContext: context,
        viewport: thumbViewport,
        transform: [outputScale, 0, 0, outputScale, 0, 0],
        canvasFactory: new CepDomCanvasFactory(),
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