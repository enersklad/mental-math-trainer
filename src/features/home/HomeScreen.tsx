import type { SessionResult } from '../trainer/types';

interface Props {
  onSelectMode: (mode: string) => void;
  sessions: SessionResult[];
}

const MODES = [
  { id: 'speed', label: 'НА СКОРОСТЬ' },
  { id: 'free', label: 'СВОБОДНЫЙ РЕЖИМ' },
  { id: 'test', label: 'ИСПЫТАНИЕ' },
  { id: 'survival', label: 'ВЫЖИВАНИЕ' },
  { id: 'chain', label: 'ЦЕПОЧКА' },
  { id: 'multiplication', label: 'ТАБЛИЦА УМНОЖЕНИЯ' },
];

export function HomeScreen({ onSelectMode, sessions }: Props) {
  
  // Вспомогательная функция для поиска лучшего результата
  const getRecord = (modeId: string): string | null => {
    if (sessions.length === 0) return null;

    // Фильтруем сессии по режиму (определяем режим по параметрам конфига)
    const modeSessions = sessions.filter(s => {
      if (modeId === 'speed') return s.config.failOnError && !s.config.timeLimitMs;
      if (modeId === 'survival') return s.config.timeLimitMs === 5000;
      if (modeId === 'test') return s.config.timeLimitMs === 60000;
      if (modeId === 'chain') return s.config.chainLength !== undefined;
      if (modeId === 'multiplication') return s.config.multiplicationDigits !== undefined;
      if (modeId === 'free') return !s.config.failOnError && !s.config.timeLimitMs && !s.config.chainLength && !s.config.multiplicationDigits;
      return false;
    });

    if (modeSessions.length === 0) return null;

    // Логика поиска лучшего результата зависит от режима
    if (modeId === 'speed') {
      // В скорости лучший результат - минимальное время (при 20/20)
      const best = modeSessions
        .filter(s => s.correctCount === s.totalTasks)
        .sort((a, b) => a.totalTimeMs - b.totalTimeMs)[0];
      return best ? `${(best.totalTimeMs / 1000).toFixed(1)} сек` : null;
    }

    if (modeId === 'survival') {
      // В выживании - максимальное количество правильных ответов
      const best = Math.max(...modeSessions.map(s => s.correctCount));
      return `${best} прим.`;
    }

    if (modeId === 'test') {
      // В испытании - максимальное количество правильных ответов
      const best = Math.max(...modeSessions.map(s => s.correctCount));
      return `${best} прим.`;
    }

    if (modeId === 'chain') {
      // В цепочке - максимальная длина стрика
      const best = Math.max(...modeSessions.map(s => s.correctCount));
      return `${best} цеп.`;
    }

    // Для свободного режима и таблицы умножения покажем просто лучшую точность
    const bestAcc = Math.max(...modeSessions.map(s => (s.correctCount / s.totalTasks) * 100));
    return `${bestAcc.toFixed(0)}%`;
  };

  return (
    <div className="text-center mt-16">
      <h1 className="text-4xl font-bold text-gray-800 mb-16 leading-tight">
        Прокачай свой <br /> устный счёт
      </h1>

      <div className="flex flex-col gap-4">
        {MODES.map((mode) => {
          const record = getRecord(mode.id);
          
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="relative w-full text-center py-4 border-2 border-gray-300 rounded-xl text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition-all bg-white"
            >
              {mode.label}
              
              {/* Выводим рекорд, если он есть */}
              {record && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-normal text-gray-400 bg-gray-50 px-2 py-1 rounded">
                  Рекорд: {record}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}