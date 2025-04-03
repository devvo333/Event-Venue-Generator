import { useState } from 'react';
import { Venue, VenueCreateInput, createVenue, updateVenue, uploadVenueCoverImage } from '@/api/venues';

interface VenueFormProps {
  initialVenue?: Venue;
  onSuccess: (venue: Venue) => void;
  onCancel: () => void;
}

const VenueForm: React.FC<VenueFormProps> = ({
  initialVenue,
  onSuccess,
  onCancel
}) => {
  const [formData, setFormData] = useState<VenueCreateInput>({
    name: initialVenue?.name || '',
    description: initialVenue?.description || '',
    address: initialVenue?.address || '',
    dimensions: initialVenue?.dimensions || {
      width: 0,
      length: 0, 
      height: 0,
      unit: 'feet' as const
    },
    is_public: initialVenue?.is_public || false
  });
  
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(initialVenue?.cover_image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name.startsWith('dimensions.')) {
      const dimensionKey = name.split('.')[1];
      setFormData({
        ...formData,
        dimensions: {
          ...formData.dimensions!,
          [dimensionKey]: dimensionKey === 'unit' ? value : parseFloat(value) || 0
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      let venue: Venue | null = null;
      
      if (initialVenue) {
        // Update existing venue
        const { success, error } = await updateVenue({
          ...formData,
          id: initialVenue.id
        });
        
        if (error) throw error;
        if (!success) throw new Error('Failed to update venue');
        
        venue = {
          ...initialVenue,
          ...formData,
          updated_at: new Date().toISOString()
        };
      } else {
        // Create new venue
        const { venue: newVenue, error } = await createVenue(formData);
        if (error) throw error;
        if (!newVenue) throw new Error('Failed to create venue');
        
        venue = newVenue;
      }
      
      // Upload cover image if provided
      if (coverImage && venue) {
        const { url, error } = await uploadVenueCoverImage(venue.id, coverImage);
        if (error) throw error;
        if (url) {
          venue.cover_image = url;
        }
      }
      
      if (venue) {
        onSuccess(venue);
      }
    } catch (err) {
      console.error('Error submitting venue form:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {/* Venue Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Venue Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      
      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      
      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      
      {/* Dimensions */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Dimensions</h3>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label htmlFor="dimensions.width" className="block text-xs text-gray-500">
              Width
            </label>
            <input
              type="number"
              id="dimensions.width"
              name="dimensions.width"
              value={formData.dimensions?.width || 0}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="dimensions.length" className="block text-xs text-gray-500">
              Length
            </label>
            <input
              type="number"
              id="dimensions.length"
              name="dimensions.length"
              value={formData.dimensions?.length || 0}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="dimensions.height" className="block text-xs text-gray-500">
              Height
            </label>
            <input
              type="number"
              id="dimensions.height"
              name="dimensions.height"
              value={formData.dimensions?.height || 0}
              onChange={handleChange}
              min="0"
              step="0.1"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="dimensions.unit" className="block text-xs text-gray-500">
              Unit
            </label>
            <select
              id="dimensions.unit"
              name="dimensions.unit"
              value={formData.dimensions?.unit || 'feet'}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="feet">feet</option>
              <option value="meters">meters</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Image</label>
        <div className="mt-1 flex items-center space-x-4">
          {coverImagePreview && (
            <div className="w-24 h-24 relative">
              <img 
                src={coverImagePreview} 
                alt="Cover" 
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"
                onClick={() => {
                  setCoverImage(null);
                  setCoverImagePreview(null);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          <label className="cursor-pointer bg-gray-50 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100">
            {coverImagePreview ? 'Change Image' : 'Upload Image'}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>
      
      {/* Public Setting */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_public"
          name="is_public"
          checked={formData.is_public || false}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
          Make this venue public (visible to other users)
        </label>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving...'
            : initialVenue
              ? 'Update Venue'
              : 'Create Venue'
          }
        </button>
      </div>
    </form>
  );
};

export default VenueForm; 