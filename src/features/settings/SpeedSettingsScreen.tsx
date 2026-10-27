import { useState } from 'react';
import type { TaskConfig } from '../trainer/types';
import { LEVELS } from '../trainer/levels';

interface Props {
  onStart: (config: TaskConfig) => void;
  onBack: () => void;
}

export function SpeedSettingsScreen({ onStart, onBack }: Props) {
  const [level, setLevel] = useState<number>(1);
  
  // Для режима "На скорость" мы жестко фиксируем 20 примеров и вылет при ошибке
  const config = { ...LEVELS[level], taskCount: 20, failOnError: true };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">На скорость</h2>
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">
          ← Назад
        </button>
      </div>

      <div className="mb-6">
        <label className="block font-medium mb-2">Выберите уровень (1-9)</label>
        <select
          className="border-2 border-gray-300 rounded p-2 w-full outline-none focus:border-blue-500"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        >
          {Object.entries(LEVELS).map(([lvl, conf]) => (
            <option key={lvl} value={lvl}>
              Уровень {lvl} ({conf.operandCount} перем., {conf.digitPairs.map(p => p.join(',')).join(' | ')})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm">
        <p className="font-bold mb-1">Правила режима:</p>
        <ul className="list-disc pl-5">
          <li>20 примеров подряд.</li>
          <li>Первая же ошибка завершает тренировку.</li>
          <li>Результат засчитывается только при полном прохождении.</li>
        </ul>
      </div>

      <button
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full font-medium text-lg"
        onClick={() => onStart(config)}
      >
        Начать испытание
      </button>
    </div>
  );
}