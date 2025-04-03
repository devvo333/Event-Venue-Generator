import { RequirementCategory } from './requirementsChecker';

/**
 * Vendor types and categories for event planning
 */
export enum VendorCategory {
  VENUE = 'venue',
  CATERING = 'catering',
  DECOR = 'decor',
  ENTERTAINMENT = 'entertainment',
  PHOTOGRAPHY = 'photography',
  VIDEOGRAPHY = 'videography',
  AUDIO_VISUAL = 'audio_visual',
  LIGHTING = 'lighting',
  TRANSPORTATION = 'transportation',
  RENTALS = 'rentals',
  SECURITY = 'security',
  STAFFING = 'staffing',
  FLORAL = 'floral',
  PLANNING = 'planning',
  OTHER = 'other'
}

/**
 * Map vendor categories to requirement categories for integration
 */
export const VENDOR_TO_REQUIREMENT_CATEGORY: Record<VendorCategory, RequirementCategory> = {
  [VendorCategory.VENUE]: RequirementCategory.SEATING,
  [VendorCategory.CATERING]: RequirementCategory.CATERING,
  [VendorCategory.DECOR]: RequirementCategory.DECOR,
  [VendorCategory.ENTERTAINMENT]: RequirementCategory.AUDIOVISUAL,
  [VendorCategory.PHOTOGRAPHY]: RequirementCategory.AUDIOVISUAL,
  [VendorCategory.VIDEOGRAPHY]: RequirementCategory.AUDIOVISUAL,
  [VendorCategory.AUDIO_VISUAL]: RequirementCategory.AUDIOVISUAL,
  [VendorCategory.LIGHTING]: RequirementCategory.LIGHTING,
  [VendorCategory.TRANSPORTATION]: RequirementCategory.LOGISTICS,
  [VendorCategory.RENTALS]: RequirementCategory.SEATING,
  [VendorCategory.SECURITY]: RequirementCategory.STAFFING,
  [VendorCategory.STAFFING]: RequirementCategory.STAFFING,
  [VendorCategory.FLORAL]: RequirementCategory.DECOR,
  [VendorCategory.PLANNING]: RequirementCategory.LOGISTICS,
  [VendorCategory.OTHER]: RequirementCategory.LOGISTICS
};

/**
 * Vendor service types
 */
export enum ServiceType {
  FULL_SERVICE = 'full_service', // Provides comprehensive services
  PARTIAL_SERVICE = 'partial_service', // Provides select services
  CONSULTATION = 'consultation', // Provides advice and guidance
  DAY_OF = 'day_of', // Provides services only on event day
  RENTAL_ONLY = 'rental_only', // Provides equipment/items for rental
  CUSTOM = 'custom' // Custom service arrangements
}

/**
 * Vendor rating interface
 */
export interface VendorRating {
  overall: number; // 1-5 star rating
  reliability: number; // 1-5 rating
  quality: number; // 1-5 rating
  value: number; // 1-5 rating
  communication: number; // 1-5 rating
  reviewCount: number;
  reviews: VendorReview[];
}

/**
 * Vendor review interface
 */
export interface VendorReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  eventType: string;
  date: Date;
  approved: boolean;
}

/**
 * Vendor package interface
 */
export interface VendorPackage {
  id: string;
  name: string;
  description: string;
  services: string[];
  basePrice: number;
  priceType: 'flat' | 'per_person' | 'per_hour' | 'custom';
  minQuantity?: number;
  maxQuantity?: number;
  minHours?: number;
  maxHours?: number;
  setupTime?: number;
  breakdownTime?: number;
  includesDelivery: boolean;
  includedItems: string[];
  additionalFees: Array<{
    name: string;
    amount: number;
    type: 'flat' | 'percentage';
  }>;
  availability: {
    leadTimeRequired: number; // in days
    advanceBookingLimit?: number; // in days
    seasonalAvailability?: Record<string, boolean>; // e.g., { "summer": true, "winter": false }
  };
}

/**
 * Vendor interface
 */
export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  category: VendorCategory;
  subCategories?: VendorCategory[];
  serviceTypes: ServiceType[];
  description: string;
  logoUrl?: string;
  imageUrls?: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    serviceRadius?: number; // in miles
    willTravel: boolean;
    travelFees?: string;
  };
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    pinterest?: string;
    youtube?: string;
  };
  packages: VendorPackage[];
  rating: VendorRating;
  availableDates?: Record<string, boolean>;
  tags: string[];
  verified: boolean;
  featured: boolean;
  dateCreated: Date;
  dateUpdated: Date;
  preferredPaymentMethods: string[];
  cancellationPolicy?: string;
  insurance?: {
    hasInsurance: boolean;
    coverageAmount?: number;
    provider?: string;
  };
  notes?: string;
  status: 'active' | 'inactive' | 'pending';
}

/**
 * Vendor booking interface
 */
export interface VendorBooking {
  id: string;
  vendorId: string;
  packageId: string;
  eventId: string;
  userId: string;
  bookingDate: Date;
  serviceDate: Date;
  startTime: string;
  endTime: string;
  status: 'inquiry' | 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmount: number;
  depositAmount: number;
  depositPaid: boolean;
  balanceDueDate?: Date;
  balancePaid: boolean;
  customRequirements?: string;
  notes?: string;
  contractUrl?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generate a unique ID for vendors
 */
function generateId(): string {
  return 'v_' + Math.random().toString(36).substring(2, 11);
}

/**
 * Filter vendors based on criteria
 */
export function filterVendors(
  vendors: Vendor[],
  filters: {
    categories?: VendorCategory[];
    serviceTypes?: ServiceType[];
    location?: string;
    minRating?: number;
    maxPrice?: number;
    searchTerm?: string;
    tags?: string[];
    availability?: Date;
    verified?: boolean;
    featured?: boolean;
  }
): Vendor[] {
  return vendors.filter(vendor => {
    // Filter by categories
    if (filters.categories && filters.categories.length > 0) {
      const vendorCategories = [vendor.category, ...(vendor.subCategories || [])];
      if (!filters.categories.some(category => vendorCategories.includes(category))) {
        return false;
      }
    }

    // Filter by service types
    if (filters.serviceTypes && filters.serviceTypes.length > 0) {
      if (!filters.serviceTypes.some(type => vendor.serviceTypes.includes(type))) {
        return false;
      }
    }

    // Filter by location
    if (filters.location) {
      const locationStr = `${vendor.location.city} ${vendor.location.state} ${vendor.location.zipCode} ${vendor.location.country}`.toLowerCase();
      if (!locationStr.includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    // Filter by minimum rating
    if (filters.minRating !== undefined) {
      if (vendor.rating.overall < filters.minRating) {
        return false;
      }
    }

    // Filter by maximum price (checks if any package is below the max price)
    if (filters.maxPrice !== undefined) {
      if (!vendor.packages.some(pkg => pkg.basePrice <= filters.maxPrice!)) {
        return false;
      }
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const searchableText = `${vendor.name} ${vendor.description} ${vendor.tags.join(' ')}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some(tag => vendor.tags.includes(tag))) {
        return false;
      }
    }

    // Filter by availability on a specific date
    if (filters.availability) {
      const dateString = filters.availability.toISOString().split('T')[0];
      if (vendor.availableDates && !vendor.availableDates[dateString]) {
        return false;
      }
    }

    // Filter by verification status
    if (filters.verified !== undefined && vendor.verified !== filters.verified) {
      return false;
    }

    // Filter by featured status
    if (filters.featured !== undefined && vendor.featured !== filters.featured) {
      return false;
    }

    return true;
  });
}

/**
 * Sort vendors based on criteria
 */
export function sortVendors(
  vendors: Vendor[],
  sortBy: 'rating' | 'price' | 'name' | 'date_created' | 'popularity',
  order: 'asc' | 'desc' = 'desc'
): Vendor[] {
  return [...vendors].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'rating':
        comparison = a.rating.overall - b.rating.overall;
        break;
      case 'price':
        // Compare the lowest price package for each vendor
        const aMinPrice = Math.min(...a.packages.map(pkg => pkg.basePrice));
        const bMinPrice = Math.min(...b.packages.map(pkg => pkg.basePrice));
        comparison = aMinPrice - bMinPrice;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date_created':
        comparison = a.dateCreated.getTime() - b.dateCreated.getTime();
        break;
      case 'popularity':
        comparison = a.rating.reviewCount - b.rating.reviewCount;
        break;
      default:
        comparison = 0;
    }

    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Calculate total cost for a vendor booking
 */
export function calculateVendorBookingCost(
  vendor: Vendor,
  packageId: string,
  quantity: number,
  hours: number,
  includeAdditionalFees: boolean = true
): {
  basePrice: number;
  additionalFees: Record<string, number>;
  total: number;
} {
  const selectedPackage = vendor.packages.find(pkg => pkg.id === packageId);
  
  if (!selectedPackage) {
    throw new Error(`Package with ID ${packageId} not found for vendor ${vendor.name}`);
  }

  let basePrice = selectedPackage.basePrice;
  
  // Apply quantity or hours multiplier based on price type
  switch (selectedPackage.priceType) {
    case 'per_person':
      basePrice *= quantity;
      break;
    case 'per_hour':
      basePrice *= hours;
      break;
    case 'flat':
    case 'custom':
    default:
      // No additional calculation for flat or custom price types
      break;
  }

  // Calculate additional fees
  const additionalFees: Record<string, number> = {};
  
  if (includeAdditionalFees) {
    selectedPackage.additionalFees.forEach(fee => {
      if (fee.type === 'flat') {
        additionalFees[fee.name] = fee.amount;
      } else if (fee.type === 'percentage') {
        additionalFees[fee.name] = (fee.amount / 100) * basePrice;
      }
    });
  }

  // Calculate total
  const total = basePrice + Object.values(additionalFees).reduce((sum, fee) => sum + fee, 0);

  return {
    basePrice,
    additionalFees,
    total
  };
}

/**
 * Check if a vendor is available for a given date range
 */
export function checkVendorAvailability(
  vendor: Vendor,
  startDate: Date,
  endDate: Date
): boolean {
  if (!vendor.availableDates) {
    return true; // Assume available if no availability data provided
  }

  // Create array of date strings between start and end date
  const dateStrings: string[] = [];
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  
  while (currentDate <= lastDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    dateStrings.push(dateString);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Check if all dates are available
  return dateStrings.every(dateString => 
    !vendor.availableDates || vendor.availableDates[dateString] !== false
  );
}

/**
 * Find vendors that match requirements
 */
export function findVendorsForRequirements(
  vendors: Vendor[],
  requirements: Array<{
    category: RequirementCategory;
    title: string;
    description: string;
    priority: string;
  }>
): Record<string, Vendor[]> {
  const recommendedVendors: Record<string, Vendor[]> = {};
  
  requirements.forEach(requirement => {
    // Find the corresponding vendor categories for this requirement
    const matchingVendorCategories = Object.entries(VENDOR_TO_REQUIREMENT_CATEGORY)
      .filter(([_, reqCategory]) => reqCategory === requirement.category)
      .map(([vendorCategory]) => vendorCategory as VendorCategory);
    
    // Find vendors that match the categories
    const matchingVendors = vendors.filter(vendor => 
      matchingVendorCategories.includes(vendor.category) ||
      (vendor.subCategories && vendor.subCategories.some(subCategory => 
        matchingVendorCategories.includes(subCategory)
      ))
    );
    
    if (matchingVendors.length > 0) {
      // Create a key for the requirement
      const requirementKey = `${requirement.title}-${requirement.description}`;
      
      // Sort vendors by rating to show the best ones first
      recommendedVendors[requirementKey] = sortVendors(matchingVendors, 'rating', 'desc');
    }
  });
  
  return recommendedVendors;
}

/**
 * Get formatted vendor category name
 */
export function formatVendorCategoryName(category: VendorCategory): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Get formatted service type name
 */
export function formatServiceTypeName(serviceType: ServiceType): string {
  return serviceType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Create a new vendor (for demo purposes)
 */
export function createDemoVendor(
  name: string,
  category: VendorCategory,
  serviceTypes: ServiceType[],
  location: {
    city: string;
    state: string;
    country: string;
  }
): Vendor {
  const now = new Date();
  
  return {
    id: generateId(),
    name,
    contactName: 'Contact Person',
    email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: '(555) 123-4567',
    website: `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com`,
    category,
    serviceTypes,
    description: `${name} provides top-quality ${formatVendorCategoryName(category)} services for events of all sizes.`,
    location: {
      address: '123 Main St',
      city: location.city,
      state: location.state,
      zipCode: '12345',
      country: location.country,
      willTravel: true,
      travelFees: 'Varies by distance'
    },
    packages: [
      {
        id: generateId(),
        name: 'Basic Package',
        description: `Standard ${formatVendorCategoryName(category)} services`,
        services: ['Basic service 1', 'Basic service 2'],
        basePrice: 500,
        priceType: 'flat',
        includesDelivery: true,
        includedItems: ['Item 1', 'Item 2'],
        additionalFees: [
          {
            name: 'Service Fee',
            amount: 10,
            type: 'percentage'
          }
        ],
        availability: {
          leadTimeRequired: 14
        }
      },
      {
        id: generateId(),
        name: 'Premium Package',
        description: `Enhanced ${formatVendorCategoryName(category)} services`,
        services: ['Premium service 1', 'Premium service 2', 'Premium service 3'],
        basePrice: 1200,
        priceType: 'flat',
        includesDelivery: true,
        includedItems: ['Premium item 1', 'Premium item 2', 'Premium item 3'],
        additionalFees: [
          {
            name: 'Service Fee',
            amount: 10,
            type: 'percentage'
          },
          {
            name: 'Setup Fee',
            amount: 100,
            type: 'flat'
          }
        ],
        availability: {
          leadTimeRequired: 21
        }
      }
    ],
    rating: {
      overall: 4.5,
      reliability: 4.6,
      quality: 4.7,
      value: 4.2,
      communication: 4.5,
      reviewCount: 24,
      reviews: [
        {
          id: generateId(),
          userId: 'user1',
          userName: 'John Smith',
          rating: 5,
          comment: 'Excellent service, highly recommend!',
          eventType: 'Wedding',
          date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          approved: true
        },
        {
          id: generateId(),
          userId: 'user2',
          userName: 'Jane Doe',
          rating: 4,
          comment: 'Great service, but a bit expensive.',
          eventType: 'Corporate Event',
          date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          approved: true
        }
      ]
    },
    tags: [category, ...serviceTypes, location.city.toLowerCase()],
    verified: true,
    featured: Math.random() > 0.7, // 30% chance of being featured
    dateCreated: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
    dateUpdated: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    preferredPaymentMethods: ['Credit Card', 'Bank Transfer'],
    cancellationPolicy: 'Full refund if cancelled 30 days before event date',
    insurance: {
      hasInsurance: true,
      coverageAmount: 1000000,
      provider: 'Event Insurance Co.'
    },
    status: 'active'
  };
}

/**
 * Generate demo vendors for testing
 */
export function generateDemoVendors(count: number = 20): Vendor[] {
  const vendors: Vendor[] = [];
  
  const cities = [
    { city: 'New York', state: 'NY', country: 'USA' },
    { city: 'Los Angeles', state: 'CA', country: 'USA' },
    { city: 'Chicago', state: 'IL', country: 'USA' },
    { city: 'Houston', state: 'TX', country: 'USA' },
    { city: 'Miami', state: 'FL', country: 'USA' },
    { city: 'Seattle', state: 'WA', country: 'USA' },
    { city: 'Denver', state: 'CO', country: 'USA' },
    { city: 'Boston', state: 'MA', country: 'USA' }
  ];
  
  const vendorNames = {
    [VendorCategory.VENUE]: ['Grand Ballroom', 'Elegant Events', 'Skyline Venues', 'Harbor View', 'City Center'],
    [VendorCategory.CATERING]: ['Gourmet Caterers', 'Divine Dining', 'Culinary Creations', 'Tasty Tables', 'Delicious Delights'],
    [VendorCategory.DECOR]: ['Elegant Designs', 'Beautiful Spaces', 'Decor Dreams', 'Style Setters', 'Creative Concepts'],
    [VendorCategory.ENTERTAINMENT]: ['Party Performers', 'Music Masters', 'Entertainment Express', 'Stellar Shows', 'Dynamic DJs'],
    [VendorCategory.PHOTOGRAPHY]: ['Perfect Pictures', 'Memorable Moments', 'Lens Masters', 'Capture Crew', 'Photo Phenom'],
    [VendorCategory.AUDIO_VISUAL]: ['Sound Solutions', 'AV Experts', 'Tech Team', 'Sight & Sound', 'Clear Vision'],
    [VendorCategory.FLORAL]: ['Floral Fantasies', 'Petal Perfect', 'Bloom Designs', 'Flower Power', 'Rose & Co.'],
    [VendorCategory.PLANNING]: ['Event Masters', 'Perfect Planning', 'Coordination Crew', 'Flawless Events', 'Planning Pros']
  };
  
  // Generate vendors for each category
  Object.values(VendorCategory).forEach(category => {
    // Skip some categories
    if (category === VendorCategory.OTHER) return;
    
    const categoryNames = vendorNames[category as keyof typeof vendorNames] || 
      [`${formatVendorCategoryName(category)} Pros`, `${formatVendorCategoryName(category)} Experts`];
    
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 vendors per category
    
    for (let i = 0; i < count; i++) {
      if (categoryNames[i]) {
        const location = cities[Math.floor(Math.random() * cities.length)];
        const serviceTypes = [
          ServiceType.FULL_SERVICE, 
          ServiceType.PARTIAL_SERVICE, 
          ServiceType.DAY_OF
        ].filter(() => Math.random() > 0.5); // Randomly select service types
        
        if (serviceTypes.length === 0) serviceTypes.push(ServiceType.FULL_SERVICE);
        
        vendors.push(createDemoVendor(
          categoryNames[i],
          category,
          serviceTypes,
          location
        ));
      }
    }
  });
  
  return vendors.slice(0, count);
} 