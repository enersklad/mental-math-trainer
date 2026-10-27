import { useState } from 'react';
import type { TaskConfig } from '../trainer/types';
import { LEVELS } from '../trainer/levels';

interface Props {
  onStart: (config: TaskConfig) => void;
  onBack: () => void;
}

export function SurvivalSettingsScreen({ onStart, onBack }: Props) {
  const [level, setLevel] = useState<number>(1);
  
  // Лимит 5 секунд на пример, 999 примеров (до первой ошибки/просрочки)
  const config = { ...LEVELS[level], taskCount: 999, timeLimitMs: 5000, failOnError: true };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Выживание</h2>
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">← Назад</button>
      </div>
      {/* Селект уровня */}
      <div className="mb-6">
        <label className="block font-medium mb-2">Выберите уровень (1-9)</label>
        <select
          className="border-2 border-gray-300 rounded p-2 w-full outline-none focus:border-blue-500"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
        >
          {Object.entries(LEVELS).map(([lvl, conf]) => (
            <option key={lvl} value={lvl}>Уровень {lvl} ({conf.operandCount} перем.)</option>
          ))}
        </select>
      </div>

      <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6 text-sm">
        <p className="font-bold mb-1">Правила режима:</p>
        <ul className="list-disc pl-5">
          <li>У вас есть ровно 5 секунд на каждый пример.</li>
          <li>Ошибка или просрочка времени завершает тренировку.</li>
        </ul>
      </div>

      <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 w-full font-medium text-lg" onClick={() => onStart(config)}>
        Начать выживание
      </button>
    </div>
  );
}