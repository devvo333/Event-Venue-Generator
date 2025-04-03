import { supabase } from '../lib/supabase';

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  logo_url?: string;
  theme?: Record<string, any>;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TenantUser {
  id: string;
  tenant_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'manager' | 'member';
  permissions?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface TenantTeam {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'member';
  created_at: string;
  updated_at: string;
}

export interface SSOProvider {
  id: string;
  tenant_id: string;
  provider: 'google' | 'azure' | 'okta' | 'custom';
  client_id: string;
  client_secret: string;
  config?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

class TenantService {
  // Tenant Management
  async initializeTenant(name: string, domain: string, ownerId: string): Promise<string> {
    const { data, error } = await supabase.rpc('initialize_tenant', {
      p_name: name,
      p_domain: domain,
      p_owner_id: ownerId,
    });

    if (error) throw error;
    return data;
  }

  async getTenant(tenantId: string): Promise<Tenant> {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateTenantSettings(tenantId: string, settings: Record<string, any>): Promise<void> {
    const { error } = await supabase.rpc('update_tenant_settings', {
      p_tenant_id: tenantId,
      p_settings: settings,
    });

    if (error) throw error;
  }

  // User Management
  async getTenantUsers(tenantId: string): Promise<TenantUser[]> {
    const { data, error } = await supabase
      .from('tenant_users')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data;
  }

  async addTenantUser(tenantId: string, userId: string, role: TenantUser['role']): Promise<TenantUser> {
    const { data, error } = await supabase
      .from('tenant_users')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserPermissions(tenantId: string, userId: string, permissions: Record<string, boolean>): Promise<void> {
    const { error } = await supabase
      .from('tenant_users')
      .update({ permissions })
      .eq('tenant_id', tenantId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  // Team Management
  async getTeams(tenantId: string): Promise<TenantTeam[]> {
    const { data, error } = await supabase
      .from('tenant_teams')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data;
  }

  async createTeam(tenantId: string, name: string, description?: string): Promise<TenantTeam> {
    const { data, error } = await supabase
      .from('tenant_teams')
      .insert({
        tenant_id: tenantId,
        name,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async addTeamMember(teamId: string, userId: string, role: TeamMember['role']): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: userId,
        role,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // SSO Management
  async getSSOProviders(tenantId: string): Promise<SSOProvider[]> {
    const { data, error } = await supabase
      .from('sso_providers')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw error;
    return data;
  }

  async addSSOProvider(tenantId: string, provider: SSOProvider['provider'], config: Record<string, any>): Promise<SSOProvider> {
    const { data, error } = await supabase
      .from('sso_providers')
      .insert({
        tenant_id: tenantId,
        provider,
        client_id: config.client_id,
        client_secret: config.client_secret,
        config: config,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Permission Checking
  async checkPermission(tenantId: string, userId: string, permission: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_tenant_permission', {
      p_tenant_id: tenantId,
      p_user_id: userId,
      p_permission: permission,
    });

    if (error) throw error;
    return data;
  }

  // Theme Management
  async getTenantTheme(tenantId: string): Promise<Record<string, any>> {
    const { data, error } = await supabase.rpc('get_tenant_theme', {
      p_tenant_id: tenantId,
    });

    if (error) throw error;
    return data;
  }
}

export const tenantService = new TenantService(); 