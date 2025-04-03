import { Tutorial } from './TutorialContext';

// Define the editor tutorials
export const editorTutorials: Tutorial[] = [
  {
    id: 'canvas-editor-intro',
    name: 'Canvas Editor Introduction',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to the Canvas Editor',
        content: 'This tutorial will guide you through the basics of using the Event Venue Generator canvas editor.'
      },
      {
        id: 'toolPanel',
        title: 'Tool Panel',
        content: 'Use the tool panel to select different editing tools like selection, drawing, text, and measurement tools.',
        targetSelector: '.tool-panel',
        placement: 'right'
      },
      {
        id: 'assetPanel',
        title: 'Asset Panel',
        content: 'Browse and select venue assets to add to your layout from the asset panel.',
        targetSelector: '.asset-panel',
        placement: 'left'
      },
      {
        id: 'canvas',
        title: 'Canvas Area',
        content: 'This is your main workspace. Drag and drop assets here to build your venue layout.',
        targetSelector: '.canvas-stage',
        placement: 'top'
      },
      {
        id: 'layerPanel',
        title: 'Layer Panel',
        content: 'Manage the stacking order of your assets in the layer panel. You can also hide or lock layers.',
        targetSelector: '.layer-panel',
        placement: 'left'
      },
      {
        id: 'propPanel',
        title: 'Properties Panel',
        content: 'Adjust the properties of selected assets here, including size, position, and appearance.',
        targetSelector: '.properties-panel',
        placement: 'left'
      },
      {
        id: 'saveExport',
        title: 'Save and Export',
        content: 'Save your layout or export it to various formats using these options.',
        targetSelector: '.save-export-controls',
        placement: 'bottom'
      },
      {
        id: 'finish',
        title: 'Ready to Start',
        content: 'You\'re all set! Start creating your venue layout. You can revisit this tutorial anytime from the help menu.'
      }
    ]
  },
  {
    id: 'floor-plan-tutorial',
    name: 'Floor Plan Matching Tutorial',
    steps: [
      {
        id: 'floorplan-intro',
        title: 'Floor Plan Matching',
        content: 'Learn how to work with real-world floor plans in the canvas editor.'
      },
      {
        id: 'floorplan-import',
        title: 'Import Floor Plan',
        content: 'Start by importing a floor plan image using the import button.',
        targetSelector: '.floor-plan-import',
        placement: 'bottom'
      },
      {
        id: 'floorplan-dimensions',
        title: 'Set Real-World Dimensions',
        content: 'Enter the actual dimensions of the floor plan to ensure accurate scaling.',
        targetSelector: '.floor-plan-dimensions',
        placement: 'right'
      },
      {
        id: 'floorplan-rulers',
        title: 'Real-World Rulers',
        content: 'Notice the rulers showing real-world measurements based on your dimensions.',
        targetSelector: '.canvas-ruler',
        placement: 'top'
      },
      {
        id: 'floorplan-snap',
        title: 'Grid Snap',
        content: 'Enable grid snap to position assets precisely according to real-world measurements.',
        targetSelector: '.grid-snap-toggle',
        placement: 'bottom'
      },
      {
        id: 'floorplan-measurement',
        title: 'Measurement Tool',
        content: 'Use the measurement tool to measure distances between points on your floor plan.',
        targetSelector: '.measurement-tool',
        placement: 'right'
      },
      {
        id: 'floorplan-finish',
        title: 'Ready to Use Floor Plans',
        content: 'You now know how to work with real-world floor plans. Try placing some assets to see how they fit!'
      }
    ]
  },
  {
    id: 'collaboration-tutorial',
    name: 'Collaboration Features Tutorial',
    steps: [
      {
        id: 'collab-intro',
        title: 'Collaborative Editing',
        content: 'Learn how to collaborate with others in real-time on your venue layouts.'
      },
      {
        id: 'collab-panel',
        title: 'Collaboration Panel',
        content: 'Use the collaboration panel to start or join collaborative editing sessions.',
        targetSelector: '.collaboration-panel',
        placement: 'left'
      },
      {
        id: 'collab-users',
        title: 'Active Users',
        content: 'See who is currently editing the layout in the active users list.',
        targetSelector: '.active-users',
        placement: 'left'
      },
      {
        id: 'collab-cursors',
        title: 'Remote Cursors',
        content: 'Colored cursors show where other users are working in real-time.',
        targetSelector: '.canvas-stage',
        placement: 'top'
      },
      {
        id: 'collab-finish',
        title: 'Start Collaborating',
        content: 'Share the layout URL with teammates to start collaborating on venue designs.'
      }
    ]
  },
  {
    id: 'preferences-tutorial',
    name: 'User Preferences Tutorial',
    requiredRole: 'venue_owner',
    steps: [
      {
        id: 'preferences-intro',
        title: 'User Preferences',
        content: 'Learn how to customize the Event Venue Generator to suit your workflow.'
      },
      {
        id: 'preferences-access',
        title: 'Accessing Preferences',
        content: 'Navigate to Preferences from your profile menu to customize your experience.',
        targetSelector: '.profile-menu',
        placement: 'bottom'
      },
      {
        id: 'preferences-canvas',
        title: 'Canvas Preferences',
        content: 'Adjust canvas settings like grid size, rulers, and snapping behavior.',
        targetSelector: '.canvas-preferences',
        placement: 'right'
      },
      {
        id: 'preferences-tools',
        title: 'Tool Preferences',
        content: 'Set default properties for drawing tools and text annotations.',
        targetSelector: '.tools-preferences',
        placement: 'right'
      },
      {
        id: 'preferences-finish',
        title: 'Preferences Saved Automatically',
        content: 'Your preferences are automatically saved and will be applied to all your future sessions.'
      }
    ]
  }
]; 