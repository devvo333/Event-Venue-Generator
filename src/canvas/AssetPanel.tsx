import { useState, useEffect } from 'react'
import { supabase } from '@config/supabase'
import { Asset, AssetCategory } from '@/types/assets'

interface AssetPanelProps {
  onAssetSelected: (asset: Asset) => void
}

const AssetPanel: React.FC<AssetPanelProps> = ({ onAssetSelected }) => {
  const [assets, setAssets] = useState<Asset[]>([])
  const [categories, setCategories] = useState<AssetCategory[]>([
    'furniture',
    'decor',
    'lighting',
    'staging',
    'floral',
    'technical',
    'misc'
  ])
  const [activeCategory, setActiveCategory] = useState<AssetCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('status', 'approved')
        .order('category')
        
      if (error) throw error
      
      setAssets(data || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
      
      // Fallback to demo assets if API fails
      setAssets([
        {
          id: '1',
          name: 'Round Table',
          imageUrl: '/demo/assets/round-table.png',
          category: 'furniture',
          width: 100,
          height: 100
        },
        {
          id: '2',
          name: 'Chair',
          imageUrl: '/demo/assets/chair.png',
          category: 'furniture',
          width: 50,
          height: 50
        },
        {
          id: '3',
          name: 'Floor Lamp',
          imageUrl: '/demo/assets/floor-lamp.png',
          category: 'lighting',
          width: 40,
          height: 140
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter(asset => {
    // Filter by category
    const categoryMatch = activeCategory === 'all' || asset.category === activeCategory
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.tags && asset.tags.some(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    
    return categoryMatch && searchMatch
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Assets</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search assets..."
            className="input pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="flex overflow-x-auto p-2 border-b border-gray-200">
        <button
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap mr-2 ${
            activeCategory === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        
        {categories.map((category) => (
          <button
            key={category}
            className={`px-3 py-1 text-sm rounded-full whitespace-nowrap mr-2 ${
              activeCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 animate-pulse h-32 rounded-md"></div>
            ))}
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-gray-50 rounded-md p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onAssetSelected(asset)}
              >
                <div className="bg-white rounded mb-2 h-24 flex items-center justify-center overflow-hidden">
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <p className="text-sm truncate">{asset.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>No assets found</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <button
          className="btn btn-secondary w-full"
          onClick={() => {
            /* Navigate to asset upload page - will be implemented later */
          }}
        >
          Upload New Asset
        </button>
      </div>
    </div>
  )
}

export default AssetPanel 