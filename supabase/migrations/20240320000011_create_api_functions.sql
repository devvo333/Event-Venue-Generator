-- Create function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key(
  p_tenant_id UUID,
  p_name TEXT,
  p_permissions JSONB,
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  key TEXT,
  secret TEXT
) AS $$
DECLARE
  v_key TEXT;
  v_secret TEXT;
  v_id UUID;
BEGIN
  -- Generate random key and secret
  v_key := encode(gen_random_bytes(32), 'base64');
  v_secret := encode(gen_random_bytes(64), 'base64');

  -- Insert new API key
  INSERT INTO api_keys (
    tenant_id,
    name,
    key,
    secret,
    permissions,
    expires_at
  )
  VALUES (
    p_tenant_id,
    p_name,
    v_key,
    v_secret,
    p_permissions,
    p_expires_at
  )
  RETURNING id INTO v_id;

  RETURN QUERY
  SELECT v_id, v_key, v_secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to validate API key
CREATE OR REPLACE FUNCTION validate_api_key(
  p_key TEXT,
  p_secret TEXT
)
RETURNS TABLE (
  is_valid BOOLEAN,
  tenant_id UUID,
  permissions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TRUE,
    ak.tenant_id,
    ak.permissions
  FROM api_keys ak
  WHERE ak.key = p_key
  AND ak.secret = p_secret
  AND ak.is_active = true
  AND (ak.expires_at IS NULL OR ak.expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log API request
CREATE OR REPLACE FUNCTION log_api_request(
  p_api_key_id UUID,
  p_endpoint TEXT,
  p_method TEXT,
  p_status_code INTEGER,
  p_response_time INTEGER,
  p_ip_address TEXT,
  p_user_agent TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO api_requests (
    api_key_id,
    endpoint,
    method,
    status_code,
    response_time,
    ip_address,
    user_agent
  )
  VALUES (
    p_api_key_id,
    p_endpoint,
    p_method,
    p_status_code,
    p_response_time,
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process webhook
CREATE OR REPLACE FUNCTION process_webhook(
  p_tenant_id UUID,
  p_event TEXT,
  p_payload JSONB
)
RETURNS void AS $$
DECLARE
  v_webhook RECORD;
  v_response_status INTEGER;
  v_response_text TEXT;
BEGIN
  -- Get active webhooks for the event
  FOR v_webhook IN
    SELECT id, url, secret
    FROM api_webhooks
    WHERE tenant_id = p_tenant_id
    AND is_active = true
    AND events ? p_event
  LOOP
    -- In a real implementation, this would make an HTTP request
    -- For now, we'll just log the webhook
    v_response_status := 200;
    v_response_text := 'Webhook processed';

    -- Log webhook execution
    INSERT INTO api_webhook_logs (
      webhook_id,
      event,
      payload,
      status_code,
      response
    )
    VALUES (
      v_webhook.id,
      p_event,
      p_payload,
      v_response_status,
      v_response_text
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 