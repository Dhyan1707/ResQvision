import { supabaseAdmin } from '../config/supabase.js';

export const activityLogRepository = {
  /**
   * Log an activity event
   */
  async log({ userId = null, action, category = 'system', details = {}, ipAddress = null }) {
    try {
      const { data, error } = await supabaseAdmin
        .from('activity_logs')
        .insert([
          {
            user_id: userId,
            action,
            category,
            details,
            ip_address: ipAddress
          }
        ])
        .select('*')
        .single();

      if (error) {
        console.warn('[ActivityLog] Error saving log to database:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[ActivityLog] Exception logging activity:', err.message);
      return null;
    }
  },

  /**
   * List recent activities
   */
  async findRecent(limit = 20) {
    try {
      const { data, error } = await supabaseAdmin
        .from('activity_logs')
        .select('*, users!activity_logs_user_id_fkey(id, name, email)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (err) {
      return [];
    }
  }
};

