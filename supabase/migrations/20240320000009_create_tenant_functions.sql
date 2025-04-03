-- Create function to initialize a new tenant
CREATE OR REPLACE FUNCTION initialize_tenant(
  p_name TEXT,
  p_domain TEXT,
  p_owner_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Create tenant
  INSERT INTO tenants (name, domain)
  VALUES (p_name, p_domain)
  RETURNING id INTO v_tenant_id;

  -- Add owner as tenant user
  INSERT INTO tenant_users (tenant_id, user_id, role)
  VALUES (v_tenant_id, p_owner_id, 'owner');

  RETURN v_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION check_tenant_permission(
  p_tenant_id UUID,
  p_user_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
  v_permissions JSONB;
BEGIN
  -- Get user role and permissions
  SELECT role, permissions
  INTO v_role, v_permissions
  FROM tenant_users
  WHERE tenant_id = p_tenant_id
  AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Check if role has permission
  IF v_role = 'owner' THEN
    RETURN TRUE;
  END IF;

  -- Check custom permissions
  IF v_permissions IS NOT NULL AND v_permissions ? p_permission THEN
    RETURN v_permissions->>p_permission = 'true';
  END IF;

  -- Default role-based permissions
  RETURN CASE
    WHEN v_role = 'admin' THEN TRUE
    WHEN v_role = 'manager' AND p_permission IN ('manage_users', 'manage_teams') THEN TRUE
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle SSO authentication
CREATE OR REPLACE FUNCTION handle_sso_auth(
  p_tenant_id UUID,
  p_provider TEXT,
  p_token TEXT
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  name TEXT,
  role TEXT
) AS $$
DECLARE
  v_provider_config JSONB;
  v_user_data JSONB;
BEGIN
  -- Get provider configuration
  SELECT config
  INTO v_provider_config
  FROM sso_providers
  WHERE tenant_id = p_tenant_id
  AND provider = p_provider;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SSO provider not configured';
  END IF;

  -- Validate token and get user data (implementation depends on provider)
  -- This is a placeholder for the actual SSO validation logic
  v_user_data := '{"email": "user@example.com", "name": "User Name"}'::JSONB;

  -- Return user information
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'name',
    tu.role
  FROM auth.users u
  JOIN tenant_users tu ON tu.user_id = u.id
  WHERE u.email = v_user_data->>'email'
  AND tu.tenant_id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get tenant theme
CREATE OR REPLACE FUNCTION get_tenant_theme(p_tenant_id UUID)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT theme
    FROM tenants
    WHERE id = p_tenant_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update tenant settings
CREATE OR REPLACE FUNCTION update_tenant_settings(
  p_tenant_id UUID,
  p_settings JSONB
)
RETURNS void AS $$
BEGIN
  UPDATE tenants
  SET 
    settings = COALESCE(settings, '{}'::JSONB) || p_settings,
    updated_at = NOW()
  WHERE id = p_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 