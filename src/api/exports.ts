import { supabase } from '../config/supabase';
import { Asset } from '@/types/assets';

interface LayoutData {
  id: string;
  name: string;
  assets: Asset[];
  backgroundUrl: string;
  width: number;
  height: number;
}

/**
 * Export a layout as a PNG image
 * This function generates a PNG image of the layout and returns the data URL
 */
export const exportLayoutAsPng = async (
  layoutData: LayoutData
): Promise<{
  dataUrl: string | null;
  error: any | null;
}> => {
  try {
    // Create a canvas with the layout dimensions
    const canvas = document.createElement('canvas');
    canvas.width = layoutData.width;
    canvas.height = layoutData.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    // Draw the background image
    const bgImage = new Image();
    bgImage.src = layoutData.backgroundUrl;
    
    // Wait for the background image to load
    await new Promise<void>((resolve, reject) => {
      bgImage.onload = () => resolve();
      bgImage.onerror = () => reject(new Error('Failed to load background image'));
      // Set a timeout in case the image never loads
      setTimeout(() => reject(new Error('Background image load timeout')), 10000);
    });
    
    ctx.drawImage(bgImage, 0, 0, layoutData.width, layoutData.height);
    
    // Draw each asset on the canvas
    for (const asset of layoutData.assets) {
      if (!asset.isVisible) continue;
      
      const assetImage = new Image();
      assetImage.src = asset.imageUrl;
      
      // Wait for the asset image to load
      await new Promise<void>((resolve, reject) => {
        assetImage.onload = () => resolve();
        assetImage.onerror = () => reject(new Error(`Failed to load asset image: ${asset.name}`));
        // Set a timeout in case the image never loads
        setTimeout(() => reject(new Error(`Asset image load timeout: ${asset.name}`)), 10000);
      });
      
      // Save the current context state
      ctx.save();
      
      // Position the asset relative to its center
      const x = asset.x || 0;
      const y = asset.y || 0;
      const width = asset.width || 100;
      const height = asset.height || 100;
      const scaleX = asset.scaleX || 1;
      const scaleY = asset.scaleY || 1;
      const rotation = asset.rotation || 0;
      
      // Move to the asset position
      ctx.translate(x, y);
      
      // Apply rotation (converted to radians)
      ctx.rotate((rotation * Math.PI) / 180);
      
      // Apply scaling
      ctx.scale(scaleX, scaleY);
      
      // Draw the asset image centered at the origin
      ctx.drawImage(assetImage, -width / 2, -height / 2, width, height);
      
      // Restore the context state
      ctx.restore();
    }
    
    // Convert the canvas to a data URL and return it
    const dataUrl = canvas.toDataURL('image/png');
    return { dataUrl, error: null };
  } catch (error) {
    console.error('Error exporting layout as PNG:', error);
    return { dataUrl: null, error };
  }
};

/**
 * Export a layout as a PDF
 * This function generates a PDF of the layout and returns a blob URL for download
 */
export const exportLayoutAsPdf = async (
  layoutData: LayoutData
): Promise<{
  blobUrl: string | null;
  error: any | null;
}> => {
  try {
    // First generate a PNG of the layout
    const { dataUrl, error } = await exportLayoutAsPng(layoutData);
    
    if (error || !dataUrl) {
      throw error || new Error('Failed to generate PNG for PDF');
    }
    
    // Load the jsPDF library dynamically
    const { jsPDF } = await import('jspdf');
    
    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: layoutData.width > layoutData.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [layoutData.width, layoutData.height]
    });
    
    // Add layout information
    pdf.setFontSize(14);
    pdf.text(`Event Venue Layout: ${layoutData.name}`, 20, 20);
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 35);
    
    // Add the layout image
    pdf.addImage(dataUrl, 'PNG', 0, 50, layoutData.width, layoutData.height);
    
    // Create a blob from the PDF
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    
    return { blobUrl, error: null };
  } catch (error) {
    console.error('Error exporting layout as PDF:', error);
    return { blobUrl: null, error };
  }
};

/**
 * Save an exported layout to the storage
 */
export const saveExportedLayout = async (
  layoutId: string,
  fileType: 'png' | 'pdf',
  fileData: Blob
): Promise<{
  url: string | null;
  error: any | null;
}> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      return { url: null, error: new Error('User not authenticated') };
    }
    
    const timestamp = new Date().getTime();
    const fileName = `${user.user.id}/${layoutId}-${timestamp}.${fileType}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('layout-exports')
      .upload(fileName, fileData, { upsert: true });
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('layout-exports')
      .getPublicUrl(fileName);
      
    const fileUrl = data.publicUrl;
    
    return { url: fileUrl, error: null };
  } catch (error) {
    console.error('Error saving exported layout:', error);
    return { url: null, error };
  }
}; 