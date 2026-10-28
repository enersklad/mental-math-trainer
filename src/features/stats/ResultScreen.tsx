import type { SessionResult } from '../trainer/types';

// Функция для правильного склонения слова "цепочка"
function getChainWord(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return 'цепочек';
  }
  if (lastDigit === 1) {
    return 'цепочку';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'цепочки';
  }
  return 'цепочек';
}

interface Props {
  result: SessionResult;
  canLevelUp: boolean;
  onLevelUp: () => void;
  onRestart: () => void;
  onGoHome: () => void;
}

export function ResultScreen({ result, canLevelUp, onLevelUp, onRestart, onGoHome }: Props) {

  // Проверка на режим "Цепочка"
  if (result.config.chainLength) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center mt-10 bg-white rounded-xl shadow-sm border-2 border-gray-100">
        <h1 className="text-3xl font-bold mb-4">Результат</h1>
        <p className="text-xl mb-8">
          Вы верно решили <span className="font-bold text-purple-600">{result.correctCount}</span> {getChainWord(result.correctCount)}.
        </p>
        
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <button
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700"
            onClick={onRestart}
          >
            Попробовать ещё раз
          </button>
          <button
            className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-50"
            onClick={onGoHome}
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  const accuracy = (result.correctCount / result.totalTasks) * 100;
  const avgTime = result.totalTimeMs / result.totalTasks / 1000;

  // Фильтруем только те задания, где была ошибка
  const mistakes = result.history?.filter((task) => !task.isCorrect) || [];

  // Игра провалена, только если была ошибка (решено меньше, чем всего) и включен режим "до первой ошибки"
  const isFailedEarly = result.config.failOnError && result.correctCount < result.totalTasks;

  if (isFailedEarly) {
    // Если это Выживание, то проигрыш — это нормальное завершение
    const isSurvival = result.config.timeLimitMs && result.config.timeLimitMs < 10000;
    
    return (
      <div className="max-w-xl mx-auto p-6 text-center mt-10 bg-white rounded-xl shadow-sm border-2 border-gray-100">
        <h1 className={`text-3xl font-bold mb-4 ${isSurvival ? 'text-gray-800' : 'text-red-600'}`}>
          {isSurvival ? 'Результат' : 'Испытание провалено'}
        </h1>
        
        <p className="text-lg mb-6">
          {isSurvival 
            ? `Ваш результат: ${result.correctCount} примеров` 
            : `Вы решили правильно ${result.correctCount} из ${result.totalTasks} примеров.`
          }
        </p>
        
        {!isSurvival && (
          <p className="text-gray-500 mb-8">
            В режиме «На скорость» нельзя допускать ошибок.
          </p>
        )}
        
        <div className="flex flex-col gap-4 max-w-xs mx-auto">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            onClick={onRestart}
          >
            Попробовать ещё раз
          </button>
          <button
            className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-50"
            onClick={onGoHome}
          >
            На главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-6">Результат</h1>
      
      <div className="space-y-2 text-lg mb-8">
        <p>Правильно: {result.correctCount} из {result.totalTasks}</p>
        <p>Точность: {accuracy.toFixed(1)}%</p>
        <p>Среднее время: {avgTime.toFixed(1)} сек</p>
      </div>

      {/* Блок с ошибками */}
      {mistakes.length > 0 && (
        <div className="mb-8 border rounded overflow-hidden">
          <h3 className="bg-red-50 text-red-700 font-bold p-3 text-left">
            Работа над ошибками:
          </h3>
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-2">Пример</th>
                <th className="p-2">Ваш ответ</th>
                <th className="p-2">Правильный</th>
              </tr>
            </thead>
            <tbody>
              {mistakes.map((mistake, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="p-2">{mistake.expression} =</td>
                  <td className="p-2 text-red-500 line-through">
                    {mistake.userAnswer !== null ? mistake.userAnswer : '—'}
                  </td>
                  <td className="p-2 text-green-600 font-bold">
                    {mistake.correctAnswer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Блок предложения повышения уровня */}
      {canLevelUp && (
        <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg mb-8">
          {/* ... (оставляем код, который был) ... */}
          <h2 className="text-xl font-bold text-green-700 mb-2">Отличная работа! 🎉</h2>
          <p className="text-green-800 mb-4">Вы показываете отличную скорость и точность. Готовы перейти на следующий уровень сложности?</p>
          <div className="flex gap-4 justify-center">
            <button
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              onClick={onLevelUp}
            >
              Да, повысить уровень
            </button>
            <button
              className="border-2 border-green-600 text-green-700 px-6 py-2 rounded hover:bg-green-100"
              onClick={onRestart}
            >
              Нет, остаться здесь
            </button>
          </div>
        </div>
      )}

      {!canLevelUp && (
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={onRestart}
        >
          Ещё раз
        </button>
      )}
    </div>
  );
}