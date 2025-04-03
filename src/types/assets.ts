export interface Asset {
  id: string
  name: string
  imageUrl: string
  category: string
  tags?: string[]
  width?: number
  height?: number
  x?: number
  y?: number
  scaleX?: number
  scaleY?: number
  rotation?: number
  isVisible?: boolean
  isLocked?: boolean
  createdBy?: string
  createdAt?: string
  text?: string
  fontSize?: number
  fontFamily?: string
  fill?: string
  isTextAnnotation?: boolean
  isShape?: boolean
  shapeType?: 'rectangle' | 'circle' | 'line' | 'arrow'
  stroke?: string
  strokeWidth?: number
  points?: number[]
  radius?: number
}

export type AssetCategory = 
  | 'furniture' 
  | 'decor' 
  | 'lighting' 
  | 'staging' 
  | 'floral' 
  | 'technical' 
  | 'misc'
  | 'annotation'
  | 'shape' 