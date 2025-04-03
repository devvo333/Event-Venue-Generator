-- Create API tables
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  secret TEXT NOT NULL,
  permissions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE api_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE api_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events JSONB NOT NULL,
  secret TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE api_webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES api_webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  status_code INTEGER,
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_api_keys_tenant_id ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_key ON api_keys(key);
CREATE INDEX idx_api_requests_api_key_id ON api_requests(api_key_id);
CREATE INDEX idx_api_requests_created_at ON api_requests(created_at);
CREATE INDEX idx_api_webhooks_tenant_id ON api_webhooks(tenant_id);
CREATE INDEX idx_api_webhook_logs_webhook_id ON api_webhook_logs(webhook_id);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "API keys are viewable by tenant admins"
  ON api_keys FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = api_keys.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "API keys are insertable by tenant admins"
  ON api_keys FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = api_keys.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "API requests are viewable by tenant admins"
  ON api_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api_keys ak
      JOIN tenant_users tu ON tu.tenant_id = ak.tenant_id
      WHERE ak.id = api_requests.api_key_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "API webhooks are viewable by tenant admins"
  ON api_webhooks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = api_webhooks.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "API webhooks are insertable by tenant admins"
  ON api_webhooks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tenant_users tu
      WHERE tu.tenant_id = api_webhooks.tenant_id
      AND tu.user_id = auth.uid()
      AND tu.role IN ('owner', 'admin')
    )
  ); 