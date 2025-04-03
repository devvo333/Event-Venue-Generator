# Supabase Setup

This document contains the Supabase project configuration details.

## Project Credentials

### Project URL
```
https://yhoeglkibexsyyzowzsb.supabase.co
```

### Project Anon/Public Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob2VnbGtpYmV4c3l5em93enNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MTMwNjAsImV4cCI6MjA1OTI4OTA2MH0.zYun5Wg5WtttyV66DnRUSIM1GM1cndYlcamObm5KRdw
```

## Environment Variables
These credentials should be added to your `.env` file in the following format:

```env
VITE_SUPABASE_URL=https://yhoeglkibexsyyzowzsb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlob2VnbGtpYmV4c3l5em93enNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3MTMwNjAsImV4cCI6MjA1OTI4OTA2MH0.zYun5Wg5WtttyV66DnRUSIM1GM1cndYlcamObm5KRdw
```

## Important Notes
- Keep these credentials secure and never commit them directly to version control
- The `.env` file should be listed in your `.gitignore`
1. Log in to the [Supabase Dashboard](https://app.supabase.io)
2. Click "New Project"
3. Enter project details:
   - **Name**: Event Venue Generator
   - **Database Password**: Create a strong password
   - **Region**: Choose the region closest to your users
4. Click "Create New Project"
5. Wait for your project to be provisioned (this may take a few minutes)

## Step 2: Set Up Environment Variables

1. In your Supabase project dashboard, go to "Settings" > "API"
2. Copy the following credentials:
   - **Project URL**
   - **anon/public** key
3. Create a `.env` file in your project root with these values:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

4. Add `.env` to your `.gitignore` file to prevent committing sensitive information

## Step 3: Create Database Tables

Use the SQL Editor in your Supabase dashboard to create the necessary tables as outlined in the DB_SCHEMA.md file.

### 1. Profiles Table

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users primary key,
  email text not null,
  role text not null check (role in ('venue_owner', 'stager', 'admin')),
  full_name text,
  avatar_url text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Set up Row Level Security
alter table profiles enable row level security;

-- Access policies
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ));
```

### 2. Venues Table

```sql
-- Create venues table
create table venues (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references profiles(id) not null,
  name text not null,
  description text,
  cover_image text,
  address text,
  dimensions jsonb,
  is_public boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Set up Row Level Security
alter table venues enable row level security;

-- Access policies
create policy "Venue owners can CRUD their own venues"
  on venues for all
  using (auth.uid() = owner_id);

create policy "All authenticated users can view public venues"
  on venues for select
  using (is_public = true);

create policy "Admins can view all venues"
  on venues for select
  using (exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ));
```

### 3. Assets Table

```sql
-- Create assets table
create table assets (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references profiles(id) not null,
  name text not null,
  description text,
  category text not null,
  tags text[],
  imageUrl text not null,
  width float,
  height float,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_public boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Set up Row Level Security
alter table assets enable row level security;

-- Access policies
create policy "Users can CRUD their own assets"
  on assets for all
  using (auth.uid() = creator_id);

create policy "All authenticated users can view approved public assets"
  on assets for select
  using (status = 'approved' and is_public = true);

create policy "Admins can view and update all assets"
  on assets for all
  using (exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ));
```

### 4. Layouts Table

```sql
-- Create layouts table
create table layouts (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references profiles(id) not null,
  venue_id uuid references venues(id),
  name text not null,
  description text,
  background_image text not null,
  json_data jsonb not null,
  thumbnail text,
  is_public boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Set up Row Level Security
alter table layouts enable row level security;

-- Access policies
create policy "Users can CRUD their own layouts"
  on layouts for all
  using (auth.uid() = creator_id);

create policy "Venue owners can view layouts for their venues"
  on layouts for select
  using (exists (
    select 1 from venues
    where venues.id = layouts.venue_id and venues.owner_id = auth.uid()
  ));

create policy "All authenticated users can view public layouts"
  on layouts for select
  using (is_public = true);

create policy "Admins can view all layouts"
  on layouts for select
  using (exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ));
```

### 5. Shared Layouts Table

```sql
-- Create shared_layouts table
create table shared_layouts (
  id uuid primary key default uuid_generate_v4(),
  layout_id uuid references layouts(id) not null,
  shared_by uuid references profiles(id) not null,
  shared_with uuid references profiles(id) not null,
  permission text not null check (permission in ('view', 'edit')),
  created_at timestamptz not null default now()
);

-- Set up Row Level Security
alter table shared_layouts enable row level security;

-- Access policies
create policy "Users can share their own layouts"
  on shared_layouts for insert
  using (
    exists (
      select 1 from layouts
      where layouts.id = layout_id and layouts.creator_id = auth.uid()
    )
  );

create policy "Users can view their own sharing settings"
  on shared_layouts for select
  using (shared_by = auth.uid() or shared_with = auth.uid());

create policy "Users can delete their own sharing settings"
  on shared_layouts for delete
  using (shared_by = auth.uid());

create policy "Admins can view all sharing settings"
  on shared_layouts for select
  using (exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  ));
```

## Step 4: Create Database Functions

### Update Timestamp Function

```sql
-- Function to auto-update the updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to relevant tables
create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at();

create trigger update_venues_updated_at
  before update on venues
  for each row
  execute function update_updated_at();

create trigger update_assets_updated_at
  before update on assets
  for each row
  execute function update_updated_at();

create trigger update_layouts_updated_at
  before update on layouts
  for each row
  execute function update_updated_at();
```

### Layouts Count Function

```sql
-- Function to count layouts for venues
create or replace function layouts_count(venue_rows venues)
returns bigint as $$
  select count(*)
  from layouts
  where venue_id = venue_rows.id;
$$ language sql stable;
```

## Step 5: Configure Storage Buckets

1. In your Supabase dashboard, go to "Storage"
2. Create the following buckets:

### 1. venue-images

1. Click "Create Bucket"
2. Enter "venue-images" as the name
3. Set the privacy setting to "Private"
4. Click "Create"
5. Add the following RLS policy:

```sql
-- Allow authenticated users to upload venue images
create policy "Authenticated users can upload venue images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'venue-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own venue images
create policy "Users can view their own venue images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'venue-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view public venue images
create policy "Users can view public venue images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'venue-images' AND
  (storage.foldername(name))[1] = 'public'
);
```

### 2. assets

1. Click "Create Bucket"
2. Enter "assets" as the name
3. Set the privacy setting to "Private"
4. Click "Create"
5. Add the following RLS policy:

```sql
-- Allow authenticated users to upload assets
create policy "Authenticated users can upload assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own assets
create policy "Users can view their own assets"
on storage.objects for select
to authenticated
using (
  bucket_id = 'assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view public assets
create policy "Users can view public assets"
on storage.objects for select
to authenticated
using (
  bucket_id = 'assets' AND
  (storage.foldername(name))[1] = 'public'
);
```

### 3. thumbnails

1. Click "Create Bucket"
2. Enter "thumbnails" as the name
3. Set the privacy setting to "Private"
4. Click "Create"
5. Add the following RLS policy:

```sql
-- Allow authenticated users to upload thumbnails
create policy "Authenticated users can upload thumbnails"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view thumbnails they have access to
create policy "Users can view their thumbnails"
on storage.objects for select
to authenticated
using (
  bucket_id = 'thumbnails' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    (storage.foldername(name))[1] = 'public'
  )
);
```

### 4. avatars

1. Click "Create Bucket"
2. Enter "avatars" as the name
3. Set the privacy setting to "Private"
4. Click "Create"
5. Add the following RLS policy:

```sql
-- Allow authenticated users to upload their avatar
create policy "Authenticated users can upload their avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars' AND
  name = auth.uid()::text || '.jpg'
);

-- Allow anyone to view avatars
create policy "Anyone can view avatars"
on storage.objects for select
to authenticated
using (
  bucket_id = 'avatars'
);
```

## Step 6: Configure Authentication

### 1. Set Up Email Authentication

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Ensure "Email" is enabled
3. Configure your desired settings:
   - **Confirm email**: On (recommended for production)
   - **Enable auto confirm**: Off (recommended for production)
   - **Secure email change**: On

### 2. Set Up Google OAuth

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Find "Google" in the list and click on it to expand
3. Toggle "Enable Google OAuth" to ON
4. Create OAuth credentials in Google Cloud Platform:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add your Supabase auth callback URL as an authorized redirect URI: 
     `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret
5. Back in the Supabase dashboard, enter the Google Client ID and Client Secret
6. Click "Save" to enable Google OAuth

### 3. Set Up Auth Triggers

To automatically create a profile when a user signs up, add the following SQL through the SQL Editor:

```sql
-- Create a trigger to create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_role text := 'stager';
begin
  insert into public.profiles (
    id, 
    email, 
    role, 
    full_name,
    avatar_url,
    created_at
  )
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'role', default_role),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

This function will create a profile record for any new user, whether they sign up with email/password or through a social provider like Google. It will use the metadata provided by the authentication process to fill in profile details when available.

## Step 7: Configure Supabase Client

1. Install the Supabase client library in your project:

```bash
npm install @supabase/supabase-js
```

2. Create a `supabase.ts` file in your `src/config` directory:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 8: Initialize Database with Sample Data (Optional)

For development purposes, you might want to add some sample data:

```sql
-- Insert a test admin user (replace with your email)
insert into profiles (id, email, role, full_name)
values 
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin', 'Admin User');

-- Insert test venues
insert into venues (id, owner_id, name, description, is_public)
values 
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Grand Ballroom', 'A luxurious ballroom for weddings and galas', true),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Conference Center', 'Modern space for business events', true);

-- Insert test assets
insert into assets (id, creator_id, name, category, imageUrl, status, is_public)
values 
  ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Round Table', 'furniture', 'https://example.com/table.jpg', 'approved', true),
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Chair', 'furniture', 'https://example.com/chair.jpg', 'approved', true),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Floor Lamp', 'lighting', 'https://example.com/lamp.jpg', 'approved', true);
```

## Step 9: Set Up Database Migrations (Optional)

For a more structured approach to database changes, you can use the Supabase CLI to manage migrations:

1. Install the Supabase CLI:

```bash
npm install -g supabase
```

2. Initialize Supabase in your project:

```bash
supabase init
```

3. Create a migration file:

```bash
supabase migration new initial_schema
```

4. Add your SQL to the migration file created in `supabase/migrations/`

5. Apply the migration to your local development database:

```bash
supabase db reset
```

## Troubleshooting

### Common Issues

1. **Authentication Issues**
   - Check that your Supabase URL and anon key are correct
   - Ensure your RLS policies are configured correctly
   - Verify that you're using the correct auth methods

2. **Database Connection Issues**
   - Check your network connection
   - Verify your database is active in the Supabase dashboard
   - Check for any IP restrictions

3. **Storage Issues**
   - Ensure your RLS policies allow the required operations
   - Check that file paths are constructed correctly
   - Verify that bucket names are correct

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
- [Supabase Discord Community](https://discord.supabase.com)

---

This setup guide covers the basic configuration needed to get started with Supabase as the backend for the Event Venue Generator application. Additional configuration may be needed as the application grows and evolves. 