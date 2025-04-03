# Event Venue Generator - Database Schema

This document outlines the database schema for the Event Venue Generator application using Supabase. It includes table definitions, relationships, and access policies.

## Tables

### profiles

Extends the Supabase `auth.users` table with application-specific user data.

```sql
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

### venues

Stores venue information owned by venue owners.

```sql
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

### assets

Stores assets (furniture, decor, etc.) that can be placed on layouts.

```sql
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

### layouts

Stores saved layout configurations.

```sql
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

### shared_layouts

Stores layout sharing permissions between users.

```sql
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

## Database Functions

### Function to count layouts for venues

```sql
create or replace function layouts_count(venue_rows venues)
returns bigint as $$
  select count(*)
  from layouts
  where venue_id = venue_rows.id;
$$ language sql stable;
```

### Function to auto-update the updated_at timestamp

```sql
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

## Storage Buckets

The application requires the following storage buckets in Supabase:

1. `venue-images` - For venue photos and background images
2. `assets` - For furniture, decor, and other staging elements
3. `thumbnails` - For layout and venue thumbnails
4. `avatars` - For user profile pictures

## Implementation Steps

1. Create the database tables in the order listed (respecting foreign key constraints)
2. Set up Row Level Security policies for each table
3. Create the necessary database functions and triggers
4. Configure storage buckets with appropriate security policies
5. Create initial test data for development

---

This schema should evolve as the application requirements change. 