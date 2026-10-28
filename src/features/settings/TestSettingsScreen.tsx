import { useState } from 'react';
import type { TaskConfig, DeliveryType } from '../trainer/types';
import { LEVELS } from '../trainer/levels';

interface Props {
  onStart: (config: TaskConfig) => void;
  onBack: () => void;
}

export function TestSettingsScreen({ onStart, onBack }: Props) {
  const [level, setLevel] = useState<number>(1);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('classic');
  
  // Устанавливаем лимит времени 60 секунд (60000 мс) и бесконечные примеры (ставим 999)
  const config = { ...LEVELS[level], taskCount: 999, timeLimitMs: 60000, deliveryType };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Испытание</h2>
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">
          ← Назад
        </button>
      </div>

      <div className="mb-4">
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

      <div className="mb-6">
        <label className="block font-medium mb-2">Тип подачи заданий</label>
        <select
          className="border-2 border-gray-300 rounded p-2 w-full outline-none focus:border-blue-500"
          value={deliveryType}
          onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
        >
          <option value="classic">Классическая (поле ввода)</option>
          <option value="test">Тестовая (4 варианта)</option>
          <option value="window">Окошки (найти неизвестное)</option>
          <option value="mixed">Вперемешку</option>
        </select>
      </div>

      <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg mb-6 text-sm">
        <p className="font-bold mb-1">Правила режима:</p>
        <ul className="list-disc pl-5">
          <li>У вас есть 60 секунд.</li>
          <li>Решайте как можно больше примеров.</li>
          <li>Ошибки не прерывают испытание.</li>
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