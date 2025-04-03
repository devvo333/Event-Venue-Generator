import { useState } from 'react';
import { exportLayoutAsPng, exportLayoutAsPdf, saveExportedLayout } from '@/api/exports';
import { Asset } from '@/types/assets';

interface ExportOptionsProps {
  layoutId: string;
  layoutName: string;
  assets: Asset[];
  backgroundUrl: string;
  canvasWidth: number;
  canvasHeight: number;
}

const ExportOptions: React.FC<ExportOptionsProps> = ({
  layoutId,
  layoutName,
  assets,
  backgroundUrl,
  canvasWidth,
  canvasHeight
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPng = async () => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      const layoutData = {
        id: layoutId,
        name: layoutName,
        assets: assets.filter(asset => asset.isVisible !== false),
        backgroundUrl,
        width: canvasWidth,
        height: canvasHeight
      };
      
      // First export the layout as PNG
      const { dataUrl, error } = await exportLayoutAsPng(layoutData);
      
      if (error || !dataUrl) {
        throw error || new Error('Failed to generate PNG');
      }
      
      // Convert data URL to blob
      const byteString = atob(dataUrl.split(',')[1]);
      const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([arrayBuffer], { type: mimeType });
      
      // Save the exported PNG to storage
      const { url, error: saveError } = await saveExportedLayout(layoutId, 'png', blob);
      
      if (saveError) {
        throw saveError;
      }
      
      // Create a temporary anchor and trigger download
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${layoutName.replace(/\s+/g, '-')}.png`;
      link.click();
      
    } catch (error) {
      console.error('Error exporting as PNG:', error);
      setExportError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      const layoutData = {
        id: layoutId,
        name: layoutName,
        assets: assets.filter(asset => asset.isVisible !== false),
        backgroundUrl,
        width: canvasWidth,
        height: canvasHeight
      };
      
      // Export the layout as PDF
      const { blobUrl, error } = await exportLayoutAsPdf(layoutData);
      
      if (error || !blobUrl) {
        throw error || new Error('Failed to generate PDF');
      }
      
      // Get the Blob from the blobUrl
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      
      // Save the exported PDF to storage
      const { url, error: saveError } = await saveExportedLayout(layoutId, 'pdf', blob);
      
      if (saveError) {
        throw saveError;
      }
      
      // Create a temporary anchor and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${layoutName.replace(/\s+/g, '-')}.pdf`;
      link.click();
      
      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      setExportError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col p-4 space-y-4">
      <h3 className="font-semibold text-lg">Export Layout</h3>
      
      {exportError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
          {exportError}
        </div>
      )}
      
      <div className="flex space-x-2">
        <button
          className="btn btn-primary flex-1"
          onClick={handleExportPng}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export as PNG'}
        </button>
        
        <button
          className="btn btn-primary flex-1"
          onClick={handleExportPdf}
          disabled={isExporting}
        >
          {isExporting ? 'Exporting...' : 'Export as PDF'}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Exported layouts will be saved to your account and available for download.
      </p>
    </div>
  );
};

export default ExportOptions; 