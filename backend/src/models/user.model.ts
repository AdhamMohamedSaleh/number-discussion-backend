import { query } from '../config/database';
import { User } from '../types';

export const UserModel = {
  async findById(id: number): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByUsername(username: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
  },

  async create(username: string, passwordHash: string): Promise<User> {
    const result = await query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *',
      [username, passwordHash]
    );
    return result.rows[0];
  },

  async exists(username: string): Promise<boolean> {
    const result = await query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)',
      [username]
    );
    return result.rows[0].exists;
  }
};
