# Venue Capacity Calculator

The Venue Capacity Calculator is a powerful tool designed to help event planners, venue managers, and clients accurately determine the capacity of a venue based on various seating layouts, additional requirements, and safety considerations.

## Overview

The calculator takes into account:

- Venue dimensions (width and length)
- Different seating/layout styles
- Additional space requirements (buffet tables, bars, stage, dance floor)
- Safety margins and circulation space
- Social distancing requirements (optional)
- Event type recommendations

## Features

### 1. Multiple Layout Calculations

The calculator supports various standard event layouts:

- Reception/Standing: For cocktail parties and networking events
- Theater Style: Rows of chairs facing a stage or focal point
- Classroom Style: Tables and chairs arranged in rows
- Banquet Style: Round tables with chairs
- Cabaret Style: Round tables with chairs on only one side, facing a stage
- U-Shape: Tables arranged in a U configuration
- Boardroom: A single large table with chairs around it
- Hollow Square: Tables arranged in a square with an empty center

### 2. Real-time Recalculation

As users modify inputs, the calculator instantly recalculates capacity figures, providing:

- Maximum theoretical capacity
- Capacity with safety margin (recommended)
- Required space per person
- Usable area calculations
- Space utilization breakdown

### 3. Event Type Recommendations

Based on the selected event type (wedding, conference, concert, exhibition, banquet, meeting), the calculator provides:

- Suggested optimal layout
- Recommended capacity
- Additional recommendations specific to the event type

### 4. Space Utilization Visualization

The calculator includes a visual representation of how space is utilized:

- Guest area (usable space for attendees)
- Features (space for additional elements like stages, bars)
- Circulation (space for walkways, aisles, emergency exits)

### 5. Social Distancing Support

An optional feature allows calculation of capacity with social distancing requirements:

- Adjustable distancing requirements (1-3 meters)
- Capacity reduction percentage
- Comparison between standard and distanced capacities

## Technical Implementation

### Core Components

1. **Capacity Calculator Utility**
   - Located at: `src/utils/capacityCalculator.ts`
   - Contains mathematical calculations and business logic
   - Implements capacity calculation algorithms based on industry standards

2. **VenueCapacityCalculator Component**
   - Located at: `src/components/venues/VenueCapacityCalculator.tsx`
   - Renders the calculator UI with inputs and results
   - Handles state management and real-time recalculation

3. **Venue Capacity Page**
   - Located at: `src/pages/venue-capacity.tsx`
   - Provides venue dimension selection/input
   - Contextualizes the calculator with additional information

### Calculation Method

The calculator follows these steps:

1. Calculate the total area from dimensions
2. Subtract space for fixed elements and obstructions
3. Subtract circulation space (typically 20-30% of total)
4. Calculate usable area
5. Divide by the space required per person for the selected layout
6. Apply safety margin (typically 10-15%)
7. Calculate additional space for features (bars, stage, etc.)
8. Recalculate final capacity

### Space Requirements (per person)

- **Reception/Standing**: 0.6-0.8 m²
- **Theater Style**: 0.8-1.0 m²
- **Classroom Style**: 1.5-1.8 m²
- **Banquet Style**: 1.5-2.0 m²
- **Cabaret Style**: 2.0-2.5 m²
- **U-Shape**: 2.5-3.0 m²
- **Boardroom**: 2.5-3.0 m²
- **Hollow Square**: 3.0-3.5 m²

## User Guide

### Basic Usage

1. Select a predefined venue size or input custom dimensions
2. Select a layout type from the available options
3. Adjust additional requirements (buffet tables, bars, stage, dance floor)
4. View the calculated capacity and space utilization

### Advanced Features

- **Event Type Recommendations**: Select an event type to receive suggestions
- **Social Distancing Calculations**: Toggle the option and adjust requirements
- **Multiple Layout Comparison**: Compare capacities across different layout types

## Limitations and Considerations

- The calculator provides estimates based on industry standards and best practices
- Local fire codes and safety regulations should always take precedence
- Physical features like columns or irregular room shapes may affect actual capacity
- For official event permitting, consult with local authorities

## Future Enhancements

Planned improvements for the Venue Capacity Calculator include:

- Integration with floor plan editor to calculate from drawn layouts
- Support for irregular venue shapes
- Fire code compliance checking by jurisdiction
- Integration with event requirements checklist
- Accessibility compliance calculations
- 3D visualization of layouts

## Conclusion

The Venue Capacity Calculator is an essential tool for planning successful events. By providing accurate capacity estimates based on layout, requirements, and safety considerations, it helps ensure events are both comfortable for attendees and compliant with venue limitations. 