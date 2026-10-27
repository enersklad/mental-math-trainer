import type { TaskConfig } from './types';

export const LEVELS: Record<number, TaskConfig> = {
  1: { operations: ['add', 'sub'], digitPairs: [[1, 1]], numberType: 'int', signType: 'positive', taskCount: 10, operandCount: 2, deliveryType: 'classic' },
  2: { operations: ['add', 'sub'], digitPairs: [[2, 1]], numberType: 'int', signType: 'positive', taskCount: 10, operandCount: 2, deliveryType: 'classic' },
  3: { operations: ['add', 'sub'], digitPairs: [[2, 2]], numberType: 'int', signType: 'positive', taskCount: 10, operandCount: 2, deliveryType: 'classic' },
  4: { operations: ['add', 'sub'], digitPairs: [[2, 1], [1, 1]], numberType: 'int', signType: 'positive', taskCount: 10, operandCount: 3, deliveryType: 'classic' },
  5: { operations: ['add', 'sub'], digitPairs: [[2, 2], [2, 2]], numberType: 'int', signType: 'both', taskCount: 10, operandCount: 3, deliveryType: 'classic' },
  6: { operations: ['add', 'sub', 'mul', 'div'], digitPairs: [[1, 1]], numberType: 'int', signType: 'positive', taskCount: 10, operandCount: 2, deliveryType: 'classic' },
  7: { operations: ['add', 'sub', 'mul', 'div'], digitPairs: [[2, 1]], numberType: 'int', signType: 'positive', taskCount: 10, operandCount: 2, deliveryType: 'classic' },
  8: { operations: ['add', 'sub', 'mul', 'div'], digitPairs: [[2, 1], [1, 1]], numberType: 'int', signType: 'positive', taskCount: 10, operandCount: 3, deliveryType: 'classic' },
  9: { operations: ['add', 'sub', 'mul', 'div'], digitPairs: [[2, 1], [1, 1]], numberType: 'int', signType: 'both', taskCount: 10, operandCount: 3, deliveryType: 'classic' },
};

export const DEFAULT_CONFIG = LEVELS[1];