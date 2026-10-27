import { useState, useEffect, useRef } from 'react';
import type { Task, TaskConfig, SessionResult, TaskResult } from './types';
import { generateSession } from './taskEngine';

interface Props {
  config: TaskConfig;
  onFinish: (result: SessionResult) => void;
}

export function TrainerScreen({ config, onFinish }: Props) {
  const [tasks] = useState<Task[]>(() => generateSession(config));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  
  const [history, setHistory] = useState<TaskResult[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [isLocked, setIsLocked] = useState(false);

  const [startTime] = useState(() => Date.now());
  
  // Состояние для таймера (в миллисекундах)
  const [timeLeft, setTimeLeft] = useState<number | null>(
    config.timeLimitMs ? (config.timeLimitMs >= 10000 ? config.timeLimitMs : config.timeLimitMs) : null
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const current = tasks[index];

  // Таймер
  useEffect(() => {
    if (timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        const next = prev - 100;
        
        if (next <= 0) {
          clearInterval(interval);
          // Время вышло
          if (!isLocked) {
             if (config.timeLimitMs && config.timeLimitMs < 10000) {
                // Это был таймер на пример (Выживание) -> приравниваем к ошибке
                submitAnswer(''); // Отправляем пустой ответ
             } else {
                // Это был общий таймер (Испытание) -> завершаем сессию
                handleFinish(correctCount, [...history]);
             }
          }
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [timeLeft, isLocked, correctCount, history]); // Зависимости для актуальности данных

  useEffect(() => {
    inputRef.current?.focus();
  }, [index]);

  // Вспомогательная функция для завершения сессии
  const handleFinish = (finalCorrect: number, finalHistory: TaskResult[]) => {
    const totalTimeMs = Date.now() - startTime;
    onFinish({
      config,
      totalTasks: finalHistory.length,
      correctCount: finalCorrect,
      totalTimeMs,
      history: finalHistory
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    
    const val = e.target.value;
    setInput(val);

    const digitsTyped = val.replace(/[^0-9]/g, '').length;
    const correctDigits = Math.abs(current.answer).toString().length;

    if (digitsTyped === correctDigits && val !== '' && val !== '-') {
      submitAnswer(val);
    }
  };

  const submitAnswer = (rawInput: string) => {
    if (isLocked) return;
    setIsLocked(true);
    
    // Если ответ пустой (вышло время), это ошибка
    const isTimeout = rawInput === '';
    const parsed = isTimeout ? NaN : parseFloat(rawInput.replace(',', '.'));
    const isCorrect = !isTimeout && !isNaN(parsed) && Math.abs(parsed - current.answer) < 0.001;
    
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    const taskResult: TaskResult = {
      expression: current.expression,
      correctAnswer: current.answer,
      userAnswer: isNaN(parsed) ? null : parsed,
      isCorrect: isCorrect
    };
    const newHistory = [...history, taskResult];

    setFeedback(isCorrect ? 'correct' : 'wrong');

    const delay = isCorrect ? 400 : 1200;

    setTimeout(() => {
      const shouldFailEarly = !isCorrect && config.failOnError;
      const isLastTask = index + 1 >= tasks.length;

      if (isLastTask || shouldFailEarly) {
        handleFinish(newCorrect, newHistory);
      } else {
        setCorrectCount(newCorrect);
        setHistory(newHistory);
        setIndex(index + 1);
        setInput('');
        setFeedback('none');
        setIsLocked(false);
        
        // Если это режим "Выживание", сбрасываем таймер на следующий пример
        if (config.timeLimitMs && config.timeLimitMs < 10000) {
          setTimeLeft(config.timeLimitMs);
        }
      }
    }, delay);
  };

  const bgColor = feedback === 'correct' ? 'bg-green-100' : feedback === 'wrong' ? 'bg-red-100' : 'bg-white';

  // Форматирование времени для отображения
  const formatTime = (ms: number) => {
    const secs = Math.ceil(ms / 1000);
    return `${secs} сек`;
  };

  return (
    <div className={`p-8 rounded-xl shadow-sm border-2 transition-colors duration-200 ${bgColor} ${feedback === 'none' ? 'border-gray-100' : feedback === 'correct' ? 'border-green-500' : 'border-red-500'}`}>
      
      {/* Шапка тренажера: счетчик и таймер */}
      <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
        <div>
          {config.taskCount < 999 ? `${index + 1} / ${tasks.length}` : `Решено: ${index + 1}`}
        </div>
        {timeLeft !== null && (
          <div className={`font-bold ${timeLeft < 5000 && config.timeLimitMs && config.timeLimitMs >= 10000 ? 'text-red-600' : ''}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="text-4xl font-bold mb-8 text-center">
        {current.deliveryType === 'window' ? current.maskedExpression : current.expression} = ?
      </div>

      {feedback === 'wrong' && (
        <div className="text-center text-red-600 font-bold mb-4">
          {isLocked && input === '' ? 'Время вышло! ' : ''}
          Правильный ответ: {current.answer}
        </div>
      )}

      <div className="flex justify-center">
        {(current.deliveryType === 'classic' || current.deliveryType === 'window') && (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            className={`border-2 rounded px-4 py-2 text-xl w-48 text-center outline-none transition-colors ${
              feedback === 'correct' ? 'border-green-500 bg-green-50' :
              feedback === 'wrong' ? 'border-red-500 bg-red-50' : 'border-gray-300 focus:border-blue-500'
            }`}
            value={input}
            onChange={handleInputChange}
            disabled={isLocked}
            placeholder="Ответ"
          />
        )}

        {current.deliveryType === 'test' && current.options && (
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {current.options.map((opt, i) => (
              <button
                key={i}
                disabled={isLocked}
                onClick={() => submitAnswer(opt.toString())}
                className="border-2 border-gray-300 rounded py-3 text-xl font-medium hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}