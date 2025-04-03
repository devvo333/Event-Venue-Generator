# Event Venue Generator

A web application that allows users to visualize and stage event spaces by overlaying furniture, props, and decor onto photos of real spaces.

## Features

- Upload venue photos or take live photos of spaces
- Drag-and-drop asset placement on 2D canvas
- Asset scaling, rotation, and positioning
- Save, load, and export layouts
- Role-based access for venue owners, stagers, and admins
- Asset library management
- Cloud storage for layouts and assets

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Canvas**: Konva.js / React-Konva for 2D manipulation
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Database**: Supabase Postgres
- **Build Tool**: Vite

## Project Structure

```
/src
/auth              → Authentication logic and role-based access
/components        → Reusable UI components (buttons, modals, etc.)
/canvas            → 2D staging canvas, asset placement logic
/uploads           → Image & asset upload handlers
/layouts           → Save/load/export layout functionality
/profiles          → User profile components and views
/dashboard         → Role-based dashboards (Owner, Stager, Admin)
/assets            → Static icons, illustrations, placeholder props
/data              → Asset metadata, templates, categories
/utils             → Helper functions (image scaling, ID generation, etc.)
/api               → API routes (Supabase calls)
/hooks             → Custom React hooks
/config            → App-wide constants, role definitions, keys
```

## User Roles

### Venue Owners/Operators
- Upload venue images
- Create space profiles
- Provide approved asset libraries

### Stagers/Planners
- Upload or capture room images
- Stage spaces using assets
- Create, save, and export layouts

### Admins
- Moderate uploads
- Verify assets
- Manage platform-wide tools and analytics

## Development

### Prerequisites

- Node.js 14+
- NPM or Yarn
- Supabase account

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file by copying `.env.example` and adding your Supabase credentials
4. Start the development server:
   ```
   npm run dev
   ```

## Roadmap

### Phase 1: MVP Build
- 2D Canvas Staging Tool
- Image & Asset Upload
- Auth & Basic CRUD
- Layout Saving & Export

### Phase 2: Visual Polish & Community
- Asset Snap-to-Floor / Perspective Tools
- Layout Templates
- User Profile Pages
- Commenting / Feedback

### Phase 3: AI + AR Features
- Light/Shadow Matching
- Smart Layout Suggestions
- AR Mode for mobile
- Space/Asset Matchmaker

## License

[MIT License](LICENSE)

---

Developed by [Your Name/Company] 