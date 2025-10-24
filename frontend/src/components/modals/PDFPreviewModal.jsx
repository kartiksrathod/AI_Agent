import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Download, X, ZoomIn, ZoomOut, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

/**
 * Beautiful PDF Preview Modal
 * Allows users to view PDFs without downloading
 * Features: Zoom controls, fullscreen, navigation
 */
const PDFPreviewModal = ({ isOpen, onClose, pdfUrl, title, onDownload }) => {
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(100);
      setIsFullscreen(false);
      setLoading(true);
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    if (zoom < 200) {
      setZoom(prev => Math.min(prev + 25, 200));
    }
  };

  const handleZoomOut = () => {
    if (zoom > 50) {
      setZoom(prev => Math.max(prev - 25, 50));
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setLoading(false);
    toast({
      title: "Preview Error",
      description: "Unable to load PDF preview. Try downloading instead.",
      variant: "destructive"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? 'max-w-[100vw] max-h-[100vh] w-full h-full m-0 rounded-none' 
            : 'max-w-5xl max-h-[90vh]'
        } p-0 overflow-hidden dark:bg-gray-900 dark:border-gray-700 transition-all duration-300`}
      >
        {/* Header with controls */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-lg font-semibold truncate dark:text-white">
                {title || 'PDF Preview'}
              </DialogTitle>
            </div>
            
            {/* Control buttons */}
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="h-8 w-8 p-0 dark:hover:bg-gray-600"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium px-2 min-w-[3rem] text-center dark:text-gray-300">
                  {zoom}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="h-8 w-8 p-0 dark:hover:bg-gray-600"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Fullscreen toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0 dark:hover:bg-gray-700"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>

              {/* Download button */}
              <Button
                variant="default"
                size="sm"
                onClick={handleDownload}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                data-testid="pdf-preview-download-btn"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>

              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 dark:hover:bg-gray-700"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* PDF Viewer */}
        <div className="relative bg-gray-100 dark:bg-gray-900" style={{ height: isFullscreen ? 'calc(100vh - 73px)' : '70vh' }}>
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-10">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading PDF...</p>
              </div>
            </div>
          )}

          {/* PDF iframe */}
          {pdfUrl && (
            <iframe
              src={`${pdfUrl}#zoom=${zoom}`}
              className="w-full h-full border-0"
              title={title || 'PDF Preview'}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                width: `${100 / (zoom / 100)}%`,
                height: `${100 / (zoom / 100)}%`
              }}
            />
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 Tip: Use Download button to save the PDF to your device
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewModal;
