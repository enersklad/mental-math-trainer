import { useState, useEffect } from 'react';
import type { TaskConfig, SessionResult } from './types';
import { generateChain } from './taskEngine';

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
  config: TaskConfig;
  onFinish: (result: SessionResult) => void;
  onGoHome: () => void;
}

export function ChainTrainerScreen({ config, onFinish, onGoHome }: Props) {
  // Состояние текущего "уровня" (сколько цепочек пройдено подряд)
  const [level, setLevel] = useState(1);
  
  // Состояние для текущей цепочки
  const [chain, setChain] = useState(() => generateChain(config.chainLength || 5));
  
  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase] = useState<'showing' | 'input' | 'success' | 'fail'>('showing');
  
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(() => Date.now());

  // Вычисляем текущее время показа (каждый уровень уменьшает время на 10%)
  const baseTime = config.chainStartTime || 2000;
  const speedUpFactor = Math.pow(1 - (config.chainSpeedUp || 10) / 100, level - 1);
  const currentDelay = Math.max(baseTime * speedUpFactor, 300); // Ограничиваем минимум 300мс

  // Логика показа цифр
  useEffect(() => {
    if (phase !== 'showing') return;

    if (displayIndex >= chain.sequence.length) {
      setPhase('input');
      return;
    }

    const timer = setTimeout(() => {
      setDisplayIndex((prev) => prev + 1);
    }, currentDelay);

    return () => clearTimeout(timer);
  }, [displayIndex, phase, chain.sequence.length, currentDelay]);

  // Обработка ответа
  const handleSubmit = () => {
    const parsed = parseFloat(input.replace(',', '.'));
    const isCorrect = !isNaN(parsed) && Math.abs(parsed - chain.answer) < 0.001;
    
    if (isCorrect) {
      setPhase('success');
    } else {
      setPhase('fail');
      // Если ошиблись, сохраняем результат (пройдено level - 1 цепочек)
      const totalTimeMs = Date.now() - startTime;
      onFinish({
        config,
        totalTasks: 1,
        correctCount: level - 1, // Стрик
        totalTimeMs,
        history: [{
          expression: chain.sequence.join(' '),
          correctAnswer: chain.answer,
          userAnswer: isNaN(parsed) ? null : parsed,
          isCorrect: false
        }]
      });
    }
  };

  // Переход к следующей цепочке
  const handleContinue = () => {
    setLevel(level + 1);
    setChain(generateChain(config.chainLength || 5));
    setDisplayIndex(0);
    setInput('');
    setPhase('showing');
    setStartTime(Date.now());
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border-2 border-gray-100 text-center min-h-[300px] flex flex-col justify-center">
      
      {phase === 'showing' && (
        <div className="text-6xl font-bold text-purple-600 transition-all duration-200">
          {displayIndex < chain.sequence.length ? chain.sequence[displayIndex] : ''}
        </div>
      )}

      {phase === 'input' && (
        <div>
          <p className="text-gray-500 mb-4">Введите итоговый ответ:</p>
          <input
            type="text"
            inputMode="numeric"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="border-2 border-gray-300 rounded px-4 py-2 text-2xl w-32 text-center outline-none focus:border-purple-500 mb-6"
            autoFocus
          />
          <br />
          <button 
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-8 py-2 rounded-lg hover:bg-purple-700"
          >
            Ответить
          </button>
        </div>
      )}

      {phase === 'success' && (
        <div>
          <div className="text-2xl font-bold text-green-600 mb-2">Верно!</div>
          <p className="text-gray-600 mb-6">Вы верно решили {level} {getChainWord(level)}.</p>
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={handleContinue}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-medium text-lg w-full max-w-xs"
            >
              Продолжить
            </button>
            <button
              onClick={onGoHome}
              className="text-gray-500 hover:text-gray-700 text-sm mt-2"
            >
              На главную
            </button>
          </div>
        </div>
      )}

      {phase === 'fail' && (
        <div>
          <div className="text-2xl font-bold text-red-600 mb-2">Ошибка!</div>
          <p className="text-gray-600 mb-6">Правильный ответ: {chain.answer}</p>
          <button
            onClick={onGoHome}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium text-lg w-full max-w-xs"
          >
            На главную
          </button>
        </div>
      )}

    </div>
  );
}