"use client";

import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Fix worker version mismatch
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  `pdfjs-dist/build/pdf.worker.min.mjs`,
  import.meta.url
).toString();

type PdfViewerProps = {
  fileUrl: string | null;
};

export default function PdfViewer({ fileUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2); // default zoom scale
  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  function zoomIn() {
    setScale((prev) => prev + 0.2);
  }

  function zoomOut() {
    setScale((prev) => Math.max(0.6, prev - 0.2));
  }

  function resetZoom() {
    setScale(1.2);
  }

  function fitToWidth() {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      // PDF page default width ~800px → calculate scale
      const newScale = containerWidth / 800;
      setScale(newScale);
    }
  }

  function fitToPage() {
    if (containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      // PDF page default height ~1000px → calculate scale
      const newScale = containerHeight / 1000;
      setScale(newScale);
    }
  }

  // optional: recalc on resize
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        fitToWidth(); // auto-fit when resizing
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center"
    >
      {fileUrl ? (
        <>
          {/* Controls */}
          <div className="flex gap-2 mb-2 flex-wrap">
            <button
              onClick={zoomOut}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ➖ Zoom Out
            </button>
            <button
              onClick={zoomIn}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ➕ Zoom In
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              🔄 Reset
            </button>
            <button
              onClick={fitToWidth}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ↔ Fit Width
            </button>
            <button
              onClick={fitToPage}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              ↕ Fit Page
            </button>
          </div>

          {/* PDF */}
          <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>

          {/* Pagination */}
          <div className="flex items-center gap-2 mt-2">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber((p) => p - 1)}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              ◀ Prev
            </button>
            <span>
              Page {pageNumber} of {numPages}
            </span>
            <button
              disabled={!numPages || pageNumber >= numPages}
              onClick={() => setPageNumber((p) => p + 1)}
              className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next ▶
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No PDF loaded</p>
      )}
    </div>
  );
}
