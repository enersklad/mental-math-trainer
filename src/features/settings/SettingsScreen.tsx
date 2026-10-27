import { useState } from 'react';
import type { TaskConfig, Operation } from '../trainer/types';
import { LEVELS } from '../trainer/levels';

interface Props {
  initialConfig: TaskConfig;
  onStart: (config: TaskConfig) => void;
}

const OPERATIONS: { key: Operation; label: string }[] = [
  { key: 'add', label: 'Сложение' },
  { key: 'sub', label: 'Вычитание' },
  { key: 'mul', label: 'Умножение' },
  { key: 'div', label: 'Деление' },
];

export function SettingsScreen({ onStart }: Props) {
  const [level, setLevel] = useState<number>(1);
  const currentConfig = LEVELS[level];

  return (
    <div className="w-full">
      <div className="mb-6">
        <label className="block font-medium mb-2">Выберите уровень (1-9)</label>
        <select
          className="border-2 border-gray-300 rounded p-2 w-full outline-none focus:border-blue-500"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        >
          {Object.entries(LEVELS).map(([lvl, config]) => (
            <option key={lvl} value={lvl}>
              Уровень {lvl} ({config.operandCount} перем., {config.digitPairs.map(p => p.join(',')).join(' | ')}, {config.signType === 'both' ? 'с отриц.' : 'полож.'})
            </option>
          ))}
        </select>
      </div>

      {/* Информация о текущем уровне */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-600">
        <p><strong>Операции:</strong> {currentConfig.operations.join(', ')}</p>
        <p><strong>Количество переменных:</strong> {currentConfig.operandCount}</p>
        <p><strong>Разрядность:</strong> {currentConfig.digitPairs.map(p => p.join(',')).join(' -> ')}</p>
      </div>

      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
          onClick={() => onStart(currentConfig)}
        >
          Начать тренировку
        </button>
        <button
          className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 w-full"
          onClick={() => onStart(currentConfig)}
        >
          Быстрый старт
        </button>
      </div>
    </div>
  );
}