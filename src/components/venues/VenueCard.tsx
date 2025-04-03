import { Link } from 'react-router-dom'

interface VenueProps {
  venue: {
    id: string
    name: string
    description: string
    cover_image: string
    layouts_count: number
  }
}

const VenueCard = ({ venue }: VenueProps) => {
  const { id, name, description, cover_image, layouts_count } = venue
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
      <div 
        className="h-40 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${cover_image || '/placeholder-venue.jpg'})` 
        }}
      />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <span className="text-sm text-gray-500">
            {layouts_count} {layouts_count === 1 ? 'layout' : 'layouts'}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {description || 'No description available.'}
        </p>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <Link 
            to={`/venues/${id}`} 
            className="text-primary font-medium text-sm hover:underline"
          >
            View Details
          </Link>
          
          <div className="flex space-x-2">
            <Link 
              to={`/ar-viewer?venueId=${id}`} 
              className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              AR
            </Link>
            
            <Link 
              to={`/editor?venueId=${id}`} 
              className="text-sm px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-md hover:bg-opacity-20"
            >
              Create Layout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VenueCard 