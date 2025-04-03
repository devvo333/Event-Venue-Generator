# Event Venue Generator - Directory Structure

This document outlines the directory structure of the Event Venue Generator application.

## Current Directory Structure

```
/
├── src/
│   ├── api/                   # API connections and service functions
│   │   ├── layouts.ts         # Layout-related API functions
│   │   ├── assets.ts          # Asset-related API functions
│   │   ├── venues.ts          # Venue-related API functions
│   │   └── users.ts           # User-related API functions
│   ├── assets/                # Static assets like images, icons, etc.
│   │   ├── icons/             # SVG and other icons
│   │   ├── images/            # Static images
│   │   └── demo/              # Demo assets and content
│   ├── auth/                  # Authentication components and logic
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   └── AuthContext.tsx    # Authentication context provider
│   ├── canvas/                # Canvas editor components
│   │   ├── AssetPanel.tsx
│   │   ├── CanvasEditor.tsx
│   │   ├── ToolPanel.tsx
│   │   ├── CanvasStage.tsx    # Konva Stage component
│   │   ├── LayerPanel.tsx     # Layer management panel
│   │   ├── BackgroundLayer.tsx # Background image layer
│   │   ├── AssetLayer.tsx     # Asset layer components
│   │   ├── Transformers.tsx   # Transformation handles
│   │   └── canvasStore.ts     # Canvas state management
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Common UI elements
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── Card.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── StatisticsCard.tsx
│   │   ├── layouts/
│   │   │   ├── LayoutCard.tsx
│   │   │   └── LayoutList.tsx
│   │   └── venues/
│   │       ├── VenueCard.tsx
│   │       ├── VenueForm.tsx
│   │       └── VenueGallery.tsx
│   ├── config/                # Configuration files
│   │   ├── supabase.ts
│   │   ├── routes.ts          # Route definitions
│   │   └── constants.ts       # App-wide constants
│   ├── dashboard/             # Dashboard views for different roles
│   │   ├── AdminDashboard.tsx
│   │   ├── StagerDashboard.tsx
│   │   └── VenueOwnerDashboard.tsx
│   ├── data/                  # Static data, constants, and mock data
│   │   ├── assetCategories.ts
│   │   ├── eventTypes.ts
│   │   └── demoData.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCanvas.ts
│   │   ├── useVenues.ts
│   │   ├── useLayouts.ts
│   │   └── useAssets.ts
│   ├── layouts/               # Layout-related components
│   │   ├── LayoutEditor.tsx   # Layout editing form
│   │   ├── LayoutViewer.tsx   # Read-only layout view
│   │   ├── LayoutExport.tsx   # Export functionality
│   │   └── LayoutSharing.tsx  # Sharing options
│   ├── profiles/              # User profile components
│   │   ├── ProfileView.tsx
│   │   ├── ProfileEdit.tsx
│   │   └── ProfileSettings.tsx
│   ├── types/                 # TypeScript type definitions
│   │   ├── assets.ts
│   │   ├── venues.ts
│   │   ├── layouts.ts
│   │   ├── users.ts
│   │   └── canvas.ts
│   ├── uploads/               # File upload components
│   │   ├── BackgroundUploader.tsx
│   │   ├── AssetUploader.tsx
│   │   ├── FileDropzone.tsx
│   │   └── UploadProgress.tsx
│   ├── utils/                 # Utility functions
│   │   ├── formatting.ts      # Date/number formatting
│   │   ├── validation.ts      # Form validation
│   │   ├── imageProcessing.ts # Image manipulation
│   │   ├── exportUtils.ts     # Export utilities
│   │   └── canvasUtils.ts     # Canvas helper functions
│   ├── App.tsx                # Main App component
│   ├── index.css              # Global CSS
│   ├── main.tsx               # Entry point
│   └── vite-env.d.ts          # Vite environment type definitions
├── public/                    # Public assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── placeholder-images/
├── test/                      # Test setup and utilities
│   ├── setup.ts
│   ├── mocks/
│   └── fixtures/
├── .env.example               # Example environment variables
├── .github/                   # GitHub Actions workflows
│   └── workflows/
│       ├── test.yml
│       └── deploy.yml
├── supabase/                  # Supabase configuration
│   └── migrations/            # Database migrations
├── CONTEXT.md                 # Architecture and design context
├── DB_SCHEMA.md               # Database schema documentation
├── DEPLOYMENT.md              # Deployment guide
├── DIRECTORY-STRUCTURE.md     # This file
├── ENV_CONFIG.md              # Environment configuration guide
├── FEATURE-ROADMAP.md         # Detailed feature roadmap
├── index.html                 # HTML entry point
├── package.json               # Project dependencies
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Project overview
├── ROADMAP.md                 # High-level development roadmap
├── tailwind.config.js         # Tailwind CSS configuration
├── TESTING.md                 # Testing strategy
├── tsconfig.json              # TypeScript configuration
├── tsconfig.node.json         # Node-specific TypeScript config
└── vite.config.ts             # Vite configuration
```

## Complete Structure (Planned)

```
/
├── src/
│   ├── api/                   # API connections and service functions
│   │   ├── layouts.ts         # Layout-related API functions
│   │   ├── assets.ts          # Asset-related API functions
│   │   ├── venues.ts          # Venue-related API functions
│   │   └── users.ts           # User-related API functions
│   ├── assets/                # Static assets like images, icons, etc.
│   │   ├── icons/             # SVG and other icons
│   │   ├── images/            # Static images
│   │   └── demo/              # Demo assets and content
│   ├── auth/                  # Authentication components and logic
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── ResetPassword.tsx
│   │   └── AuthContext.tsx    # Authentication context provider
│   ├── canvas/                # Canvas editor components
│   │   ├── AssetPanel.tsx
│   │   ├── CanvasEditor.tsx
│   │   ├── ToolPanel.tsx
│   │   ├── CanvasStage.tsx    # Konva Stage component
│   │   ├── LayerPanel.tsx     # Layer management panel
│   │   ├── BackgroundLayer.tsx # Background image layer
│   │   ├── AssetLayer.tsx     # Asset layer components
│   │   ├── Transformers.tsx   # Transformation handles
│   │   └── canvasStore.ts     # Canvas state management
│   ├── components/            # Reusable UI components
│   │   ├── common/            # Common UI elements
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Dropdown.tsx
│   │   │   └── Card.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── DashboardSidebar.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── StatisticsCard.tsx
│   │   ├── layouts/
│   │   │   ├── LayoutCard.tsx
│   │   │   └── LayoutList.tsx
│   │   └── venues/
│   │       ├── VenueCard.tsx
│   │       ├── VenueForm.tsx
│   │       └── VenueGallery.tsx
│   ├── config/                # Configuration files
│   │   ├── supabase.ts
│   │   ├── routes.ts          # Route definitions
│   │   └── constants.ts       # App-wide constants
│   ├── dashboard/             # Dashboard views for different roles
│   │   ├── AdminDashboard.tsx
│   │   ├── StagerDashboard.tsx
│   │   └── VenueOwnerDashboard.tsx
│   ├── data/                  # Static data, constants, and mock data
│   │   ├── assetCategories.ts
│   │   ├── eventTypes.ts
│   │   └── demoData.ts
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useCanvas.ts
│   │   ├── useVenues.ts
│   │   ├── useLayouts.ts
│   │   └── useAssets.ts
│   ├── layouts/               # Layout-related components
│   │   ├── LayoutEditor.tsx   # Layout editing form
│   │   ├── LayoutViewer.tsx   # Read-only layout view
│   │   ├── LayoutExport.tsx   # Export functionality
│   │   └── LayoutSharing.tsx  # Sharing options
│   ├── profiles/              # User profile components
│   │   ├── ProfileView.tsx
│   │   ├── ProfileEdit.tsx
│   │   └── ProfileSettings.tsx
│   ├── types/                 # TypeScript type definitions
│   │   ├── assets.ts
│   │   ├── venues.ts
│   │   ├── layouts.ts
│   │   ├── users.ts
│   │   └── canvas.ts
│   ├── uploads/               # File upload components
│   │   ├── BackgroundUploader.tsx
│   │   ├── AssetUploader.tsx
│   │   ├── FileDropzone.tsx
│   │   └── UploadProgress.tsx
│   ├── utils/                 # Utility functions
│   │   ├── formatting.ts      # Date/number formatting
│   │   ├── validation.ts      # Form validation
│   │   ├── imageProcessing.ts # Image manipulation
│   │   ├── exportUtils.ts     # Export utilities
│   │   └── canvasUtils.ts     # Canvas helper functions
│   ├── App.tsx                # Main App component
│   ├── index.css              # Global CSS
│   ├── main.tsx               # Entry point
│   └── vite-env.d.ts          # Vite environment type definitions
├── public/                    # Public assets
│   ├── favicon.ico
│   ├── logo.svg
│   └── placeholder-images/
├── test/                      # Test setup and utilities
│   ├── setup.ts
│   ├── mocks/
│   └── fixtures/
├── .env.example               # Example environment variables
├── .github/                   # GitHub Actions workflows
│   └── workflows/
│       ├── test.yml
│       └── deploy.yml
├── supabase/                  # Supabase configuration
│   └── migrations/            # Database migrations
├── CONTEXT.md                 # Architecture and design context
├── DB_SCHEMA.md               # Database schema documentation
├── DEPLOYMENT.md              # Deployment guide
├── DIRECTORY-STRUCTURE.md     # This file
├── ENV_CONFIG.md              # Environment configuration guide
├── FEATURE-ROADMAP.md         # Detailed feature roadmap
├── index.html                 # HTML entry point
├── package.json               # Project dependencies
├── postcss.config.js          # PostCSS configuration
├── README.md                  # Project overview
├── ROADMAP.md                 # High-level development roadmap
├── tailwind.config.js         # Tailwind CSS configuration
├── TESTING.md                 # Testing strategy
├── tsconfig.json              # TypeScript configuration
├── tsconfig.node.json         # Node-specific TypeScript config
└── vite.config.ts             # Vite configuration
```

## Key Directories and Their Purposes

### `/src/api`
Contains all API interaction logic, organized by resource type. Each file exports functions for fetching, creating, updating, and deleting resources.

### `/src/canvas`
Houses all components related to the canvas editor, the core functionality of the application. Includes asset manipulation, layer management, and state control.

### `/src/components`
Reusable UI components organized by domain. Common components are used throughout the application, while more specific components are grouped by feature area.

### `/src/hooks`
Custom React hooks that encapsulate reusable logic, particularly for data fetching, state management, and complex UI interactions.

### `/src/types`
TypeScript interfaces and types that define the shape of data throughout the application, ensuring type safety and code clarity.

### `/src/uploads`
Components and logic related to file uploads, including image processing, progress tracking, and integration with Supabase storage.

### `/src/utils`
Utility functions that provide common functionality like formatting, validation, and helper methods for various operations.

## File Naming Conventions

- React components use PascalCase (e.g., `VenueCard.tsx`)
- Utility files and hooks use camelCase (e.g., `useAuth.ts`, `formatDate.ts`)
- Constants and configuration files use camelCase (e.g., `routes.ts`, `constants.ts`)
- Test files append `.test` or `.spec` to the filename (e.g., `VenueCard.test.tsx`)

## Organizational Philosophy

The project follows a feature-based organization approach, where related components, utilities, and logic are grouped together. This improves navigation and makes it easier to understand the relationships between different parts of the codebase.

For larger features like the canvas editor, subdirectories may be created to further organize components and utilities specific to that feature.

---

This directory structure is a living document and may evolve as the application grows and changes. 