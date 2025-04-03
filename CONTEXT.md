# Event Venue Generator - Project Context

This document provides critical context about the Event Venue Generator application, including architecture decisions, design patterns, and implementation details.

## Application Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: React Router v6 for client-side routing
- **State Management**: Local React state with Context API where needed
- **Build Tool**: Vite for fast development and optimized production builds
- **Canvas Rendering**: Konva.js with React-Konva for 2D graphics manipulation

### Backend Architecture
- **Backend-as-a-Service**: Supabase for authentication, database, and storage
- **Database**: PostgreSQL (managed by Supabase)
- **Storage**: Object storage for images and assets (Supabase Storage)
- **Authentication**: JWT-based auth with role management
- **APIs**: RESTful APIs via Supabase client library

## Data Models

### User & Authentication
- **Users**: Managed through Supabase Auth
- **Profiles**: Extended user information including role
- **Roles**: venue_owner, stager, admin

### Core Entities
- **Venues**: Physical spaces that can be staged
  - Properties: name, description, dimensions, owner_id, cover_image, etc.

- **Assets**: Furniture, decor, and other items for staging
  - Properties: name, category, image_url, dimensions, creator_id, etc.

- **Layouts**: Saved arrangements of assets on venue backgrounds
  - Properties: name, venue_id, creator_id, background_image, json_data, etc.

## Canvas Implementation

### Canvas Structure
- Background image layer (venue photo)
- Asset layers with transformation properties
- Selection and transformation handles

### Asset Properties
- Position (x, y coordinates)
- Scale (width, height)
- Rotation (degrees)
- Z-index (layer ordering)

## Key Design Decisions

### Role-Based Access
- Different dashboards and capabilities based on user role
- Appropriate database-level access controls (Row Level Security)

### Canvas Editor Approach
- Konva.js chosen for robust transformation capabilities
- React-Konva for React integration
- Custom tools panel for operation selection
- Separation of asset selection and manipulation

### UI/UX Philosophy
- Clean, minimalist interface
- Context-sensitive tools
- Mobile-responsive but optimized for desktop/tablet editing
- Consistent color scheme and component styling

## Performance Considerations

### Canvas Rendering
- Optimize for large number of assets
- Lazy-loading of asset images
- Throttled transformations during dragging

### Asset Management
- Optimized image storage (compression, correct formats)
- Thumbnail generation for asset library
- Metadata caching for faster asset loading

## Security Measures

### Authentication Security
- JWT with appropriate expiration
- Email verification
- Role-based access control

### Data Security
- Row Level Security in Supabase
- Sanitization of user inputs
- Permission validation on both client and server

### Asset Security
- Proper URL signing for assets
- Upload validation and scanning
- Storage security policies

## Deployment Strategy

### Hosting
- Frontend: Vercel/Netlify for static site hosting
- Backend: Supabase managed services

### CI/CD
- GitHub Actions for automated testing and deployment
- Environment-specific configurations
- Feature branch previews

## Development Practices

### Code Organization
- Feature-based directory structure
- Consistent component patterns
- Typed interfaces for all data structures

### Testing Strategy
- Component testing with React Testing Library
- Integration tests for critical user flows
- Manual testing for canvas operations

---

This document should be updated as architectural decisions evolve. 