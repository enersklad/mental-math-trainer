import type { TaskConfig, SessionResult } from './types';

// Функция проверяет, заслужил ли пользователь повышение
export function shouldLevelUp(result: SessionResult): boolean {
  const accuracy = (result.correctCount / result.totalTasks) * 100;
  const avgTimeMs = result.totalTimeMs / result.totalTasks;
  
  // Порог: точность > 90% и среднее время < 5 секунд (5000 мс)
  return accuracy >= 90 && avgTimeMs <= 5000;
}

// Функция генерирует следующий конфиг
export function getNextLevelConfig(current: TaskConfig): TaskConfig {
  const nextConfig = { ...current };
  
  // Берем текущую разрядность
  const currentPair = current.digitPairs[0];
  
  // Логика усложнения: увеличиваем первый разряд, потом второй, потом сбрасываем
  if (currentPair[0] === 1 && currentPair[1] === 1) {
    nextConfig.digitPairs = [[2, 1]];
  } else if (currentPair[0] === 2 && currentPair[1] === 1) {
    nextConfig.digitPairs = [[2, 2]];
  } else if (currentPair[0] === 2 && currentPair[1] === 2) {
    nextConfig.digitPairs = [[3, 2]];
  } else if (currentPair[0] === 3 && currentPair[1] === 2) {
    nextConfig.digitPairs = [[3, 3]];
  } 
  // Если дошли до максимума, можно добавить отрицательные числа
  else if (current.signType === 'positive') {
    nextConfig.signType = 'both';
  }
  
  return nextConfig;
}