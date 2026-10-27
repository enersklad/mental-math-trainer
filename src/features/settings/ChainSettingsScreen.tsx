import type { TaskConfig } from '../trainer/types';

interface Props {
  onStart: (config: TaskConfig) => void;
  onBack: () => void;
}

export function ChainSettingsScreen({ onStart, onBack }: Props) {
  const handleStart = () => {
    // Базовый конфиг для цепочки
    const config: TaskConfig = {
      operations: ['add', 'sub'], // По сути не используется, но нужно для типа
      digitPairs: [[1, 1]],
      numberType: 'int',
      signType: 'positive',
      taskCount: 1, // Одна цепочка за сессию
      operandCount: 5, // Не используется
      deliveryType: 'classic',
      chainLength: 5, // 5 цифр в цепочке
      chainStartTime: 2000, // Начинаем с 2 секунд на цифру
      chainSpeedUp: 10, // Уменьшаем время на 10%
    };
    onStart(config);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Цепочка</h2>
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">← Назад</button>
      </div>

      <div className="bg-purple-50 text-purple-800 p-4 rounded-lg mb-6 text-sm">
        <p className="font-bold mb-1">Правила режима:</p>
        <ul className="list-disc pl-5">
          <li>Вам показывают 5 цифр по очереди (и знаки между ними).</li>
          <li>Вы должны запомнить их и ввести итоговый ответ.</li>
          <li>Время показа каждой цифры сначала составляет 2 секунды, но с каждым новым уровнем (цепочкой) оно уменьшается на 10%.</li>
        </ul>
      </div>

      <button 
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 w-full font-medium text-lg" 
        onClick={handleStart}
      >
        Начать тренировку
      </button>
    </div>
  );
}