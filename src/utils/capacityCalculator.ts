import { Asset } from '../types/canvas';

/**
 * Capacity calculation constants and standards
 */
export const SPACE_REQUIREMENTS = {
  // Space per person in square meters
  STANDING: 0.6, // Standing-only event
  THEATER: 0.8, // Theater/auditorium style seating
  CLASSROOM: 1.1, // Classroom style with tables
  BANQUET: 1.5, // Banquet style (round tables)
  RECEPTION: 1.0, // Reception with some seating and standing
  TRADE_SHOW: 1.9, // Trade show with booths
  CONFERENCE: 1.3, // Conference style (u-shape or boardroom)
  CABARET: 1.3, // Cabaret style with small performance area
  
  // Additional space needs per item in square meters
  BUFFET_TABLE: 3.0, // Space for a standard buffet table
  BAR: 5.0, // Space for a bar setup
  STAGE_SMALL: 6.0, // Small stage/podium
  STAGE_MEDIUM: 12.0, // Medium stage
  STAGE_LARGE: 24.0, // Large stage
  DANCE_FLOOR_SMALL: 10.0, // Small dance floor
  DANCE_FLOOR_MEDIUM: 20.0, // Medium dance floor
  DANCE_FLOOR_LARGE: 40.0, // Large dance floor
  
  // Aisles and circulation (percentage of total space)
  CIRCULATION_PERCENTAGE: 0.15, // 15% of space for movement
  
  // Safety factors
  SAFETY_MARGIN: 0.10, // 10% safety margin
};

/**
 * Capacity calculation modes
 */
export enum CapacityMode {
  STANDING = 'STANDING',
  THEATER = 'THEATER',
  CLASSROOM = 'CLASSROOM',
  BANQUET = 'BANQUET',
  RECEPTION = 'RECEPTION',
  TRADE_SHOW = 'TRADE_SHOW',
  CONFERENCE = 'CONFERENCE',
  CABARET = 'CABARET',
}

/**
 * Interface for venue dimensions
 */
export interface VenueDimensions {
  width: number;
  height: number;
  unit: 'meters' | 'feet';
}

/**
 * Interface for additional space requirements
 */
export interface AdditionalSpaceRequirements {
  buffetTables?: number;
  bars?: number;
  stage?: 'none' | 'small' | 'medium' | 'large';
  danceFloor?: 'none' | 'small' | 'medium' | 'large';
  customSpaceReduction?: number; // Additional space reduction in square meters
}

/**
 * Calculate total square meters from dimensions
 */
export function calculateArea(dimensions: VenueDimensions): number {
  const { width, height, unit } = dimensions;
  
  // Convert feet to meters if necessary
  const conversionFactor = unit === 'feet' ? 0.3048 : 1;
  const widthInMeters = width * conversionFactor;
  const heightInMeters = height * conversionFactor;
  
  return widthInMeters * heightInMeters;
}

/**
 * Calculate usable area after accounting for fixed assets
 */
export function calculateUsableArea(
  totalArea: number,
  fixedAssets: Asset[]
): number {
  let occupiedArea = 0;
  
  // Calculate space occupied by fixed assets
  fixedAssets.forEach(asset => {
    // Simple calculation based on asset width and height
    // A more sophisticated version could use asset type and rotation
    if (asset.width && asset.height && !asset.isMovable) {
      occupiedArea += (asset.width * asset.height) / 10000; // Convert from cm² to m²
    }
  });
  
  // Subtract occupied area from total
  return Math.max(0, totalArea - occupiedArea);
}

/**
 * Calculate additional space requirements
 */
export function calculateAdditionalSpaceNeeds(requirements: AdditionalSpaceRequirements): number {
  let additionalSpace = 0;
  
  // Add space for buffet tables
  if (requirements.buffetTables) {
    additionalSpace += requirements.buffetTables * SPACE_REQUIREMENTS.BUFFET_TABLE;
  }
  
  // Add space for bars
  if (requirements.bars) {
    additionalSpace += requirements.bars * SPACE_REQUIREMENTS.BAR;
  }
  
  // Add space for stage
  if (requirements.stage) {
    switch (requirements.stage) {
      case 'small':
        additionalSpace += SPACE_REQUIREMENTS.STAGE_SMALL;
        break;
      case 'medium':
        additionalSpace += SPACE_REQUIREMENTS.STAGE_MEDIUM;
        break;
      case 'large':
        additionalSpace += SPACE_REQUIREMENTS.STAGE_LARGE;
        break;
    }
  }
  
  // Add space for dance floor
  if (requirements.danceFloor) {
    switch (requirements.danceFloor) {
      case 'small':
        additionalSpace += SPACE_REQUIREMENTS.DANCE_FLOOR_SMALL;
        break;
      case 'medium':
        additionalSpace += SPACE_REQUIREMENTS.DANCE_FLOOR_MEDIUM;
        break;
      case 'large':
        additionalSpace += SPACE_REQUIREMENTS.DANCE_FLOOR_LARGE;
        break;
    }
  }
  
  // Add custom space reduction
  if (requirements.customSpaceReduction) {
    additionalSpace += requirements.customSpaceReduction;
  }
  
  return additionalSpace;
}

/**
 * Calculate maximum capacity for a venue based on layout type
 */
export function calculateMaxCapacity(
  dimensions: VenueDimensions,
  mode: CapacityMode,
  fixedAssets: Asset[] = [],
  additionalRequirements: AdditionalSpaceRequirements = {}
): {
  maxCapacity: number;
  usableArea: number;
  requiredSpacePerPerson: number;
  spaceForCirculation: number;
  spaceForFixedElements: number;
  capacityWithSafetyMargin: number;
} {
  // Calculate total area
  const totalArea = calculateArea(dimensions);
  
  // Calculate usable area after accounting for fixed assets
  const baseUsableArea = calculateUsableArea(totalArea, fixedAssets);
  
  // Calculate additional space needs
  const additionalSpace = calculateAdditionalSpaceNeeds(additionalRequirements);
  
  // Calculate space needed for circulation
  const circulationSpace = totalArea * SPACE_REQUIREMENTS.CIRCULATION_PERCENTAGE;
  
  // Calculate final usable area
  const finalUsableArea = Math.max(0, baseUsableArea - additionalSpace - circulationSpace);
  
  // Get required space per person based on layout mode
  const spacePerPerson = SPACE_REQUIREMENTS[mode];
  
  // Calculate raw maximum capacity
  const rawMaxCapacity = Math.floor(finalUsableArea / spacePerPerson);
  
  // Apply safety margin
  const capacityWithSafetyMargin = Math.floor(rawMaxCapacity * (1 - SPACE_REQUIREMENTS.SAFETY_MARGIN));
  
  return {
    maxCapacity: rawMaxCapacity,
    usableArea: finalUsableArea,
    requiredSpacePerPerson: spacePerPerson,
    spaceForCirculation: circulationSpace,
    spaceForFixedElements: additionalSpace,
    capacityWithSafetyMargin,
  };
}

/**
 * Calculate capacities for all layout types
 */
export function calculateAllCapacities(
  dimensions: VenueDimensions,
  fixedAssets: Asset[] = [],
  additionalRequirements: AdditionalSpaceRequirements = {}
): Record<CapacityMode, { maxCapacity: number; capacityWithSafetyMargin: number }> {
  const results: Record<CapacityMode, { maxCapacity: number; capacityWithSafetyMargin: number }> = {} as any;
  
  // Calculate for each layout type
  for (const mode of Object.values(CapacityMode)) {
    const result = calculateMaxCapacity(dimensions, mode, fixedAssets, additionalRequirements);
    results[mode] = {
      maxCapacity: result.maxCapacity,
      capacityWithSafetyMargin: result.capacityWithSafetyMargin,
    };
  }
  
  return results;
}

/**
 * Calculate flow and capacity for different event zones
 * This is useful for multi-zone events where people will move between areas
 */
export function calculateZoneCapacities(
  zones: Array<{
    name: string;
    dimensions: VenueDimensions;
    mode: CapacityMode;
    occupancyFactor: number; // Expected percentage of total guests (0-1)
    fixedAssets?: Asset[];
    additionalRequirements?: AdditionalSpaceRequirements;
  }>
): {
  zoneCapacities: Record<string, { 
    raw: number;
    withSafety: number;
    recommended: number;
    bottleneck: boolean;
  }>;
  totalRecommendedCapacity: number;
  totalMaxCapacity: number;
  bottleneckZone: string | null;
} {
  const zoneCapacities: Record<string, {
    raw: number;
    withSafety: number;
    recommended: number;
    bottleneck: boolean;
  }> = {};
  
  // Calculate capacity for each zone
  zones.forEach(zone => {
    const result = calculateMaxCapacity(
      zone.dimensions,
      zone.mode,
      zone.fixedAssets || [],
      zone.additionalRequirements || {}
    );
    
    // Calculate recommended capacity based on occupancy factor
    const recommendedCapacity = Math.floor(result.capacityWithSafetyMargin / zone.occupancyFactor);
    
    zoneCapacities[zone.name] = {
      raw: result.maxCapacity,
      withSafety: result.capacityWithSafetyMargin,
      recommended: recommendedCapacity,
      bottleneck: false,
    };
  });
  
  // Find the zone with the lowest recommended capacity
  // This is the bottleneck for the overall event
  let bottleneckZone: string | null = null;
  let minCapacity = Number.MAX_SAFE_INTEGER;
  
  Object.entries(zoneCapacities).forEach(([zoneName, capacity]) => {
    if (capacity.recommended < minCapacity) {
      minCapacity = capacity.recommended;
      bottleneckZone = zoneName;
    }
  });
  
  // Mark the bottleneck zone
  if (bottleneckZone) {
    zoneCapacities[bottleneckZone].bottleneck = true;
  }
  
  // Calculate the total recommended capacity
  // This is limited by the bottleneck zone
  const totalRecommendedCapacity = bottleneckZone ? zoneCapacities[bottleneckZone].recommended : 0;
  
  // Calculate the total maximum capacity without considering zone flow
  const totalMaxCapacity = Object.values(zoneCapacities).reduce(
    (sum, capacity) => sum + capacity.withSafety,
    0
  );
  
  return {
    zoneCapacities,
    totalRecommendedCapacity,
    totalMaxCapacity,
    bottleneckZone,
  };
}

/**
 * Estimate optimal capacity based on event type 
 */
export function recommendCapacityForEvent(
  eventType: 'wedding' | 'conference' | 'concert' | 'exhibition' | 'banquet' | 'meeting',
  venueDimensions: VenueDimensions,
  fixedAssets: Asset[] = []
): {
  recommendedCapacity: number;
  suggestedLayout: CapacityMode;
  additionalRecommendations: string[];
} {
  let suggestedLayout: CapacityMode;
  let additionalRequirements: AdditionalSpaceRequirements = {};
  const additionalRecommendations: string[] = [];
  
  // Determine suggested layout and additional requirements based on event type
  switch (eventType) {
    case 'wedding':
      suggestedLayout = CapacityMode.BANQUET;
      additionalRequirements = {
        buffetTables: 2,
        bars: 1,
        danceFloor: 'medium',
        stage: 'small',
      };
      additionalRecommendations.push('Allocate space for gift table and guest book');
      additionalRecommendations.push('Consider separate area for cocktail hour');
      break;
      
    case 'conference':
      suggestedLayout = CapacityMode.THEATER;
      additionalRequirements = {
        stage: 'medium',
        buffetTables: 2,
      };
      additionalRecommendations.push('Add registration area near entrance');
      additionalRecommendations.push('Consider breakout rooms for sessions');
      break;
      
    case 'concert':
      suggestedLayout = CapacityMode.STANDING;
      additionalRequirements = {
        stage: 'large',
        bars: 2,
      };
      additionalRecommendations.push('Ensure adequate space for sound equipment');
      additionalRecommendations.push('Include barriers for crowd control');
      break;
      
    case 'exhibition':
      suggestedLayout = CapacityMode.TRADE_SHOW;
      additionalRecommendations.push('Ensure wide aisles for booth access');
      additionalRecommendations.push('Allocate space for exhibitor check-in');
      break;
      
    case 'banquet':
      suggestedLayout = CapacityMode.BANQUET;
      additionalRequirements = {
        stage: 'small',
        buffetTables: 3,
        bars: 1,
      };
      additionalRecommendations.push('Allow space for service staff circulation');
      break;
      
    case 'meeting':
      suggestedLayout = CapacityMode.CONFERENCE;
      additionalRecommendations.push('Include space for projector and screen');
      additionalRecommendations.push('Consider refreshment area');
      break;
      
    default:
      suggestedLayout = CapacityMode.RECEPTION;
      additionalRecommendations.push('Customize layout based on specific event needs');
  }
  
  // Calculate capacity using the suggested layout
  const result = calculateMaxCapacity(venueDimensions, suggestedLayout, fixedAssets, additionalRequirements);
  
  return {
    recommendedCapacity: result.capacityWithSafetyMargin,
    suggestedLayout,
    additionalRecommendations,
  };
}

/**
 * Calculate social distancing adjusted capacity 
 * Useful for special health requirements
 */
export function calculateSocialDistancingCapacity(
  dimensions: VenueDimensions,
  mode: CapacityMode,
  distancingRequirement: number = 2, // Default 2 meters
  fixedAssets: Asset[] = [],
  additionalRequirements: AdditionalSpaceRequirements = {}
): {
  standardCapacity: number;
  distancedCapacity: number;
  reductionPercentage: number;
} {
  // Calculate standard capacity
  const standardResult = calculateMaxCapacity(
    dimensions,
    mode,
    fixedAssets,
    additionalRequirements
  );
  
  // Adjust space requirements for social distancing
  const distancingFactor = Math.pow(distancingRequirement / 1.0, 2);
  
  // Calculate capacity with distancing
  const distancedResult = calculateMaxCapacity(
    dimensions,
    mode,
    fixedAssets,
    {
      ...additionalRequirements,
      // Additional reduction based on the increased space needed per person
      customSpaceReduction: (additionalRequirements.customSpaceReduction || 0) + 
        (standardResult.usableArea * (1 - (1 / distancingFactor)))
    }
  );
  
  // Calculate percentage reduction
  const reductionPercentage = standardResult.capacityWithSafetyMargin > 0
    ? 100 * (1 - (distancedResult.capacityWithSafetyMargin / standardResult.capacityWithSafetyMargin))
    : 0;
  
  return {
    standardCapacity: standardResult.capacityWithSafetyMargin,
    distancedCapacity: distancedResult.capacityWithSafetyMargin,
    reductionPercentage,
  };
} 