import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { aiService } from './aiService';

interface StyleRecommendationsProps {
  venueId?: string;
  eventType?: string;
  onClose?: () => void;
  onSelectStyle?: (styleId: string, palette: string[]) => void;
}

const eventTypes = [
  'Wedding',
  'Corporate Conference',
  'Birthday Party',
  'Networking Event',
  'Gala Dinner',
  'Workshop',
  'Exhibition',
  'Concert',
  'Social Gathering',
  'Other'
];

const StyleRecommendations: React.FC<StyleRecommendationsProps> = ({
  venueId: propVenueId,
  eventType: propEventType = 'Wedding',
  onClose,
  onSelectStyle
}) => {
  const params = useParams();
  const venueId = propVenueId || params.venueId || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventType, setEventType] = useState(propEventType);
  const [styleRecommendations, setStyleRecommendations] = useState<any[]>([]);
  
  // Hard-coded style recommendations for demo purposes
  // In a real app, this would come from the AI service
  const mockStyleRecommendations = [
    {
      id: 'elegant-wedding',
      name: 'Elegant Wedding',
      description: 'A sophisticated and romantic setting with soft lighting, floral accents, and a muted color palette. Perfect for traditional ceremonies and receptions.',
      previewUrl: '/assets/ai/styles/elegant-wedding.jpg',
      colorPalette: ['#F5F5F5', '#D8BFD8', '#DDA0DD', '#800080', '#4B0082'],
      moodImages: [
        '/assets/ai/styles/wedding-mood-1.jpg',
        '/assets/ai/styles/wedding-mood-2.jpg',
        '/assets/ai/styles/wedding-mood-3.jpg',
      ],
      confidence: 95,
    },
    {
      id: 'rustic-wedding',
      name: 'Rustic Wedding',
      description: 'A warm, natural setting with wooden elements, greenery, and earthy tones. Ideal for barn venues and outdoor celebrations.',
      previewUrl: '/assets/ai/styles/rustic-wedding.jpg',
      colorPalette: ['#F5DEB3', '#D2B48C', '#8B4513', '#556B2F', '#2F4F4F'],
      moodImages: [
        '/assets/ai/styles/rustic-mood-1.jpg',
        '/assets/ai/styles/rustic-mood-2.jpg',
        '/assets/ai/styles/rustic-mood-3.jpg',
      ],
      confidence: 88,
    },
    {
      id: 'modern-corporate',
      name: 'Modern Corporate',
      description: 'A clean, professional environment with sleek furniture, minimalist design, and a focus on functionality and brand identity.',
      previewUrl: '/assets/ai/styles/modern-corporate.jpg',
      colorPalette: ['#FFFFFF', '#E0E0E0', '#0047AB', '#000000', '#708090'],
      moodImages: [
        '/assets/ai/styles/corporate-mood-1.jpg',
        '/assets/ai/styles/corporate-mood-2.jpg',
        '/assets/ai/styles/corporate-mood-3.jpg',
      ],
      confidence: 92,
    },
    {
      id: 'festive-birthday',
      name: 'Festive Birthday',
      description: 'A vibrant, playful atmosphere with bold colors, party decorations, and a focus on entertainment and fun.',
      previewUrl: '/assets/ai/styles/festive-birthday.jpg',
      colorPalette: ['#FF1493', '#FFD700', '#00BFFF', '#7CFC00', '#FF4500'],
      moodImages: [
        '/assets/ai/styles/birthday-mood-1.jpg',
        '/assets/ai/styles/birthday-mood-2.jpg',
        '/assets/ai/styles/birthday-mood-3.jpg',
      ],
      confidence: 90,
    },
  ];
  
  useEffect(() => {
    fetchStyleRecommendations();
  }, [eventType, venueId]);
  
  const fetchStyleRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, call the AI service
      // const recommendations = await aiService.getStyleRecommendations(venueId, eventType);
      
      // For now, use mock data filtered by event type
      let recommendations = [...mockStyleRecommendations];
      
      if (eventType === 'Wedding') {
        recommendations = recommendations.filter(r => 
          r.id === 'elegant-wedding' || r.id === 'rustic-wedding'
        );
      } else if (eventType.includes('Corporate') || eventType.includes('Conference')) {
        recommendations = recommendations.filter(r => 
          r.id === 'modern-corporate'
        );
      } else if (eventType.includes('Birthday') || eventType.includes('Party')) {
        recommendations = recommendations.filter(r => 
          r.id === 'festive-birthday'
        );
      }
      
      // If no matches, show all recommendations
      if (recommendations.length === 0) {
        recommendations = mockStyleRecommendations;
      }
      
      setStyleRecommendations(recommendations);
    } catch (err) {
      setError('Failed to load style recommendations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEventType(e.target.value);
  };
  
  const handleSelectStyle = (styleId: string, palette: string[]) => {
    if (onSelectStyle) {
      onSelectStyle(styleId, palette);
    }
  };
  
  return (
    <div className="ai-style-recommendations bg-white rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI Style Recommendations</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Our AI can suggest venue style recommendations based on your event type. 
          Select an event type to see personalized style suggestions.
        </p>
        
        <div className="mb-4">
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
            Event Type
          </label>
          <select
            id="eventType"
            value={eventType}
            onChange={handleEventTypeChange}
            className="w-full md:w-64 rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      ) : (
        <div className="style-recommendations-grid">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {styleRecommendations.map(style => (
              <div 
                key={style.id} 
                className="style-card bg-gray-50 rounded-lg overflow-hidden shadow border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img 
                    src={style.previewUrl || '/assets/default-style-preview.jpg'} 
                    alt={`Preview of ${style.name}`}
                    className="object-cover w-full h-48"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/default-style-preview.jpg';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {style.confidence}% Match
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">{style.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{style.description}</p>
                  
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Color Palette</h5>
                    <div className="flex space-x-2">
                      {style.colorPalette.map((color: string, index: number) => (
                        <div 
                          key={index} 
                          className="h-8 w-8 rounded-full border border-gray-300" 
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSelectStyle(style.id, style.colorPalette)}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Apply This Style
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleRecommendations; 