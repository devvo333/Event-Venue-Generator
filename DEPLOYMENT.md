# Deployment Guide

This guide outlines the steps to deploy the Event Venue Generator application to production environments.

## Pre-deployment Checklist

Before deploying the application, ensure the following items are completed:

- [ ] All tests are passing
- [ ] Environment variables are configured correctly
- [ ] Build process completes successfully
- [ ] Assets and images are optimized
- [ ] Bundle size is reasonable
- [ ] Database schema is finalized
- [ ] Security policies are in place
- [ ] Performance testing is complete

## Deployment Options

### Option 1: Vercel (Recommended for Frontend)

Vercel provides an excellent platform for deploying React applications with minimal configuration.

#### Steps:

1. **Create a Vercel account**: Sign up at [vercel.com](https://vercel.com)

2. **Connect your GitHub repository**:
   - Go to the Vercel dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings

3. **Configure environment variables**:
   - Add all required environment variables in the Vercel project settings
   - Ensure Supabase URL and anon key are set correctly

4. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy**:
   - Trigger a deploy manually or let Vercel deploy automatically on push

### Option 2: Netlify

Another excellent option for deploying React applications.

#### Steps:

1. **Create a Netlify account**: Sign up at [netlify.com](https://netlify.com)

2. **Connect your GitHub repository**:
   - Go to the Netlify dashboard
   - Click "New site from Git"
   - Choose GitHub and select your repository

3. **Configure build settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`

4. **Configure environment variables**:
   - Add all required environment variables in the Netlify site settings

5. **Deploy**:
   - Trigger a deploy manually or let Netlify deploy automatically on push

### Option 3: Traditional Hosting

For manual deployment to your own hosting environment.

#### Steps:

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Upload the `dist` directory** to your hosting provider:
   - Use FTP, SFTP, or your provider's deployment tools
   - Ensure all files in the `dist` directory are transferred

3. **Configure server settings**:
   - Set up URL rewrites for single-page application routing:

   Apache `.htaccess` example:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   Nginx configuration example:
   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## Continuous Deployment

Setting up continuous deployment is recommended for an efficient workflow.

### GitHub Actions Workflow

Create a file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      # Deploy to Vercel (example)
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Database Deployment

For Supabase, use the following approaches:

### Option 1: Supabase Migration Files

1. **Create migration files**: Use the Supabase CLI to generate migration files

2. **Apply migrations in the Supabase dashboard**:
   - Go to the SQL Editor in the Supabase dashboard
   - Run your migration scripts

### Option 2: Database CI/CD

Use GitHub Actions to apply database changes automatically:

```yaml
name: Database Migrations

on:
  push:
    branches: [main]
    paths:
      - 'supabase/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
        with:
          version: 1.36.3
      
      - name: Run migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

## Post-Deployment Steps

After deploying the application, perform these checks:

1. **Verify environment variables**: Check that all environment variables are correctly set

2. **Test authentication**: Ensure login and registration are working

3. **Check database connections**: Verify the application can connect to the database

4. **Test critical user flows**: Go through main user journeys to confirm they work

5. **Verify analytics**: Ensure analytics tools are properly tracking user activity

6. **Check performance**: Run performance tests in the production environment

7. **Monitor errors**: Set up error tracking and monitor for any issues

## Rollback Procedure

If deployment issues occur, follow these steps to rollback:

1. **For Vercel/Netlify**: Use the dashboard to revert to the previous deployment

2. **For traditional hosting**: Keep a backup of the previous version and restore it if needed

3. **Database rollback**: Maintain database backups and restore if necessary

## Troubleshooting Common Issues

### 404 Errors on Routes

**Solution**: Ensure server is configured to handle SPA routing (see server configuration above)

### API Connection Issues

**Solution**: Verify environment variables for API endpoints, check CORS configuration

### Authentication Problems

**Solution**: Check Supabase configuration, verify JWT expiration settings

### Slow Performance

**Solution**: Check bundle size, enable compression, verify CDN configuration

## Production Monitoring

Set up monitoring for your production application:

1. **Error tracking**: Implement Sentry or similar error tracking tool

2. **Performance monitoring**: Use Lighthouse CI or New Relic

3. **Usage analytics**: Implement Google Analytics or Plausible

4. **Server monitoring**: Set up uptime monitoring with UptimeRobot or Pingdom

## Security Considerations

1. **Enable HTTPS**: Ensure your domain uses HTTPS with valid SSL certificate

2. **Set security headers**:
   ```
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   Content-Security-Policy: default-src 'self'; connect-src 'self' https://*.supabase.co;
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Referrer-Policy: strict-origin-when-cross-origin
   ```

3. **Regular security audits**: Scan for vulnerabilities regularly

4. **Keep dependencies updated**: Regularly update npm packages

## Scaling Considerations

If your application starts to grow:

1. **CDN integration**: Use a Content Delivery Network for static assets

2. **Database scaling**: Monitor Supabase usage and upgrade plans as needed

3. **Regional deployments**: Consider multi-region deployments for better performance 