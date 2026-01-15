import { query } from '../config/database';
import { Calculation, Operation } from '../types';

export const CalculationModel = {
  async findById(id: number): Promise<Calculation | null> {
    const result = await query('SELECT * FROM calculations WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findAllRoots(): Promise<Calculation[]> {
    const result = await query(
      'SELECT * FROM calculations WHERE parent_id IS NULL ORDER BY created_at DESC'
    );
    return result.rows;
  },

  async findChildren(parentId: number): Promise<Calculation[]> {
    const result = await query(
      'SELECT * FROM calculations WHERE parent_id = $1 ORDER BY created_at ASC',
      [parentId]
    );
    return result.rows;
  },

  async findAllWithUsers(): Promise<(Calculation & { username: string })[]> {
    const result = await query(`
      SELECT c.*, u.username
      FROM calculations c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at ASC
    `);
    return result.rows;
  },

  async create(
    userId: number,
    value: number,
    parentId: number | null = null,
    operation: Operation | null = null,
    operand: number | null = null
  ): Promise<Calculation> {
    const result = await query(
      `INSERT INTO calculations (user_id, parent_id, value, operation, operand)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, parentId, value, operation, operand]
    );
    return result.rows[0];
  },

  async getTreeFromRoot(rootId: number): Promise<(Calculation & { username: string })[]> {
    const result = await query(`
      WITH RECURSIVE tree AS (
        SELECT c.*, u.username, 0 as depth
        FROM calculations c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1

        UNION ALL

        SELECT c.*, u.username, t.depth + 1
        FROM calculations c
        JOIN users u ON c.user_id = u.id
        JOIN tree t ON c.parent_id = t.id
      )
      SELECT * FROM tree ORDER BY depth, created_at ASC
    `, [rootId]);
    return result.rows;
  }
};
