import { CalculationModel } from '../models/calculation.model';
import { CalculationResponse, CalculationTreeNode, Operation, Calculation } from '../types';

export const CalculationsService = {
  async getAllTrees(): Promise<CalculationTreeNode[]> {
    const allCalcs = await CalculationModel.findAllWithUsers();
    return this.buildTrees(allCalcs);
  },

  async getTree(id: number): Promise<CalculationTreeNode | null> {
    const calc = await CalculationModel.findById(id);
    if (!calc) return null;

    // Find the root of this calculation's tree
    let rootId = calc.id;
    let current = calc;
    while (current.parent_id !== null) {
      const parent = await CalculationModel.findById(current.parent_id);
      if (!parent) break;
      current = parent;
      rootId = current.id;
    }

    const treeCalcs = await CalculationModel.getTreeFromRoot(rootId);
    const trees = this.buildTrees(treeCalcs);
    return trees[0] || null;
  },

  async createStartingNumber(userId: number, value: number): Promise<CalculationResponse> {
    const calc = await CalculationModel.create(userId, value);
    const allCalcs = await CalculationModel.findAllWithUsers();
    const calcWithUser = allCalcs.find(c => c.id === calc.id);

    return this.toResponse(calcWithUser || { ...calc, username: '' });
  },

  async addOperation(
    userId: number,
    parentId: number,
    operation: Operation,
    operand: number
  ): Promise<CalculationResponse> {
    const parent = await CalculationModel.findById(parentId);
    if (!parent) {
      throw new Error('Parent calculation not found');
    }

    if (operation === '/' && operand === 0) {
      throw new Error('Division by zero is not allowed');
    }

    const parentValue = parseFloat(parent.value);
    let newValue: number;

    switch (operation) {
      case '+':
        newValue = parentValue + operand;
        break;
      case '-':
        newValue = parentValue - operand;
        break;
      case '*':
        newValue = parentValue * operand;
        break;
      case '/':
        newValue = parentValue / operand;
        break;
      default:
        throw new Error('Invalid operation');
    }

    const calc = await CalculationModel.create(userId, newValue, parentId, operation, operand);
    const allCalcs = await CalculationModel.findAllWithUsers();
    const calcWithUser = allCalcs.find(c => c.id === calc.id);

    return this.toResponse(calcWithUser || { ...calc, username: '' });
  },

  buildTrees(calculations: (Calculation & { username: string })[]): CalculationTreeNode[] {
    const nodeMap = new Map<number, CalculationTreeNode>();

    // Create nodes for all calculations
    for (const calc of calculations) {
      nodeMap.set(calc.id, {
        ...this.toResponse(calc),
        children: []
      });
    }

    const roots: CalculationTreeNode[] = [];

    // Build tree structure
    for (const calc of calculations) {
      const node = nodeMap.get(calc.id)!;
      if (calc.parent_id === null) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(calc.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    }

    return roots;
  },

  toResponse(calc: Calculation & { username: string }): CalculationResponse {
    return {
      id: calc.id,
      userId: calc.user_id,
      username: calc.username,
      parentId: calc.parent_id,
      value: parseFloat(calc.value),
      operation: calc.operation,
      operand: calc.operand ? parseFloat(calc.operand) : null,
      createdAt: calc.created_at
    };
  }
};
