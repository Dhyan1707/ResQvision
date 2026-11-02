import { supabaseAdmin } from '../config/supabase.js';

export const reportRepository = {
  /**
   * Create simulation report record
   */
  async createReport(reportData) {
    const { data, error } = await supabaseAdmin
      .from('simulation_reports')
      .insert([
        {
          user_id: reportData.user_id,
          blueprint_id: reportData.blueprint_id,
          algorithm_used: reportData.algorithm_used,
          evacuation_time: reportData.evacuation_time,
          total_distance: reportData.total_distance,
          visited_nodes: reportData.visited_nodes,
          benchmark_json: reportData.benchmark_json || {}
        }
      ])
      .select('*, users!simulation_reports_user_id_fkey(id, name, email), blueprints!simulation_reports_blueprint_id_fkey(id, title, building_type)')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Find simulation report by ID
   */
  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('simulation_reports')
      .select('*, users!simulation_reports_user_id_fkey(id, name, email), blueprints!simulation_reports_blueprint_id_fkey(id, title, building_type)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  /**
   * List reports with optional user filtering and pagination
   */
  async findAll({ userId, blueprintId, limit = 20, offset = 0 }) {
    let query = supabaseAdmin
      .from('simulation_reports')
      .select('*, users!simulation_reports_user_id_fkey(id, name, email), blueprints!simulation_reports_blueprint_id_fkey(id, title, building_type)', { count: 'exact' });

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (blueprintId) {
      query = query.eq('blueprint_id', blueprintId);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { reports: data, total: count || 0 };
  },

  /**
   * Delete simulation report by ID
   */
  async deleteReport(id) {
    const { data, error } = await supabaseAdmin
      .from('simulation_reports')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Count total simulation reports
   */
  async countAll() {
    const { count, error } = await supabaseAdmin
      .from('simulation_reports')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
};
