import { supabase } from '../lib/supabase';

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  query: string;
  parameters?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CustomReport {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: string;
  report_id: string;
  schedule_type: 'daily' | 'weekly' | 'monthly';
  schedule_day?: number;
  schedule_time: string;
  recipients: string[];
  last_run_at?: string;
  next_run_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReportExecution {
  id: string;
  report_id: string;
  scheduled_report_id?: string;
  parameters?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: Record<string, any>;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
}

class ReportService {
  // Report Templates
  async getTemplates() {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createTemplate(template: Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('report_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Custom Reports
  async getReports() {
    const { data, error } = await supabase
      .from('custom_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createReport(report: Omit<CustomReport, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('custom_reports')
      .insert(report)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Scheduled Reports
  async getScheduledReports() {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .select('*')
      .order('next_run_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async createScheduledReport(
    scheduledReport: Omit<ScheduledReport, 'id' | 'last_run_at' | 'next_run_at' | 'created_at' | 'updated_at'>
  ) {
    const { data, error } = await supabase
      .from('scheduled_reports')
      .insert(scheduledReport)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Report Execution
  async executeReport(reportId: string, parameters?: Record<string, any>) {
    const { data, error } = await supabase.rpc('execute_report', {
      p_report_id: reportId,
      p_parameters: parameters || {},
    });

    if (error) throw error;
    return data[0];
  }

  async getReportExecutions(reportId: string) {
    const { data, error } = await supabase
      .from('report_executions')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Export
  async exportReport(reportId: string, format: 'csv' | 'json' = 'csv') {
    const { data, error } = await supabase.rpc('export_report_data', {
      p_report_id: reportId,
      p_format: format,
    });

    if (error) throw error;
    return data[0];
  }
}

export const reportService = new ReportService(); 