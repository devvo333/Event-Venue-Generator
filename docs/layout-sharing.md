# Layout Sharing Feature

The layout sharing feature allows users to create, share, and purchase venue layouts. It consists of three main components:

1. Layout Templates
2. User-Generated Layouts
3. Layout Marketplace

## Components

### Layout Templates

Layout templates are pre-designed layouts that users can use as a starting point for their own designs. They include:

- Basic layout structure
- Common venue configurations
- Best practices for different event types

### User-Generated Layouts

Users can create and share their own layouts with the community. Features include:

- Layout creation and editing
- Preview functionality
- Sharing with other users
- Like and download tracking

### Layout Marketplace

The marketplace allows users to sell their layouts to other users. Features include:

- Layout listings with pricing
- Search and filtering
- Purchase flow
- License management
- Ratings and reviews

## Database Schema

The feature uses several database tables:

- `layout_templates`: Pre-designed layout templates
- `user_generated_layouts`: User-created layouts
- `layout_marketplace`: Layouts available for purchase
- `layout_likes`: User likes for layouts
- `layout_purchases`: Purchase records
- `layout_shares`: Shared layout records

## API Endpoints

The following API endpoints are available:

### Layout Templates
- `GET /api/layouts/templates`: Get all layout templates
- `GET /api/layouts/templates/:id`: Get a specific template

### User-Generated Layouts
- `GET /api/layouts/user`: Get user's layouts
- `POST /api/layouts/user`: Create a new layout
- `PUT /api/layouts/user/:id`: Update a layout
- `DELETE /api/layouts/user/:id`: Delete a layout

### Layout Marketplace
- `GET /api/layouts/marketplace`: Get marketplace layouts
- `POST /api/layouts/marketplace`: Create a marketplace listing
- `PUT /api/layouts/marketplace/:id`: Update a marketplace listing
- `POST /api/layouts/marketplace/:id/purchase`: Purchase a layout

### Social Features
- `POST /api/layouts/:id/like`: Like a layout
- `POST /api/layouts/:id/share`: Share a layout

## Security

The feature implements Row Level Security (RLS) policies to ensure:

- Users can only modify their own layouts
- Public layouts are viewable by everyone
- Purchase records are private to the buyer
- Like and share actions are properly tracked

## Usage Examples

### Creating a Layout

```typescript
const newLayout = {
  title: 'Conference Hall Layout',
  description: 'A professional layout for conference events',
  previewImage: 'https://example.com/layout-preview.jpg',
  metadata: {
    capacity: 200,
    dimensions: {
      width: 20,
      height: 30,
      unit: 'meters'
    },
    venueType: 'conference',
    eventType: 'business'
  },
  isPublic: true
};

const layout = await createLayout(newLayout);
```

### Purchasing a Layout

```typescript
const purchase = await purchaseLayout('layout-id', 1);
```

### Sharing a Layout

```typescript
const shareUrl = await shareLayout('layout-id');
```

## Future Enhancements

Planned improvements for the layout sharing feature include:

1. Advanced search filters
2. Layout versioning
3. Collaborative editing
4. Layout analytics
5. Integration with venue management systems 