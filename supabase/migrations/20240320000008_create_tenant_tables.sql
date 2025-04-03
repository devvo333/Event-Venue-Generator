-- Create tenant tables
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  theme JSONB,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tenant_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member')),
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_id)
);

CREATE TABLE tenant_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES tenant_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('leader', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

CREATE TABLE sso_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'azure', 'okta', 'custom')),
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX idx_tenant_teams_tenant_id ON tenant_teams(tenant_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_sso_providers_tenant_id ON sso_providers(tenant_id);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Tenants are viewable by their users"
  ON tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users
      WHERE tenant_users.tenant_id = tenants.id
      AND tenant_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenants are insertable by admins"
  ON tenants FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Tenant users are viewable by their tenant members"
  ON tenant_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = tenant_users.tenant_id
      AND tu.user_id = auth.uid()
    )
  );

CREATE POLICY "Tenant users are insertable by tenant admins"
  ON tenant_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = tenant_users.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Tenant teams are viewable by their tenant members"
  ON tenant_teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = tenant_teams.tenant_id
      AND tu.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members are viewable by their team members"
  ON team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "SSO providers are viewable by tenant admins"
  ON sso_providers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = sso_providers.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('owner', 'admin')
    )
  ); 