import type { SessionResult } from '../trainer/types';

interface Props {
  sessions: SessionResult[];
  onBack: () => void;
}

export function StatsScreen({ sessions, onBack }: Props) {
  // Считаем общую статистику
  const totalSessions = sessions.length;
  const totalTasks = sessions.reduce((sum, s) => sum + s.totalTasks, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0);
  const overallAccuracy = totalTasks > 0 ? (totalCorrect / totalTasks) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Статистика</h1>
        <button 
          onClick={onBack}
          className="text-blue-600 hover:underline"
        >
          ← Назад
        </button>
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-500">Пока нет завершённых тренировок.</p>
      ) : (
        <>
          {/* Сводка */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="border p-4 rounded bg-gray-50">
              <div className="text-sm text-gray-500">Всего сессий</div>
              <div className="text-2xl font-bold">{totalSessions}</div>
            </div>
            <div className="border p-4 rounded bg-gray-50">
              <div className="text-sm text-gray-500">Общая точность</div>
              <div className="text-2xl font-bold">{overallAccuracy.toFixed(1)}%</div>
            </div>
          </div>

          {/* Таблица сессий */}
          <div className="border rounded overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 border-b">Сессия</th>
                  <th className="p-3 border-b">Точность</th>
                  <th className="p-3 border-b">Ср. время</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, idx) => {
                  const accuracy = (session.correctCount / session.totalTasks) * 100;
                  const avgTime = session.totalTimeMs / session.totalTasks / 1000;
                  
                  return (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="p-3">#{idx + 1}</td>
                      <td className="p-3">
                        <span className={accuracy >= 80 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {accuracy.toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3">{avgTime.toFixed(1)} с</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}