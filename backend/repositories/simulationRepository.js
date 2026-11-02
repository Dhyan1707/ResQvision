import { supabaseAdmin } from '../config/supabase.js';

export const simulationRepository = {
  /**
   * Create or start a simulation session
   */
  async createSimulation(data) {
    const { data: record, error } = await supabaseAdmin
      .from('simulations')
      .insert([
        {
          blueprint_id: data.blueprint_id || null,
          user_id: data.user_id || null,
          title: data.title || 'Simulation Run',
          status: data.status || 'configured',
          current_floor: data.current_floor ?? 0,
          active_fires: data.active_fires || [],
          victim_count: data.victim_count || 1,
          algorithm: data.algorithm || 'A*',
          evacuation_successful: data.evacuation_successful || false,
          duration_seconds: data.duration_seconds || 0.0,
          risk_level: data.risk_level || 'LOW',
          metadata: data.metadata || {}
        }
      ])
      .select('*')
      .single();

    if (error) throw error;
    return record;
  },

  /**
   * Find simulation by ID
   */
  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('simulations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Update simulation state
   */
  async updateSimulation(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('simulations')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * List simulations with optional filters
   */
  async findAll({ status, userId, blueprintId, limit = 20, offset = 0 } = {}) {
    let query = supabaseAdmin
      .from('simulations')
      .select('*, blueprints(id, title, building_type)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (userId) query = query.eq('user_id', userId);
    if (blueprintId) query = query.eq('blueprint_id', blueprintId);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { simulations: data || [], total: count || 0 };
  },

  /**
   * Count total simulations
   */
  async countAll() {
    const { count, error } = await supabaseAdmin
      .from('simulations')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  },

  /**
   * Count completed simulations
   */
  async countCompleted() {
    const { count, error } = await supabaseAdmin
      .from('simulations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    if (error) throw error;
    return count || 0;
  }
};

