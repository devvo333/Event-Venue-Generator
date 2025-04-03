# Asset Marketplace

## Overview
The Asset Marketplace is a platform for Event Venue Generator users to discover, purchase, and use assets for their venue layouts. It enables creators to share and sell their designs while providing venue planners with high-quality assets to enhance their events.

## Features
- Browse and search assets by category, price, and tags
- Purchase and download assets for use in venue layouts
- Rate and review assets
- Creator profiles with portfolios
- Asset favorites and collections
- Secure purchasing system

## Directory Structure
```
src/marketplace/
├── components/           # React components for marketplace UI
│   ├── MarketplaceHome.tsx     # Landing page for marketplace
│   ├── AssetDetails.tsx        # Detailed asset view with purchase options
│   └── ...
├── services/             # Services for data fetching and API interactions
│   └── marketplaceService.ts   # Core marketplace data service
├── database/             # Database schema and migrations
│   └── schema.sql        # SQL schema for marketplace tables
└── README.md             # This file
```

## Database Schema
The marketplace uses the following main tables:
- `asset_categories` - Categories and subcategories for assets
- `marketplace_assets` - Asset listings with metadata
- `asset_purchases` - Records of user purchases
- `asset_reviews` - User reviews and ratings
- `asset_favorites` - User's favorited assets
- `creator_profiles` - Extended profiles for asset creators

## Components
### MarketplaceHome
The main entry point for the marketplace, featuring:
- Featured assets section
- Category browsing
- New arrivals
- Search functionality

### AssetDetails
Detailed view of an individual asset with:
- High-quality preview images
- Technical specifications
- Purchase button
- User reviews
- Related assets

## Services
### marketplaceService
Core service for interacting with the marketplace data:
- Fetching asset listings and categories
- Handling purchases
- Managing reviews
- User favorites

## Security and Permissions
The marketplace implements row-level security policies:
- Asset categories are readable by all, writable by admins only
- Assets are readable by all, writable by their creators and admins
- Purchases are private to the purchaser and admins
- Reviews are public but only editable by the reviewer
- Favorites are private to each user

## Integration with Venue Editor
Assets purchased from the marketplace are seamlessly available in the venue editor:
- Direct drag-and-drop from asset library
- Automatic scaling to real-world dimensions
- Proper rendering with appropriate styles and colors

## Future Enhancements
- Asset collections and curated lists
- Subscription model for premium assets
- Advanced filters and recommendation engine
- Integration with AR/VR previews

## Getting Started
To work on the marketplace components:
1. Review the database schema to understand the data model
2. Explore the service methods to see available API operations
3. Run the application and navigate to `/marketplace` to view the UI 