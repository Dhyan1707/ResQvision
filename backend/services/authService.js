import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/userRepository.js';
import { generateToken } from '../utils/jwt.js';

export const authService = {
  /**
   * Register a new user account
   */
  async register({ name, email, password, role = 'user' }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 400;
      throw error;
    }

    // Hash password with 10 salt rounds
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await userRepository.createUser({
      name,
      email,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user',
      isActive: true
    });

    const token = generateToken(newUser);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at
      },
      token
    };
  },

  /**
   * Login user and issue JWT
   */
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.is_active) {
      const error = new Error('This user account has been deactivated. Please contact an administrator.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at
      },
      token
    };
  },

  /**
   * Get user profile details by ID
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },

  /**
   * Update user profile details
   */
  async updateProfile(userId, { name, password }) {
    const updateData = {};
    if (name) updateData.name = name;

    if (password) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await userRepository.updateUser(userId, updateData);
    return updatedUser;
  }
};
