import { Asset } from '../types/canvas';

export enum EventType {
  WEDDING = 'wedding',
  CONFERENCE = 'conference',
  CONCERT = 'concert', 
  EXHIBITION = 'exhibition',
  BANQUET = 'banquet',
  MEETING = 'meeting',
  GRADUATION = 'graduation',
  TRADE_SHOW = 'trade_show',
  GALA = 'gala',
  CORPORATE = 'corporate'
}

export enum RequirementCategory {
  SEATING = 'seating',
  CATERING = 'catering',
  AUDIOVISUAL = 'audiovisual',
  LIGHTING = 'lighting',
  DECOR = 'decor',
  ACCESSIBILITY = 'accessibility',
  STAFFING = 'staffing',
  LOGISTICS = 'logistics',
  SAFETY = 'safety'
}

export enum RequirementStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  NOT_APPLICABLE = 'not_applicable'
}

export enum RequirementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Requirement {
  id: string;
  title: string;
  description: string;
  category: RequirementCategory;
  status: RequirementStatus;
  priority: RequirementPriority;
  estimatedCost?: number;
  responsible?: string;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRequirements {
  eventId: string;
  eventType: EventType;
  venueId: string;
  attendeeCount: number;
  requirements: Requirement[];
  budget?: number;
  startDate?: Date;
  endDate?: Date;
  lastUpdated: Date;
}

// Standard requirements by event type
const standardRequirementsByEventType: Record<EventType, Partial<Requirement>[]> = {
  [EventType.WEDDING]: [
    {
      title: 'Ceremony seating',
      description: 'Chairs arranged for wedding ceremony',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Reception tables and chairs',
      description: 'Tables and chairs for dinner reception',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Head table/sweetheart table',
      description: 'Special table for wedding couple',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Catering service',
      description: 'Food and beverage service for guests',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Bar service',
      description: 'Alcoholic and non-alcoholic beverage service',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Dance floor',
      description: 'Space for dancing',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'DJ or band area',
      description: 'Space and power for musical entertainment',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Cake table',
      description: 'Table for wedding cake display',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Gift table',
      description: 'Table for gifts',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.LOW
    },
    {
      title: 'Centerpieces',
      description: 'Decorative elements for tables',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Lighting',
      description: 'Decorative and functional lighting',
      category: RequirementCategory.LIGHTING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Photo booth area',
      description: 'Space for photos',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.LOW
    },
    {
      title: 'Accessible entrances',
      description: 'Ensure accessibility for all guests',
      category: RequirementCategory.ACCESSIBILITY,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Parking',
      description: 'Sufficient parking for guests',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.MEDIUM
    }
  ],
  [EventType.CONFERENCE]: [
    {
      title: 'Presentation stage',
      description: 'Main stage for speakers',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Audience seating',
      description: 'Chairs for attendees',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Projector and screen',
      description: 'Visual display for presentations',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Sound system',
      description: 'Microphones and speakers',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Wi-Fi access',
      description: 'Internet connectivity for attendees',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Registration area',
      description: 'Check-in for attendees',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Breakout rooms',
      description: 'Smaller spaces for sessions',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Catering service',
      description: 'Food and beverage service',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Coffee break station',
      description: 'Refreshments during breaks',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Accessible facilities',
      description: 'Ensure accessibility for all attendees',
      category: RequirementCategory.ACCESSIBILITY,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Technical staff',
      description: 'Support for AV equipment',
      category: RequirementCategory.STAFFING,
      priority: RequirementPriority.HIGH
    }
  ],
  [EventType.CONCERT]: [
    {
      title: 'Main stage',
      description: 'Performance area for artists',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Sound system',
      description: 'Professional audio setup',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Lighting rig',
      description: 'Stage and effect lighting',
      category: RequirementCategory.LIGHTING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Standing area',
      description: 'Space for audience',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Backstage area',
      description: 'Space for performers',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Security personnel',
      description: 'Crowd management',
      category: RequirementCategory.STAFFING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Bar service',
      description: 'Beverage service for attendees',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Merchandise area',
      description: 'Space for selling merchandise',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.LOW
    },
    {
      title: 'Emergency exits',
      description: 'Clearly marked and accessible exits',
      category: RequirementCategory.SAFETY,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'First aid station',
      description: 'Medical support',
      category: RequirementCategory.SAFETY,
      priority: RequirementPriority.HIGH
    }
  ],
  // Additional event types...
  [EventType.EXHIBITION]: [
    {
      title: 'Exhibition booths',
      description: 'Spaces for exhibitors',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Power supply',
      description: 'Electricity for booths',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Wi-Fi access',
      description: 'Internet connectivity',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Registration area',
      description: 'Check-in for attendees',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Catering service',
      description: 'Food and beverage service',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Lighting',
      description: 'Adequate lighting for exhibits',
      category: RequirementCategory.LIGHTING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Staff for information desk',
      description: 'Personnel to assist attendees',
      category: RequirementCategory.STAFFING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Signage',
      description: 'Directional and informational signs',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Accessibility provisions',
      description: 'Ensure accessibility for all attendees',
      category: RequirementCategory.ACCESSIBILITY,
      priority: RequirementPriority.HIGH
    }
  ],
  [EventType.BANQUET]: [
    {
      title: 'Dining tables and chairs',
      description: 'Seating for guests',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Full catering service',
      description: 'Multi-course meal service',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Bar service',
      description: 'Alcoholic and non-alcoholic beverages',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Table settings',
      description: 'Linens, dishes, glassware, cutlery',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Wait staff',
      description: 'Staff for serving',
      category: RequirementCategory.STAFFING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Ambient lighting',
      description: 'Decorative lighting',
      category: RequirementCategory.LIGHTING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Centerpieces',
      description: 'Table decorations',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Audio system',
      description: 'For speeches and background music',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Coat check',
      description: 'Storage for guests\' coats',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.LOW
    }
  ],
  [EventType.MEETING]: [
    {
      title: 'Conference table and chairs',
      description: 'Seating for attendees',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Projector/display',
      description: 'Visual display for presentations',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Wi-Fi access',
      description: 'Internet connectivity',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Conference phone',
      description: 'For remote participants',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Refreshments',
      description: 'Water, coffee, snacks',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Notepads and pens',
      description: 'Writing materials for attendees',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.LOW
    },
    {
      title: 'Whiteboard/flip chart',
      description: 'For visual collaboration',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.MEDIUM
    }
  ],
  [EventType.GRADUATION]: [
    {
      title: 'Stage with steps',
      description: 'For graduates to walk across',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Seating for graduates',
      description: 'Chairs for graduating students',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Audience seating',
      description: 'Chairs for family and friends',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Sound system',
      description: 'Microphones and speakers',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Podium',
      description: 'For speeches',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Decorations',
      description: 'School colors and graduation theme',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Photography area',
      description: 'Space for professional photos',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Reception area',
      description: 'Post-ceremony gathering space',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Accessible seating',
      description: 'For guests with disabilities',
      category: RequirementCategory.ACCESSIBILITY,
      priority: RequirementPriority.HIGH
    }
  ],
  [EventType.TRADE_SHOW]: [
    {
      title: 'Exhibition booths',
      description: 'Standard booth spaces',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Power supply',
      description: 'Electricity for exhibitors',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Wi-Fi access',
      description: 'High-speed internet',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Registration area',
      description: 'Check-in for attendees',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Speaker area',
      description: 'Space for presentations',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Catering service',
      description: 'Food and beverage service',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Security personnel',
      description: 'After-hours security',
      category: RequirementCategory.STAFFING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Loading dock access',
      description: 'For exhibitor setup',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Exhibitor services desk',
      description: 'Support for vendors',
      category: RequirementCategory.STAFFING,
      priority: RequirementPriority.MEDIUM
    }
  ],
  [EventType.GALA]: [
    {
      title: 'Round dining tables',
      description: 'Formal dinner seating',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Premium catering',
      description: 'Multi-course gourmet meal',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Full bar service',
      description: 'Premium beverages',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Stage for presentations',
      description: 'For speakers and awards',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Elegant decorations',
      description: 'Upscale event decor',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Audio-visual system',
      description: 'For presentations and entertainment',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Dance floor',
      description: 'Space for dancing',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Entertainment',
      description: 'Live music or performers',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Valet parking',
      description: 'Premium parking service',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Red carpet entrance',
      description: 'For grand arrival',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.LOW
    }
  ],
  [EventType.CORPORATE]: [
    {
      title: 'Professional seating',
      description: 'Comfortable chairs for attendees',
      category: RequirementCategory.SEATING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Presentation equipment',
      description: 'Projector, screen, clicker',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Wi-Fi access',
      description: 'Reliable internet connection',
      category: RequirementCategory.AUDIOVISUAL,
      priority: RequirementPriority.CRITICAL
    },
    {
      title: 'Catering service',
      description: 'Professional meal service',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Coffee service',
      description: 'Throughout the event',
      category: RequirementCategory.CATERING,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Breakout rooms',
      description: 'For smaller discussions',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Corporate branding',
      description: 'Display of company logo',
      category: RequirementCategory.DECOR,
      priority: RequirementPriority.MEDIUM
    },
    {
      title: 'Technical support',
      description: 'On-site IT assistance',
      category: RequirementCategory.STAFFING,
      priority: RequirementPriority.HIGH
    },
    {
      title: 'Registration desk',
      description: 'For check-in process',
      category: RequirementCategory.LOGISTICS,
      priority: RequirementPriority.MEDIUM
    }
  ]
};

/**
 * Generates requirements list for an event
 */
export function generateRequirements(
  eventType: EventType,
  attendeeCount: number,
  assets?: Asset[]
): Requirement[] {
  const baseRequirements = standardRequirementsByEventType[eventType] || [];
  const currentDate = new Date();
  
  // Add unique IDs and default status
  return baseRequirements.map((req) => ({
    ...req,
    id: generateId(),
    status: RequirementStatus.PENDING,
    createdAt: currentDate,
    updatedAt: currentDate
  } as Requirement));
}

/**
 * Checks if existing assets fulfill requirements
 */
export function checkRequirementsAgainstAssets(
  requirements: Requirement[],
  assets: Asset[]
): Requirement[] {
  // In a real implementation, this would analyze the assets to see if they
  // match the requirements (e.g., check if there are enough tables for the seating requirement)
  
  return requirements.map(req => {
    // For this example, we'll just return the requirements as is
    return req;
  });
}

/**
 * Calculate completion percentage of requirements
 */
export function calculateCompletionPercentage(requirements: Requirement[]): number {
  if (requirements.length === 0) return 0;
  
  const completed = requirements.filter(
    req => req.status === RequirementStatus.COMPLETED || 
           req.status === RequirementStatus.NOT_APPLICABLE
  ).length;
  
  return Math.round((completed / requirements.length) * 100);
}

/**
 * Get requirements by category
 */
export function getRequirementsByCategory(
  requirements: Requirement[]
): Record<RequirementCategory, Requirement[]> {
  const categorized: Record<RequirementCategory, Requirement[]> = {} as Record<RequirementCategory, Requirement[]>;
  
  // Initialize all categories with empty arrays
  Object.values(RequirementCategory).forEach(category => {
    categorized[category] = [];
  });
  
  // Populate with requirements
  requirements.forEach(req => {
    categorized[req.category].push(req);
  });
  
  return categorized;
}

/**
 * Generate a simple ID
 */
function generateId(): string {
  return 'req_' + Math.random().toString(36).substring(2, 15);
} 