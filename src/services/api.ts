import { supabase } from '../lib/supabase';

export interface APIKey {
  id: string;
  tenant_id: string;
  name: string;
  key: string;
  secret: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface APIRequest {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time: number;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface Webhook {
  id: string;
  tenant_id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookLog {
  id: string;
  webhook_id: string;
  event: string;
  payload: Record<string, any>;
  status_code: number;
  response: string;
  created_at: string;
}

class APIService {
  // API Key Management
  async generateAPIKey(
    tenantId: string,
    name: string,
    permissions: Record<string, boolean>,
    expiresAt?: Date
  ): Promise<{ id: string; key: string; secret: string }> {
    const { data, error } = await supabase.rpc('generate_api_key', {
      p_tenant_id: tenantId,
      p_name: name,
      p_permissions: permissions,
      p_expires_at: expiresAt?.toISOString(),
    });

    if (error) throw error;
    return data;
  }

  async getAPIKeys(tenantId: string): Promise<APIKey[]> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data;
  }

  async deactivateAPIKey(apiKeyId: string): Promise<void> {
    const { error } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', apiKeyId);

    if (error) throw error;
  }

  // API Request Logging
  async getAPIRequests(apiKeyId: string): Promise<APIRequest[]> {
    const { data, error } = await supabase
      .from('api_requests')
      .select('*')
      .eq('api_key_id', apiKeyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Webhook Management
  async createWebhook(
    tenantId: string,
    name: string,
    url: string,
    events: string[]
  ): Promise<Webhook> {
    const secret = crypto.randomUUID();
    const { data, error } = await supabase
      .from('api_webhooks')
      .insert({
        tenant_id: tenantId,
        name,
        url,
        events,
        secret,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getWebhooks(tenantId: string): Promise<Webhook[]> {
    const { data, error } = await supabase
      .from('api_webhooks')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data;
  }

  async getWebhookLogs(webhookId: string): Promise<WebhookLog[]> {
    const { data, error } = await supabase
      .from('api_webhook_logs')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async deactivateWebhook(webhookId: string): Promise<void> {
    const { error } = await supabase
      .from('api_webhooks')
      .update({ is_active: false })
      .eq('id', webhookId);

    if (error) throw error;
  }

  // Webhook Processing
  async triggerWebhook(
    tenantId: string,
    event: string,
    payload: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.rpc('process_webhook', {
      p_tenant_id: tenantId,
      p_event: event,
      p_payload: payload,
    });

    if (error) throw error;
  }
}

export const apiService = new APIService(); 