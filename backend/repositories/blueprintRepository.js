import { supabaseAdmin } from '../config/supabase.js';

export const blueprintRepository = {
  /**
   * Create a new blueprint record
   */
  async createBlueprint(blueprintData) {
    const { data, error } = await supabaseAdmin
      .from('blueprints')
      .insert([
        {
          title: blueprintData.title,
          building_type: blueprintData.building_type,
          prompt: blueprintData.prompt,
          blueprint_json: blueprintData.blueprint_json,
          approval_status: blueprintData.approval_status || 'draft',
          created_by: blueprintData.created_by
        }
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Find blueprint by ID
   */
  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('blueprints')
      .select('*, users!blueprints_created_by_fkey(id, name, email)')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  /**
   * Find blueprints with filtering and pagination
   */
  async findAll({ status, createdBy, limit = 20, offset = 0 }) {
    let query = supabaseAdmin
      .from('blueprints')
      .select('*, users!blueprints_created_by_fkey(id, name, email)', { count: 'exact' });

    if (status) {
      query = query.eq('approval_status', status);
    }
    if (createdBy) {
      query = query.eq('created_by', createdBy);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { blueprints: data, total: count || 0 };
  },

  /**
   * Update blueprint details
   */
  async updateBlueprint(id, updateData) {
    const fields = {};
    if (updateData.title !== undefined) fields.title = updateData.title;
    if (updateData.building_type !== undefined) fields.building_type = updateData.building_type;
    if (updateData.prompt !== undefined) fields.prompt = updateData.prompt;
    if (updateData.blueprint_json !== undefined) fields.blueprint_json = updateData.blueprint_json;
    if (updateData.approval_status !== undefined) fields.approval_status = updateData.approval_status;

    const { data, error } = await supabaseAdmin
      .from('blueprints')
      .update(fields)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update approval status
   */
  async updateApprovalStatus(id, approval_status) {
    const { data, error } = await supabaseAdmin
      .from('blueprints')
      .update({ approval_status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete blueprint by ID
   */
  async deleteBlueprint(id) {
    const { data, error } = await supabaseAdmin
      .from('blueprints')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Count total blueprints
   */
  async countAll() {
    const { count, error } = await supabaseAdmin
      .from('blueprints')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
};
