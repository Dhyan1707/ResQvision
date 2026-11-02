import { supabaseAdmin } from '../config/supabase.js';

export const userRepository = {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, is_active, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    return data;
  },

  /**
   * Create new user record
   */
  async createUser(userData) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name: userData.name,
          email: userData.email.toLowerCase(),
          password_hash: userData.passwordHash,
          role: userData.role || 'user',
          is_active: userData.isActive ?? true
        }
      ])
      .select('id, name, email, role, is_active, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile or state
   */
  async updateUser(id, updateData) {
    const fieldsToUpdate = {};
    if (updateData.name !== undefined) fieldsToUpdate.name = updateData.name;
    if (updateData.email !== undefined) fieldsToUpdate.email = updateData.email.toLowerCase();
    if (updateData.passwordHash !== undefined) fieldsToUpdate.password_hash = updateData.passwordHash;
    if (updateData.role !== undefined) fieldsToUpdate.role = updateData.role;
    if (updateData.isActive !== undefined) fieldsToUpdate.is_active = updateData.isActive;

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(fieldsToUpdate)
      .eq('id', id)
      .select('id, name, email, role, is_active, created_at, updated_at')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete user by ID
   */
  async deleteUser(id) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)
      .select('id')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get paginated list of users (Admin)
   */
  async findAll(limit = 20, offset = 0) {
    const { data, error, count } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, is_active, created_at, updated_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { users: data, total: count || 0 };
  },

  /**
   * Count active users
   */
  async countAll() {
    const { count, error } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
};
