import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { JwtPayload, UserResponse } from '../types';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

export const AuthService = {
  async register(username: string, password: string): Promise<{ user: UserResponse; token: string }> {
    const exists = await UserModel.exists(username);
    if (exists) {
      throw new Error('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.create(username, passwordHash);

    const token = this.generateToken({ id: user.id, username: user.username });

    return {
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      },
      token
    };
  },

  async login(username: string, password: string): Promise<{ user: UserResponse; token: string }> {
    const user = await UserModel.findByUsername(username);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken({ id: user.id, username: user.username });

    return {
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      },
      token
    };
  },

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN_SECONDS });
  },

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  },

  async getUserById(id: number): Promise<UserResponse | null> {
    const user = await UserModel.findById(id);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      created_at: user.created_at
    };
  }
};
