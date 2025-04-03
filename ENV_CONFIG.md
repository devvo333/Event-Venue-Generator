# Environment Configuration

This document outlines the environment variables and configuration needed for the Event Venue Generator application in different environments.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional Variables
VITE_APP_NAME="Event Venue Generator"
VITE_APP_VERSION="0.1.0"
VITE_DEFAULT_AVATAR_URL=https://your-default-avatar-url.com/image.png
```

## Environment-Specific Configurations

### Development Environment

For local development, create a `.env.development` file:

```bash
# Supabase Configuration - Development Project
VITE_SUPABASE_URL=your-dev-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-dev-supabase-anon-key

# Debug Settings
VITE_DEBUG_MODE=true
VITE_MOCK_AUTH=false  # Set to true to bypass authentication during development
```

### Testing Environment

For testing purposes, create a `.env.test` file:

```bash
# Supabase Configuration - Testing Project
VITE_SUPABASE_URL=your-test-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-test-supabase-anon-key

# Test Settings
VITE_DEBUG_MODE=true
VITE_MOCK_AUTH=true
```

### Production Environment

For production deployment, set these environment variables in your hosting platform:

```bash
# Supabase Configuration - Production Project
VITE_SUPABASE_URL=your-prod-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-prod-supabase-anon-key

# Production Settings
VITE_DEBUG_MODE=false
VITE_MOCK_AUTH=false
VITE_ANALYTICS_ID=your-analytics-id  # For integrating analytics
```

## Environment Setup Instructions

### Local Development Setup

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your project URL and anon key from the Supabase dashboard
3. Create a `.env` or `.env.development` file in the project root
4. Add the required environment variables
5. Run the development server with `npm run dev`

### Production Deployment Setup

#### Using Vercel

1. Connect your GitHub repository to Vercel
2. In the Vercel project settings, add the environment variables
3. Deploy the application

#### Using Netlify

1. Connect your GitHub repository to Netlify
2. In the Netlify project settings, add the environment variables
3. Set the build command to `npm run build`
4. Set the publish directory to `dist`
5. Deploy the application

## Testing Environment Variables

To verify your environment variables are correctly loaded:

```typescript
// Check if Supabase variables are set
console.log('Supabase URL defined:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key defined:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## Security Considerations

- **Never** commit `.env` files to your repository
- Keep production keys secure and rotate them periodically
- Use different Supabase projects for development, staging, and production
- Set appropriate security policies for each environment

## Additional Configuration

### Content Security Policy

For production deployment, consider adding a Content Security Policy:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' https://*.supabase.co; img-src 'self' data: https://*.supabase.co https://your-cdn.com; script-src 'self';">
```

### CORS Configuration

If you're using separate domains for your API and frontend, set up CORS in your Supabase project settings. 