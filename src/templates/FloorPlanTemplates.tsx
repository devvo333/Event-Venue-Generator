import React from 'react';
import { Asset } from '@/types/assets';

export interface FloorPlanTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: 'meeting' | 'conference' | 'wedding' | 'dining' | 'party' | 'classroom';
  assets: Asset[];
}

// Sample floor plan templates
export const floorPlanTemplates: FloorPlanTemplate[] = [
  {
    id: 'conference-u-shape',
    name: 'U-Shape Conference',
    description: 'A U-shaped conference setup ideal for presentations and discussions with up to 20 participants.',
    thumbnailUrl: '/templates/u-shape-conference.jpg',
    category: 'conference',
    assets: [
      // Tables forming a U-shape
      {
        id: 'table-1',
        name: 'Conference Table 1',
        imageUrl: '/assets/furniture/table-rectangular.png',
        category: 'furniture',
        x: 100,
        y: 100,
        width: 200,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      {
        id: 'table-2',
        name: 'Conference Table 2',
        imageUrl: '/assets/furniture/table-rectangular.png',
        category: 'furniture',
        x: 100,
        y: 200,
        width: 200,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Chairs around the U-shape
      {
        id: 'chair-1',
        name: 'Chair 1',
        imageUrl: '/assets/furniture/chair-office.png',
        category: 'furniture',
        x: 80,
        y: 100,
        width: 40,
        height: 40,
        rotation: 90,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Add more chairs and tables as needed
    ],
  },
  {
    id: 'theater-style',
    name: 'Theater Style',
    description: 'Theater-style seating for large presentations or speeches with a central aisle.',
    thumbnailUrl: '/templates/theater-style.jpg',
    category: 'conference',
    assets: [
      // Stage/Podium
      {
        id: 'stage',
        name: 'Presentation Stage',
        imageUrl: '/assets/staging/stage-rectangular.png',
        category: 'staging',
        x: 400,
        y: 50,
        width: 300,
        height: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Rows of chairs
      {
        id: 'chair-row-1',
        name: 'Chair Row 1',
        imageUrl: '/assets/furniture/chair-row.png',
        category: 'furniture',
        x: 250,
        y: 200,
        width: 500,
        height: 40,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      {
        id: 'chair-row-2',
        name: 'Chair Row 2',
        imageUrl: '/assets/furniture/chair-row.png',
        category: 'furniture',
        x: 250,
        y: 260,
        width: 500,
        height: 40,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Add more rows as needed
    ],
  },
  {
    id: 'classroom-setup',
    name: 'Classroom Setup',
    description: 'Rows of tables facing forward, ideal for training sessions and workshops.',
    thumbnailUrl: '/templates/classroom-setup.jpg',
    category: 'classroom',
    assets: [
      // Instructor table
      {
        id: 'instructor-table',
        name: 'Instructor Table',
        imageUrl: '/assets/furniture/table-rectangular.png',
        category: 'furniture',
        x: 400,
        y: 50,
        width: 240,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Student tables in rows
      {
        id: 'student-table-row-1-1',
        name: 'Student Table 1-1',
        imageUrl: '/assets/furniture/table-student.png',
        category: 'furniture',
        x: 200,
        y: 180,
        width: 160,
        height: 60,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      {
        id: 'student-table-row-1-2',
        name: 'Student Table 1-2',
        imageUrl: '/assets/furniture/table-student.png',
        category: 'furniture',
        x: 400,
        y: 180,
        width: 160,
        height: 60,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      {
        id: 'student-table-row-1-3',
        name: 'Student Table 1-3',
        imageUrl: '/assets/furniture/table-student.png',
        category: 'furniture',
        x: 600,
        y: 180,
        width: 160,
        height: 60,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Add chairs and more rows as needed
    ],
  },
  {
    id: 'banquet-round',
    name: 'Banquet with Round Tables',
    description: 'Traditional banquet layout with round tables, perfect for formal dinners and galas.',
    thumbnailUrl: '/templates/banquet-round.jpg',
    category: 'dining',
    assets: [
      // Head table
      {
        id: 'head-table',
        name: 'Head Table',
        imageUrl: '/assets/furniture/table-rectangular.png',
        category: 'furniture',
        x: 400,
        y: 50,
        width: 400,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Round tables
      {
        id: 'round-table-1',
        name: 'Round Table 1',
        imageUrl: '/assets/furniture/table-round.png',
        category: 'furniture',
        x: 200,
        y: 200,
        width: 120,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      {
        id: 'round-table-2',
        name: 'Round Table 2',
        imageUrl: '/assets/furniture/table-round.png',
        category: 'furniture',
        x: 400,
        y: 200,
        width: 120,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      {
        id: 'round-table-3',
        name: 'Round Table 3',
        imageUrl: '/assets/furniture/table-round.png',
        category: 'furniture',
        x: 600,
        y: 200,
        width: 120,
        height: 120,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Add chairs around tables as needed
    ],
  },
  {
    id: 'wedding-ceremony',
    name: 'Wedding Ceremony',
    description: 'Traditional wedding ceremony layout with an aisle and seating for guests.',
    thumbnailUrl: '/templates/wedding-ceremony.jpg',
    category: 'wedding',
    assets: [
      // Altar/Arch
      {
        id: 'altar',
        name: 'Wedding Arch',
        imageUrl: '/assets/decor/wedding-arch.png',
        category: 'decor',
        x: 400,
        y: 50,
        width: 150,
        height: 200,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Left side seating
      {
        id: 'left-chair-row-1',
        name: 'Left Chair Row 1',
        imageUrl: '/assets/furniture/chair-row.png',
        category: 'furniture',
        x: 250,
        y: 200,
        width: 200,
        height: 40,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Right side seating
      {
        id: 'right-chair-row-1',
        name: 'Right Chair Row 1',
        imageUrl: '/assets/furniture/chair-row.png',
        category: 'furniture',
        x: 550,
        y: 200,
        width: 200,
        height: 40,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Add more rows and decorations as needed
    ],
  },
  {
    id: 'cocktail-reception',
    name: 'Cocktail Reception',
    description: 'Open floor plan with cocktail tables, perfect for networking events.',
    thumbnailUrl: '/templates/cocktail-reception.jpg',
    category: 'party',
    assets: [
      // Bar area
      {
        id: 'bar',
        name: 'Bar Counter',
        imageUrl: '/assets/furniture/bar-counter.png',
        category: 'furniture',
        x: 100,
        y: 100,
        width: 250,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Cocktail tables scattered around
      {
        id: 'cocktail-table-1',
        name: 'Cocktail Table 1',
        imageUrl: '/assets/furniture/table-cocktail.png',
        category: 'furniture',
        x: 250,
        y: 250,
        width: 60,
        height: 60,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      {
        id: 'cocktail-table-2',
        name: 'Cocktail Table 2',
        imageUrl: '/assets/furniture/table-cocktail.png',
        category: 'furniture',
        x: 400,
        y: 200,
        width: 60,
        height: 60,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      {
        id: 'cocktail-table-3',
        name: 'Cocktail Table 3',
        imageUrl: '/assets/furniture/table-cocktail.png',
        category: 'furniture',
        x: 550,
        y: 300,
        width: 60,
        height: 60,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        isVisible: true,
        isLocked: false,
      },
      // Add more tables, lounge furniture, etc. as needed
    ],
  },
];

interface FloorPlanTemplateSelectorProps {
  onSelectTemplate: (template: FloorPlanTemplate) => void;
}

const FloorPlanTemplateSelector: React.FC<FloorPlanTemplateSelectorProps> = ({
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  
  const filteredTemplates = selectedCategory === 'all'
    ? floorPlanTemplates
    : floorPlanTemplates.filter(template => template.category === selectedCategory);
    
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Floor Plan Templates</h2>
        <p className="text-sm text-gray-600 mt-1">
          Choose a template as a starting point for your venue layout
        </p>
      </div>
      
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            className={`px-4 py-2 text-sm rounded-full whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            All Templates
          </button>
          {['conference', 'meeting', 'wedding', 'dining', 'party', 'classroom'].map(category => (
            <button
              key={category}
              className={`px-4 py-2 text-sm rounded-full capitalize whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
              {/* Template thumbnail with fallback */}
              {template.thumbnailUrl ? (
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ 
                    backgroundImage: `url(${template.thumbnailUrl})`,
                    backgroundSize: 'cover'
                  }}
                ></div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <div className="text-center">
                    <span className="block text-lg font-medium text-gray-500">{template.name}</span>
                    <span className="block text-sm text-gray-400">{template.category}</span>
                  </div>
                </div>
              )}
              
              {/* Category badge */}
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full capitalize">
                {template.category}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-800">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>
              
              {/* Assets count */}
              <p className="text-xs text-gray-500 mt-2">
                <span className="font-medium">{template.assets.length}</span> assets included
              </p>
              
              <div className="mt-3">
                <button
                  className="w-full px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary-dark transition-colors flex items-center justify-center"
                  onClick={() => onSelectTemplate(template)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorPlanTemplateSelector; 