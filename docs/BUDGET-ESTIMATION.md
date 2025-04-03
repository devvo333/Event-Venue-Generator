# Budget Estimation System

The Budget Estimation system is a comprehensive tool designed to help event planners, venue managers, and clients accurately forecast and manage costs associated with events of various types and scales.

## Overview

The Budget Estimation tool provides:

- Event-specific budget calculations based on event type and attendee count
- Detailed breakdowns of costs by category (catering, decor, staffing, etc.)
- Automatic cost estimation from requirements checklists
- Regional and seasonal adjustments for accurate local pricing
- Industry benchmarking for budget comparison
- Customizable parameters for tailoring estimates to specific needs
- Integration with the requirements management system

## Features

### 1. Baseline Budget Calculation

The system generates a baseline budget by considering:

- **Event Type**: Different events have distinct cost structures (weddings, conferences, trade shows, etc.)
- **Attendee Count**: Per-person costs are calculated based on typical spending patterns
- **Base Venue Costs**: Starting prices for venue rental by event type
- **Regional Variations**: Adjustments for geographic cost differences
- **Seasonal Factors**: Peak/off-peak pricing adjustments

### 2. Detailed Category Breakdown

Budget estimates are organized into functional categories:

- **Seating**: Chairs, tables, lounge furniture, stage seating
- **Catering**: Food, beverages, serving staff, bar service
- **Audiovisual**: Sound systems, projectors, screens, microphones
- **Lighting**: Ambient lighting, stage lighting, decorative lighting
- **Decor**: Centerpieces, backdrops, signage, thematic elements
- **Accessibility**: Accessibility accommodations and services
- **Staffing**: Event coordinators, security, check-in staff
- **Logistics**: Transportation, storage, setup/breakdown
- **Safety**: Emergency services, first aid, safety equipment

### 3. Requirements Integration

When using the Event Requirements Checklist:

- Each requirement is automatically assigned an estimated cost
- Critical and high-priority requirements are marked as required items
- Costs are distributed within categories based on typical allocations
- Custom costs can be manually assigned to specific requirements
- Total budget reflects all requirements and their associated costs

### 4. Budget Customization

Users can customize their budget through:

- **Venue Size Selection**: Small, medium, or large venue options
- **Event Duration**: Adjustments for event length
- **Amenities Selection**: Addition of specific services and features
- **Regional Settings**: Selection of geographic location for pricing
- **Seasonal Timing**: Adjustment for time of year cost variations
- **Fee Inclusion/Exclusion**: Options for service fees, taxes, contingency

### 5. Industry Comparison

The system provides comparisons with industry standards:

- Automatic comparison of estimated budget with industry averages
- Percentage difference calculation and visual indicators
- Contextual explanations of budget positioning
- Recommendations based on budget comparison

### 6. Visual Presentation

Budget information is presented through:

- Category-based breakdown charts
- Item-level detail views
- Percentage allocations for each category
- Color-coded comparison indicators
- Clean, printable summary formats

## Technical Implementation

### Core Components

1. **Budget Estimator Utility**
   - Located at: `src/utils/budgetEstimator.ts`
   - Contains cost constants, calculation functions, and interfaces
   - Implements core budget estimation algorithms

2. **BudgetEstimator Component**
   - Located at: `src/components/events/BudgetEstimator.tsx`
   - Renders the interactive budget UI
   - Handles state management for budget options
   - Provides real-time budget updates based on user inputs

3. **Budget Estimation Page**
   - Located at: `src/pages/budget-estimation.tsx`
   - Offers event configuration options
   - Integrates with requirements system
   - Provides contextual information about budgeting

### Data Structure

The budget system uses these key data structures:

```typescript
// Budget item representing a specific cost element
interface BudgetItem {
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

// Complete budget breakdown with categorized costs and totals
interface BudgetBreakdown {
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

// Configuration options for budget calculations
interface BudgetOptions {
  region?: keyof typeof COST_CONSTANTS.REGION_MULTIPLIERS;
  season?: keyof typeof COST_CONSTANTS.SEASON_MULTIPLIERS;
  includeServiceFee?: boolean;
  includeTax?: boolean;
  includeContingency?: boolean;
  customPerPersonCost?: Record<EventType, number>;
  customCategoryAllocation?: Record<RequirementCategory, number>;
  additionalItems?: BudgetItem[];
}
```

## Calculation Methodology

### Per-Person Costs

The system uses these baseline per-person costs by event type:

- **Wedding**: $150 per person
- **Conference**: $120 per person
- **Concert**: $80 per person
- **Exhibition**: $90 per person
- **Banquet**: $130 per person
- **Meeting**: $70 per person
- **Graduation**: $50 per person
- **Trade Show**: $110 per person
- **Gala**: $200 per person
- **Corporate**: $100 per person

### Base Venue Costs

Standard venue rental baseline costs:

- **Wedding**: $3,000
- **Conference**: $5,000
- **Concert**: $8,000
- **Exhibition**: $7,000
- **Banquet**: $4,000
- **Meeting**: $1,500
- **Graduation**: $3,000
- **Trade Show**: $10,000
- **Gala**: $8,000
- **Corporate**: $3,500

### Regional Adjustments

Geographic cost multipliers:

- **Northeast**: 1.3x
- **West Coast**: 1.4x
- **Midwest**: 0.9x
- **South**: 0.85x
- **Southwest**: 0.95x
- **International**: 1.2x

### Seasonal Adjustments

Seasonal pricing variations:

- **Peak**: 1.3x (Summer, holidays)
- **Shoulder**: 1.0x (Spring, fall)
- **Off-Peak**: 0.8x (Winter, non-holiday)

### Additional Costs

Standard percentages for:

- **Service Fee**: 22%
- **Tax**: 8%
- **Contingency**: 15%

## Usage Guide

### Basic Usage

1. Navigate to the Budget Estimation page
2. Select an event type from the dropdown
3. Enter the expected number of attendees
4. Review the automatically generated budget breakdown
5. Adjust regional and seasonal settings as needed
6. Toggle cost adjustments (service fee, tax, contingency)
7. Save the budget for future reference

### Advanced Features

- **Requirements Integration**: Create a requirements checklist first for more accurate budgeting
- **Custom Amenities**: Select specific features to include in the budget
- **Venue Customization**: Adjust venue size and event duration
- **Budget Comparison**: Review how your budget compares to industry standards
- **Budget Saving**: Store and retrieve your budget for continued planning

## Integration Points

The Budget Estimation system integrates with other system components:

- **Event Requirements Checklist**: Generates costs from detailed requirements
- **Venue Capacity Calculator**: Informs venue size and capacity decisions
- **Activity Tracking**: Records budget adjustments and saves

## Budgeting Best Practices

1. **Prioritize Expenses**: Allocate more budget to high-impact items
2. **Include Contingency**: Always add 15-20% for unexpected costs
3. **Consider Seasonality**: Schedule during off-peak times for savings
4. **Compare Vendors**: Get multiple quotes for major expense categories
5. **Track Actuals**: Record actual expenses against estimates
6. **Regional Awareness**: Adjust expectations based on location
7. **Budget in Phases**: Allocate funds to pre-event, event, and post-event phases

## Future Enhancements

Planned improvements for the Budget Estimation system include:

- Vendor quote management
- Historical pricing data integration
- Budget vs. actual expense tracking
- ROI calculator for commercial events
- Multi-event budget planning
- Export to accounting software
- Mobile budget tracking

## Conclusion

The Budget Estimation system provides a structured approach to event financial planning, ensuring that all necessary costs are identified, estimated, and managed. By offering event-specific calculations and comprehensive breakdown tools, it helps event planners create realistic budgets while reducing financial risks. 