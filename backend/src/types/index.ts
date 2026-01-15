import { Request } from 'express';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: Date;
}

export interface UserResponse {
  id: number;
  username: string;
  created_at: Date;
}

export type Operation = '+' | '-' | '*' | '/';

export interface Calculation {
  id: number;
  user_id: number;
  parent_id: number | null;
  value: string;
  operation: Operation | null;
  operand: string | null;
  created_at: Date;
}

export interface CalculationResponse {
  id: number;
  userId: number;
  username: string;
  parentId: number | null;
  value: number;
  operation: Operation | null;
  operand: number | null;
  createdAt: Date;
}

export interface CalculationTreeNode extends CalculationResponse {
  children: CalculationTreeNode[];
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
  };
}

export interface RegisterDto {
  username: string;
  password: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface CreateCalculationDto {
  value: number;
}

export interface CreateOperationDto {
  operation: Operation;
  operand: number;
}

export interface JwtPayload {
  id: number;
  username: string;
}
