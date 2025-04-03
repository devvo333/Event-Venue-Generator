import { 
  EventType, 
  RequirementCategory, 
  Requirement,
  EventRequirements 
} from './requirementsChecker';

/**
 * Cost estimation constants and defaults
 */
export const COST_CONSTANTS = {
  // Per person costs by event type (in USD)
  PER_PERSON: {
    [EventType.WEDDING]: 150,
    [EventType.CONFERENCE]: 120,
    [EventType.CONCERT]: 80,
    [EventType.EXHIBITION]: 90,
    [EventType.BANQUET]: 130,
    [EventType.MEETING]: 70,
    [EventType.GRADUATION]: 50,
    [EventType.TRADE_SHOW]: 110,
    [EventType.GALA]: 200,
    [EventType.CORPORATE]: 100
  },
  
  // Base costs for venue by event type (in USD)
  VENUE_BASE: {
    [EventType.WEDDING]: 3000,
    [EventType.CONFERENCE]: 5000,
    [EventType.CONCERT]: 8000,
    [EventType.EXHIBITION]: 7000,
    [EventType.BANQUET]: 4000,
    [EventType.MEETING]: 1500,
    [EventType.GRADUATION]: 3000,
    [EventType.TRADE_SHOW]: 10000,
    [EventType.GALA]: 8000,
    [EventType.CORPORATE]: 3500
  },
  
  // Percentage of total budget by category (typical allocation)
  CATEGORY_PERCENTAGE: {
    [RequirementCategory.SEATING]: 0.10,
    [RequirementCategory.CATERING]: 0.35,
    [RequirementCategory.AUDIOVISUAL]: 0.15,
    [RequirementCategory.LIGHTING]: 0.08,
    [RequirementCategory.DECOR]: 0.12,
    [RequirementCategory.ACCESSIBILITY]: 0.03,
    [RequirementCategory.STAFFING]: 0.10,
    [RequirementCategory.LOGISTICS]: 0.05,
    [RequirementCategory.SAFETY]: 0.02
  },
  
  // Add-on costs for specific elements
  ADDONS: {
    BAR_SERVICE: 1500,
    DANCE_FLOOR: 1000,
    STAGE_SMALL: 800,
    STAGE_MEDIUM: 1500,
    STAGE_LARGE: 3000,
    PREMIUM_LINENS: 15,  // per table
    TECHNICAL_STAFF: 500,
    SECURITY_STAFF: 400,
    VALET_PARKING: 1000,
    PHOTOGRAPHY: 2000,
    VIDEOGRAPHY: 2500,
    ENTERTAINMENT: {
      DJ: 1200,
      LIVE_BAND: 3500,
      SPEAKER: 2000,
      PERFORMER: 1500
    }
  },
  
  // Multipliers for different regions (cost adjustment)
  REGION_MULTIPLIERS: {
    "NORTHEAST": 1.3,
    "WEST_COAST": 1.4,
    "MIDWEST": 0.9,
    "SOUTH": 0.85,
    "SOUTHWEST": 0.95,
    "INTERNATIONAL": 1.2
  },
  
  // Season multipliers (cost adjustment)
  SEASON_MULTIPLIERS: {
    "PEAK": 1.3,   // Summer, holidays
    "SHOULDER": 1.0, // Spring, fall
    "OFF_PEAK": 0.8  // Winter (non-holiday)
  },
  
  // Tax and service fee percentages
  TAX_PERCENTAGE: 0.08,
  SERVICE_FEE_PERCENTAGE: 0.22,
  
  // Contingency percentage recommended
  CONTINGENCY_PERCENTAGE: 0.15
};

/**
 * Budget item
 */
export interface BudgetItem {
  id: string;
  category: RequirementCategory;
  title: string;
  description: string;
  estimatedCost: number;
  actualCost?: number;
  vendor?: string;
  notes?: string;
  requirementId?: string;
  isRequired: boolean;
}

/**
 * Budget breakdown by category
 */
export interface BudgetBreakdown {
  totalBudget: number;
  categories: Record<RequirementCategory | 'other', {
    allocation: number;
    percentage: number;
    items: BudgetItem[];
  }>;
  serviceFees: number;
  taxes: number;
  contingency: number;
  grandTotal: number;
}

/**
 * Budget configuration options
 */
export interface BudgetOptions {
  region?: keyof typeof COST_CONSTANTS.REGION_MULTIPLIERS;
  season?: keyof typeof COST_CONSTANTS.SEASON_MULTIPLIERS;
  includeServiceFee?: boolean;
  includeTax?: boolean;
  includeContingency?: boolean;
  customPerPersonCost?: Record<EventType, number>;
  customCategoryAllocation?: Record<RequirementCategory, number>;
  additionalItems?: BudgetItem[];
}

/**
 * Generate a unique ID for budget items
 */
function generateId(): string {
  return 'bid_' + Math.random().toString(36).substring(2, 11);
}

/**
 * Calculate baseline budget based on event type and attendee count
 */
export function calculateBaselineBudget(
  eventType: EventType,
  attendeeCount: number,
  options?: BudgetOptions
): number {
  // Get per person cost based on event type
  const perPersonCost = options?.customPerPersonCost?.[eventType] || 
    COST_CONSTANTS.PER_PERSON[eventType];
  
  // Get base venue cost
  const baseVenueCost = COST_CONSTANTS.VENUE_BASE[eventType];
  
  // Apply region and season multipliers if specified
  const regionMultiplier = options?.region ? 
    COST_CONSTANTS.REGION_MULTIPLIERS[options.region] : 1;
  
  const seasonMultiplier = options?.season ? 
    COST_CONSTANTS.SEASON_MULTIPLIERS[options.season] : 1;
  
  // Calculate total baseline budget
  return (
    (perPersonCost * attendeeCount) + 
    baseVenueCost
  ) * regionMultiplier * seasonMultiplier;
}

/**
 * Create budget items from requirements
 */
export function createBudgetItemsFromRequirements(
  requirements: Requirement[]
): BudgetItem[] {
  return requirements.map(req => {
    const isHighPriority = req.priority === 'critical' || req.priority === 'high';
    
    return {
      id: generateId(),
      requirementId: req.id,
      category: req.category,
      title: req.title,
      description: req.description,
      estimatedCost: req.estimatedCost || 0,
      vendor: req.responsible,
      notes: req.notes,
      isRequired: isHighPriority
    };
  });
}

/**
 * Distribute the budget across categories
 */
export function distributeBudgetToCategories(
  totalBudget: number,
  options?: BudgetOptions
): Record<RequirementCategory, number> {
  const categoryAllocations: Record<RequirementCategory, number> = {} as any;
  
  // Use custom allocations if provided, otherwise use defaults
  const allocations = options?.customCategoryAllocation || COST_CONSTANTS.CATEGORY_PERCENTAGE;
  
  // Distribute budget according to category percentages
  for (const category of Object.values(RequirementCategory)) {
    categoryAllocations[category] = totalBudget * (allocations[category] || 0);
  }
  
  return categoryAllocations;
}

/**
 * Apply costs to budget items based on category allocations
 */
export function applyCostsToBudgetItems(
  budgetItems: BudgetItem[],
  categoryAllocations: Record<RequirementCategory, number>
): BudgetItem[] {
  // Group items by category
  const itemsByCategory: Record<RequirementCategory, BudgetItem[]> = {} as any;
  
  for (const category of Object.values(RequirementCategory)) {
    itemsByCategory[category] = budgetItems.filter(item => item.category === category);
  }
  
  // For each category, distribute the allocated budget
  // Items with estimatedCost > 0 keep their value, remaining budget is distributed among other items
  const updatedItems: BudgetItem[] = [];
  
  for (const category of Object.values(RequirementCategory)) {
    const items = itemsByCategory[category];
    if (!items || items.length === 0) continue;
    
    let categoryBudget = categoryAllocations[category];
    const itemsWithCost = items.filter(item => item.estimatedCost > 0);
    
    // Subtract existing costs
    for (const item of itemsWithCost) {
      categoryBudget -= item.estimatedCost;
      updatedItems.push(item);
    }
    
    // Distribute remaining budget to items without cost
    const itemsWithoutCost = items.filter(item => item.estimatedCost === 0);
    const perItemBudget = itemsWithoutCost.length > 0 ? 
      categoryBudget / itemsWithoutCost.length : 0;
    
    for (const item of itemsWithoutCost) {
      updatedItems.push({
        ...item,
        estimatedCost: Math.max(0, perItemBudget)
      });
    }
  }
  
  return updatedItems;
}

/**
 * Generate a complete budget breakdown
 */
export function generateBudgetBreakdown(
  eventType: EventType,
  attendeeCount: number,
  requirements: Requirement[],
  options?: BudgetOptions
): BudgetBreakdown {
  // Calculate baseline budget
  const totalBudget = calculateBaselineBudget(eventType, attendeeCount, options);
  
  // Distribute budget across categories
  const categoryAllocations = distributeBudgetToCategories(totalBudget, options);
  
  // Create budget items from requirements
  let budgetItems = createBudgetItemsFromRequirements(requirements);
  
  // Apply costs to budget items
  budgetItems = applyCostsToBudgetItems(budgetItems, categoryAllocations);
  
  // Add any additional custom items
  if (options?.additionalItems) {
    budgetItems = [...budgetItems, ...options.additionalItems];
  }
  
  // Group items by category
  const categories: Record<RequirementCategory | 'other', {
    allocation: number;
    percentage: number;
    items: BudgetItem[];
  }> = {} as any;
  
  for (const category of Object.values(RequirementCategory)) {
    const categoryItems = budgetItems.filter(item => item.category === category);
    const totalCategoryAmount = categoryItems.reduce((sum, item) => sum + item.estimatedCost, 0);
    
    categories[category] = {
      allocation: totalCategoryAmount,
      percentage: totalBudget > 0 ? (totalCategoryAmount / totalBudget) * 100 : 0,
      items: categoryItems
    };
  }
  
  // Calculate additional costs
  const serviceFees = options?.includeServiceFee ? 
    totalBudget * COST_CONSTANTS.SERVICE_FEE_PERCENTAGE : 0;
  
  const taxes = options?.includeTax ? 
    totalBudget * COST_CONSTANTS.TAX_PERCENTAGE : 0;
  
  const contingency = options?.includeContingency ? 
    totalBudget * COST_CONSTANTS.CONTINGENCY_PERCENTAGE : 0;
  
  // Calculate grand total
  const grandTotal = totalBudget + serviceFees + taxes + contingency;
  
  return {
    totalBudget,
    categories,
    serviceFees,
    taxes,
    contingency,
    grandTotal
  };
}

/**
 * Calculate estimated budget specific to an event type
 */
export function estimateBudgetByEventType(
  eventType: EventType,
  attendeeCount: number,
  options?: {
    venueSize?: 'small' | 'medium' | 'large';
    duration?: number; // in hours
    amenities?: string[];
    region?: keyof typeof COST_CONSTANTS.REGION_MULTIPLIERS;
    season?: keyof typeof COST_CONSTANTS.SEASON_MULTIPLIERS;
  }
): {
  baseCost: number;
  perPersonCost: number;
  venueCost: number;
  amenitiesCost: number;
  totalCost: number;
  adjustedTotal: number;
  breakdown: Record<string, number>;
} {
  // Get base per person cost
  const perPersonCost = COST_CONSTANTS.PER_PERSON[eventType] || 100;
  
  // Adjust venue cost based on size
  let venueCost = COST_CONSTANTS.VENUE_BASE[eventType] || 3000;
  if (options?.venueSize === 'small') venueCost *= 0.7;
  if (options?.venueSize === 'large') venueCost *= 1.5;
  
  // Calculate duration adjustment
  const durationFactor = options?.duration ? Math.max(1, options.duration / 4) : 1;
  
  // Calculate amenities cost
  let amenitiesCost = 0;
  if (options?.amenities) {
    options.amenities.forEach(amenity => {
      if (amenity === 'bar') amenitiesCost += COST_CONSTANTS.ADDONS.BAR_SERVICE;
      if (amenity === 'dance_floor') amenitiesCost += COST_CONSTANTS.ADDONS.DANCE_FLOOR;
      if (amenity === 'stage_small') amenitiesCost += COST_CONSTANTS.ADDONS.STAGE_SMALL;
      if (amenity === 'stage_medium') amenitiesCost += COST_CONSTANTS.ADDONS.STAGE_MEDIUM;
      if (amenity === 'stage_large') amenitiesCost += COST_CONSTANTS.ADDONS.STAGE_LARGE;
      if (amenity === 'technical_staff') amenitiesCost += COST_CONSTANTS.ADDONS.TECHNICAL_STAFF;
      if (amenity === 'security') amenitiesCost += COST_CONSTANTS.ADDONS.SECURITY_STAFF;
      if (amenity === 'valet') amenitiesCost += COST_CONSTANTS.ADDONS.VALET_PARKING;
      if (amenity === 'dj') amenitiesCost += COST_CONSTANTS.ADDONS.ENTERTAINMENT.DJ;
      if (amenity === 'band') amenitiesCost += COST_CONSTANTS.ADDONS.ENTERTAINMENT.LIVE_BAND;
      if (amenity === 'photography') amenitiesCost += COST_CONSTANTS.ADDONS.PHOTOGRAPHY;
      if (amenity === 'videography') amenitiesCost += COST_CONSTANTS.ADDONS.VIDEOGRAPHY;
    });
  }
  
  // Calculate total base cost
  const baseCost = (perPersonCost * attendeeCount) + venueCost + amenitiesCost;
  
  // Apply multipliers
  const regionMultiplier = options?.region ? 
    COST_CONSTANTS.REGION_MULTIPLIERS[options.region] : 1;
  
  const seasonMultiplier = options?.season ? 
    COST_CONSTANTS.SEASON_MULTIPLIERS[options.season] : 1;
  
  // Apply duration factor
  const durationAdjustedCost = baseCost * durationFactor;
  
  // Calculate adjusted total
  const adjustedTotal = durationAdjustedCost * regionMultiplier * seasonMultiplier;
  
  // Create breakdown
  const breakdown: Record<string, number> = {
    'Venue Rental': venueCost,
    'Catering & Beverages': perPersonCost * attendeeCount * 0.4,
    'Staff': perPersonCost * attendeeCount * 0.15,
    'Decor & Furnishings': perPersonCost * attendeeCount * 0.15,
    'Entertainment': amenitiesCost * 0.4,
    'Technical Equipment': perPersonCost * attendeeCount * 0.1 + amenitiesCost * 0.3,
    'Additional Amenities': perPersonCost * attendeeCount * 0.1 + amenitiesCost * 0.3,
    'Miscellaneous': perPersonCost * attendeeCount * 0.1,
  };
  
  return {
    baseCost,
    perPersonCost,
    venueCost,
    amenitiesCost,
    totalCost: durationAdjustedCost,
    adjustedTotal,
    breakdown
  };
}

/**
 * Generate recommended budget based on requirements
 */
export function generateRecommendedBudget(
  eventRequirements: EventRequirements,
  options?: BudgetOptions
): BudgetBreakdown {
  return generateBudgetBreakdown(
    eventRequirements.eventType,
    eventRequirements.attendeeCount,
    eventRequirements.requirements,
    options
  );
}

/**
 * Compare budget against industry averages
 */
export function compareBudgetToIndustryAverage(
  eventType: EventType,
  attendeeCount: number,
  budget: number
): {
  industryAverage: number;
  difference: number;
  percentageDifference: number;
  isAboveAverage: boolean;
} {
  const averageCost = COST_CONSTANTS.PER_PERSON[eventType] * attendeeCount +
    COST_CONSTANTS.VENUE_BASE[eventType];
  
  const difference = budget - averageCost;
  const percentageDifference = (difference / averageCost) * 100;
  
  return {
    industryAverage: averageCost,
    difference,
    percentageDifference,
    isAboveAverage: difference > 0
  };
} 