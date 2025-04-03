import React, { useState, useEffect } from 'react';
import { 
  EventType, 
  RequirementCategory,
  Requirement,
  EventRequirements
} from '../../utils/requirementsChecker';
import {
  BudgetOptions,
  BudgetBreakdown,
  BudgetItem,
  COST_CONSTANTS,
  generateBudgetBreakdown,
  estimateBudgetByEventType,
  compareBudgetToIndustryAverage
} from '../../utils/budgetEstimator';

interface BudgetEstimatorProps {
  eventType: EventType;
  attendeeCount: number;
  requirements?: Requirement[];
  savedBudget?: BudgetBreakdown;
  onSave?: (budgetBreakdown: BudgetBreakdown) => void;
  className?: string;
}

const BudgetEstimator: React.FC<BudgetEstimatorProps> = ({
  eventType,
  attendeeCount,
  requirements = [],
  savedBudget,
  onSave,
  className = '',
}) => {
  // Budget options state
  const [options, setOptions] = useState<BudgetOptions>({
    includeServiceFee: true,
    includeTax: true,
    includeContingency: true,
    region: 'WEST_COAST',
    season: 'PEAK',
  });
  
  // Budget breakdown state
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetBreakdown | null>(savedBudget || null);
  
  // Venue options
  const [venueSize, setVenueSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [duration, setDuration] = useState(4); // in hours
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Budget comparison
  const [comparison, setComparison] = useState<{
    industryAverage: number;
    difference: number;
    percentageDifference: number;
    isAboveAverage: boolean;
  } | null>(null);
  
  // Generate budget when inputs change
  useEffect(() => {
    if (requirements.length > 0) {
      // Generate detailed budget breakdown from requirements
      const breakdown = generateBudgetBreakdown(
        eventType,
        attendeeCount,
        requirements,
        options
      );
      
      // Update budget breakdown
      setBudgetBreakdown(breakdown);
      
      // Calculate comparison to industry average
      const comp = compareBudgetToIndustryAverage(
        eventType,
        attendeeCount,
        breakdown.grandTotal
      );
      
      setComparison(comp);
    } else {
      // Generate simple estimate based on event type and attendees
      const estimate = estimateBudgetByEventType(
        eventType,
        attendeeCount,
        {
          venueSize,
          duration,
          amenities: selectedAmenities,
          region: options.region,
          season: options.season
        }
      );
      
      // Create simple budget breakdown
      const totalBudget = estimate.adjustedTotal;
      const categories: Record<RequirementCategory | 'other', {
        allocation: number;
        percentage: number;
        items: BudgetItem[];
      }> = {} as any;
      
      // Create categories with estimated breakdown
      Object.entries(estimate.breakdown).forEach(([category, amount]) => {
        const mockCategoryKey = category.toLowerCase().includes('catering') 
          ? RequirementCategory.CATERING 
          : category.toLowerCase().includes('staff')
          ? RequirementCategory.STAFFING
          : category.toLowerCase().includes('decor')
          ? RequirementCategory.DECOR
          : category.toLowerCase().includes('technical')
          ? RequirementCategory.AUDIOVISUAL
          : category.toLowerCase().includes('venue')
          ? RequirementCategory.SEATING
          : 'other';
            
        categories[mockCategoryKey] = {
          allocation: amount,
          percentage: (amount / totalBudget) * 100,
          items: [{
            id: `auto_${category.replace(/\s+/g, '_').toLowerCase()}`,
            category: mockCategoryKey as RequirementCategory,
            title: category,
            description: `Estimated cost for ${category.toLowerCase()}`,
            estimatedCost: amount,
            isRequired: true
          }]
        };
      });
      
      // Calculate additional costs
      const serviceFees = options.includeServiceFee 
        ? totalBudget * COST_CONSTANTS.SERVICE_FEE_PERCENTAGE 
        : 0;
      
      const taxes = options.includeTax 
        ? totalBudget * COST_CONSTANTS.TAX_PERCENTAGE 
        : 0;
      
      const contingency = options.includeContingency 
        ? totalBudget * COST_CONSTANTS.CONTINGENCY_PERCENTAGE 
        : 0;
      
      // Calculate grand total
      const grandTotal = totalBudget + serviceFees + taxes + contingency;
      
      // Set budget breakdown
      setBudgetBreakdown({
        totalBudget,
        categories,
        serviceFees,
        taxes,
        contingency,
        grandTotal
      });
      
      // Calculate comparison to industry average
      const comp = compareBudgetToIndustryAverage(
        eventType,
        attendeeCount,
        grandTotal
      );
      
      setComparison(comp);
    }
  }, [eventType, attendeeCount, requirements, options, venueSize, duration, selectedAmenities]);
  
  // Handle option changes
  const handleOptionChange = (option: keyof BudgetOptions, value: any) => {
    setOptions({
      ...options,
      [option]: value
    });
  };
  
  // Handle amenities toggle
  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };
  
  // Handle save action
  const handleSave = () => {
    if (budgetBreakdown && onSave) {
      onSave(budgetBreakdown);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Get color class based on budget comparison
  const getComparisonColorClass = (): string => {
    if (!comparison) return '';
    
    if (comparison.percentageDifference > 15) {
      return 'text-red-600';
    } else if (comparison.percentageDifference < -15) {
      return 'text-green-600';
    } else {
      return 'text-blue-600';
    }
  };
  
  // Format category name for display
  const formatCategoryName = (category: RequirementCategory | 'other'): string => {
    if (category === 'other') return 'Other';
    
    return category
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="bg-blue-600 px-4 py-3">
        <h2 className="text-lg font-medium text-white">Event Budget Estimator</h2>
      </div>
      
      <div className="p-4">
        {/* Event details summary */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Event Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="block text-gray-500">Event Type</span>
              <span className="font-medium">
                {eventType.replace('_', ' ').charAt(0).toUpperCase() + eventType.replace('_', ' ').slice(1).toLowerCase()}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="block text-gray-500">Attendees</span>
              <span className="font-medium">{attendeeCount} people</span>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="block text-gray-500">Region</span>
              <select
                value={options.region as string}
                onChange={(e) => handleOptionChange('region', e.target.value)}
                className="block w-full mt-1 text-sm border-none bg-transparent p-0 font-medium"
              >
                {Object.keys(COST_CONSTANTS.REGION_MULTIPLIERS).map((region) => (
                  <option key={region} value={region}>
                    {region.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="block text-gray-500">Season</span>
              <select
                value={options.season as string}
                onChange={(e) => handleOptionChange('season', e.target.value)}
                className="block w-full mt-1 text-sm border-none bg-transparent p-0 font-medium"
              >
                {Object.keys(COST_CONSTANTS.SEASON_MULTIPLIERS).map((season) => (
                  <option key={season} value={season}>
                    {season.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Budget options */}
        {requirements.length === 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Event Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Venue Size</label>
                <select 
                  value={venueSize}
                  onChange={(e) => setVenueSize(e.target.value as 'small' | 'medium' | 'large')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="small">Small Venue</option>
                  <option value="medium">Medium Venue</option>
                  <option value="large">Large Venue</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Event Duration (hours)</label>
                <input 
                  type="number" 
                  min="1"
                  max="24"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 4)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-2">Included Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'bar', label: 'Bar Service' },
                  { id: 'dance_floor', label: 'Dance Floor' },
                  { id: 'stage_small', label: 'Small Stage' },
                  { id: 'stage_medium', label: 'Medium Stage' },
                  { id: 'stage_large', label: 'Large Stage' },
                  { id: 'technical_staff', label: 'Technical Staff' },
                  { id: 'security', label: 'Security Staff' },
                  { id: 'valet', label: 'Valet Parking' },
                  { id: 'dj', label: 'DJ Services' },
                  { id: 'band', label: 'Live Band' },
                  { id: 'photography', label: 'Photography' },
                  { id: 'videography', label: 'Videography' }
                ].map((amenity) => (
                  <div key={amenity.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`amenity-${amenity.id}`}
                      checked={selectedAmenities.includes(amenity.id)}
                      onChange={() => toggleAmenity(amenity.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`amenity-${amenity.id}`} className="ml-2 block text-sm text-gray-700">
                      {amenity.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Cost adjustments */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Cost Adjustments</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="service-fee"
                  type="checkbox"
                  checked={options.includeServiceFee}
                  onChange={(e) => handleOptionChange('includeServiceFee', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="service-fee" className="ml-2 block text-sm text-gray-700">
                  Include Service Fee ({Math.round(COST_CONSTANTS.SERVICE_FEE_PERCENTAGE * 100)}%)
                </label>
              </div>
              {budgetBreakdown && options.includeServiceFee && (
                <span className="text-sm text-gray-700">
                  {formatCurrency(budgetBreakdown.serviceFees)}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="taxes"
                  type="checkbox"
                  checked={options.includeTax}
                  onChange={(e) => handleOptionChange('includeTax', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="taxes" className="ml-2 block text-sm text-gray-700">
                  Include Taxes ({Math.round(COST_CONSTANTS.TAX_PERCENTAGE * 100)}%)
                </label>
              </div>
              {budgetBreakdown && options.includeTax && (
                <span className="text-sm text-gray-700">
                  {formatCurrency(budgetBreakdown.taxes)}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="contingency"
                  type="checkbox"
                  checked={options.includeContingency}
                  onChange={(e) => handleOptionChange('includeContingency', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="contingency" className="ml-2 block text-sm text-gray-700">
                  Include Contingency ({Math.round(COST_CONSTANTS.CONTINGENCY_PERCENTAGE * 100)}%)
                </label>
              </div>
              {budgetBreakdown && options.includeContingency && (
                <span className="text-sm text-gray-700">
                  {formatCurrency(budgetBreakdown.contingency)}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Budget breakdown */}
        {budgetBreakdown && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-600">Budget Breakdown</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(budgetBreakdown.grandTotal)}
                </div>
                <div className="text-xs text-gray-500">
                  Estimated Total Budget
                </div>
                
                {comparison && (
                  <div className={`text-xs mt-1 ${getComparisonColorClass()}`}>
                    {comparison.isAboveAverage 
                      ? `${comparison.percentageDifference.toFixed(0)}% above average` 
                      : `${Math.abs(comparison.percentageDifference).toFixed(0)}% below average`}
                  </div>
                )}
              </div>
            </div>
            
            {/* Category breakdown */}
            <div className="space-y-4">
              {Object.entries(budgetBreakdown.categories).map(([category, data]) => {
                if (data.items.length === 0) return null;
                
                return (
                  <div key={category} className="bg-gray-50 rounded-md p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-gray-700">
                        {formatCategoryName(category as RequirementCategory | 'other')}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(data.allocation)}</div>
                        <div className="text-xs text-gray-500">{data.percentage.toFixed(1)}% of budget</div>
                      </div>
                    </div>
                    
                    {/* Items in category */}
                    <div className="space-y-2 mt-3">
                      {data.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div className="text-gray-600">{item.title}</div>
                          <div>{formatCurrency(item.estimatedCost)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Budget totals */}
            <div className="mt-4 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(budgetBreakdown.totalBudget)}</span>
              </div>
              
              {options.includeServiceFee && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Service Fee ({Math.round(COST_CONSTANTS.SERVICE_FEE_PERCENTAGE * 100)}%)</span>
                  <span>{formatCurrency(budgetBreakdown.serviceFees)}</span>
                </div>
              )}
              
              {options.includeTax && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Taxes ({Math.round(COST_CONSTANTS.TAX_PERCENTAGE * 100)}%)</span>
                  <span>{formatCurrency(budgetBreakdown.taxes)}</span>
                </div>
              )}
              
              {options.includeContingency && (
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Contingency ({Math.round(COST_CONSTANTS.CONTINGENCY_PERCENTAGE * 100)}%)</span>
                  <span>{formatCurrency(budgetBreakdown.contingency)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-200 mt-2">
                <span>Grand Total</span>
                <span>{formatCurrency(budgetBreakdown.grandTotal)}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Industry averages */}
        {comparison && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Industry Comparison</h3>
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-600">Industry average for this event:</span>
                <span className="font-medium">{formatCurrency(comparison.industryAverage)}</span>
              </div>
              
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-600">Your estimated budget:</span>
                <span className="font-medium">{formatCurrency(budgetBreakdown?.grandTotal || 0)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Difference:</span>
                <span className={`font-medium ${getComparisonColorClass()}`}>
                  {formatCurrency(comparison.difference)} 
                  ({comparison.isAboveAverage ? '+' : ''}{comparison.percentageDifference.toFixed(1)}%)
                </span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  {comparison.isAboveAverage && comparison.percentageDifference > 20 ? (
                    <p>Your budget is significantly higher than industry average. Consider reviewing high-cost categories for potential savings.</p>
                  ) : comparison.isAboveAverage ? (
                    <p>Your budget is in line with or slightly above industry average, which suggests adequate planning for your event needs.</p>
                  ) : comparison.percentageDifference < -20 ? (
                    <p>Your budget is considerably lower than industry average. Consider if all necessary items are included to ensure event quality.</p>
                  ) : (
                    <p>Your budget is in line with or slightly below industry average, which suggests efficient planning while meeting event needs.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Actions */}
      {onSave && (
        <div className="bg-gray-50 px-4 py-3 text-right">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Budget
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetEstimator; 