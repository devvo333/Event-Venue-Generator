# Measurement Tool Documentation

## Overview
The Measurement Tool is a key component of the floor plan matching functionality in the Event Venue Generator. It allows users to measure real-world distances between any two points on an imported floor plan, helping ensure accurate placement of assets based on actual venue dimensions.

## Features
- **Interactive Point-to-Point Measurement:** Click to place start and end points to measure distances
- **Real-World Units:** All measurements are displayed in real-world units (meters or feet)
- **Multiple Measurements:** Save multiple measurements to compare different distances
- **Visual Feedback:** Clear visual indicators for measurement lines, start points, and end points
- **Measurement History:** Track and review all measurements taken during a session
- **Unit Awareness:** Automatically adapts to the floor plan's defined unit system
- **Scale Adaptation:** Measurements adjust based on the floor plan's scale setting

## How to Use

### Accessing the Tool
1. Import a floor plan with real-world dimensions using the Floor Plan feature
2. Click the Measurement Tool button in the toolbar (displayed as a ruler icon)
3. A modal will appear with the measurement interface

### Taking Measurements
1. Click once on the canvas to place the start point (blue dot)
2. Move your cursor to the desired end point
3. Click again to complete the measurement (red dot)
4. The distance will be displayed above the measurement line
5. Measurements are saved in the history panel at the bottom of the tool

### Managing Measurements
- Click "Clear All" to reset and remove all measurements
- View a list of all measurements in the bottom panel
- Close the tool by clicking the X in the top-right corner

## Technical Implementation
The Measurement Tool uses React and Konva.js to create an interactive canvas for measurements. Key components include:

- **Coordinate Conversion:** Translates pixel positions to real-world distances
- **Canvas Layer Management:** Renders measurement lines, points, and text labels
- **State Management:** Tracks measurement history and drawing state
- **Visual Styling:** Provides clear visual feedback with contrasting colors

## Integration
The Measurement Tool is tightly integrated with other floor plan features:
- Works with the real-world rulers to provide consistent measurements
- Complements the grid snap functionality for precise positioning
- Uses the same unit system defined in the floor plan settings

## Future Enhancements
Planned improvements for future releases:
- Area measurement tools for measuring square footage
- Angle measurement for non-linear measurements
- Calibration tools for adjusting measurements on existing floor plans
- Export measurement data to PDF or CSV formats 