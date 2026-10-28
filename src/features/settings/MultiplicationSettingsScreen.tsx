import { useState } from 'react';
import type { TaskConfig } from '../trainer/types';

interface Props {
  onStart: (config: TaskConfig) => void;
  onBack: () => void;
}

export function MultiplicationSettingsScreen({ onStart, onBack }: Props) {
  const [selectedDigits, setSelectedDigits] = useState<number[]>([2, 3, 4, 5]);

  const toggleDigit = (digit: number) => {
    setSelectedDigits((prev) =>
      prev.includes(digit) ? prev.filter((d) => d !== digit) : [...prev, digit]
    );
  };

  const handleStart = () => {
    if (selectedDigits.length === 0) {
      alert("Выберите хотя бы одну цифру!");
      return;
    }

    // Формируем конфиг для таблицы умножения
    const config: TaskConfig = {
      operations: ['mul'], // Только умножение
      digitPairs: [[1, 1]], // Числа от 2 до 9 (мы переопределим это в движке)
      numberType: 'int',
      signType: 'positive',
      taskCount: 20, // Пока поставим 20 примеров
      operandCount: 2,
      deliveryType: 'classic',
      // Передаем выбранные цифры через кастомное поле (нужно будет добавить в тип)
      multiplicationDigits: selectedDigits 
    };

    onStart(config);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Таблица умножения</h2>
        <button onClick={onBack} className="text-blue-600 text-sm hover:underline">
          ← Назад
        </button>
      </div>

      <p className="mb-4 text-gray-600">Выберите цифры, на которые хотите тренироваться:</p>
      
      <div className="flex gap-3 mb-8 justify-center flex-wrap">
        {[2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
          const isSelected = selectedDigits.includes(digit);
          return (
            <button
              key={digit}
              onClick={() => toggleDigit(digit)}
              className={`w-12 h-12 rounded-full text-lg font-bold border-2 transition-colors flex items-center justify-center ${
                isSelected
                  ? 'bg-green-100 border-green-500 text-green-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {digit}
            </button>
          );
        })}
      </div>

      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
          onClick={handleStart}
        >
          Свободный режим
        </button>
        {/* Кнопку Выживание добавим позже, когда сделаем саму логику выживания */}
        <button
          className="border-2 border-red-600 text-red-600 px-6 py-2 rounded hover:bg-red-50 w-full font-medium"
          onClick={() => {
            if (selectedDigits.length === 0) {
              alert("Выберите хотя бы одну цифру!");
              return;
            }
            const config: TaskConfig = {
              operations: ['mul'],
              digitPairs: [[1, 1]],
              numberType: 'int',
              signType: 'positive',
              taskCount: 999, // Бесконечные примеры
              operandCount: 2,
              deliveryType: 'classic',
              multiplicationDigits: selectedDigits,
              failOnError: true // <--- ВЫЛЕТ ПРИ ОШИБКЕ
            };
            onStart(config);
          }}
        >
          Выживание
        </button>
      </div>
    </div>
  );
}