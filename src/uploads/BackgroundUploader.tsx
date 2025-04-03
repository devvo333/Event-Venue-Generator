import { useState, useRef } from 'react'
import { supabase } from '@config/supabase'
import { useAuth } from '@hooks/useAuth'

interface BackgroundUploaderProps {
  isUploading: boolean
  setIsUploading: (value: boolean) => void
  onUploadComplete: (imageUrl: string) => void
}

const BackgroundUploader: React.FC<BackgroundUploaderProps> = ({
  isUploading,
  setIsUploading,
  onUploadComplete,
}) => {
  const { user } = useAuth()
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0])
    }
  }

  const uploadFile = async (file: File) => {
    if (!user) return
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `backgrounds/${fileName}`
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('venue-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100)
            setUploadProgress(percent)
          },
        })
        
      if (error) throw error
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('venue-images')
        .getPublicUrl(filePath)
        
      onUploadComplete(urlData.publicUrl)
    } catch (error) {
      console.error('Error uploading file:', error)
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-xl w-full text-center">
        <h2 className="text-2xl font-bold mb-6">Start with a Background Image</h2>
        <p className="text-gray-600 mb-8">
          Upload a photo of the venue or space you want to stage
        </p>
        
        <div
          className={`border-2 border-dashed rounded-lg p-12 mb-6 transition-colors ${
            dragActive ? 'border-primary bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <svg 
            className="w-20 h-20 mx-auto mb-4 text-gray-400"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          
          <p className="text-gray-500 mb-2">
            Drag & drop an image here, or
          </p>
          
          <button
            type="button"
            className="btn btn-primary mx-auto"
            onClick={handleButtonClick}
            disabled={isUploading}
          >
            Select Image
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          
          {isUploading && (
            <div className="mt-6 w-full">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}
        </div>
        
        <div className="text-gray-500 text-sm">
          <p className="mb-1">Tips for best results:</p>
          <ul className="text-left list-disc list-inside">
            <li>Use high-quality, well-lit images</li>
            <li>Clear, uncluttered spaces work best</li>
            <li>Straight-on shots (not angled) are easier to stage</li>
            <li>For scale reference, include known-size items in the photo</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default BackgroundUploader 