export type Operation = 'add' | 'sub' | 'mul' | 'div';

export type DigitPair = [number, number]; // [разряд первого, разряд второго]

export type NumberType = 'int' | 'float';
export type SignType = 'positive' | 'both';

export type DeliveryType = 'classic' | 'test' | 'window' | 'mixed';

export interface TaskConfig {
  operations: Operation[];
  digitPairs: DigitPair[]; // например [[1,1],[2,1]]
  numberType: NumberType;
  signType: SignType;
  taskCount: number; // сколько примеров за сессию
  operandCount: number; // <--- ДОБАВИЛИ: 2 или 3 (количество переменных)
  deliveryType: DeliveryType;
  multiplicationDigits?: number[];
  failOnError?: boolean; // Если true, первая ошибка завершает сессию
  timeLimitMs?: number; // Лимит времени на один пример или на всю сессию
  chainLength?: number;     // Длина цепочки (например, 5)
  chainStartTime?: number;  // Начальное время показа одной цифры (например, 3000 мс)
  chainSpeedUp?: number;    // На сколько процентов ускоряться (например, 10)
}

export interface Task {
  expression: string;
  answer: number;
  deliveryType: DeliveryType; // Тип подачи для этой конкретной задачи
  options?: number[];         // Для тестов: 4 варианта ответа
  maskedExpression?: string;  // Для окошек: "5 + ... = 10"
}

export interface TaskResult {
  expression: string;
  correctAnswer: number;
  userAnswer: number | null; // null, если ответ не введен
  isCorrect: boolean;
}

export interface SessionResult {
  config: TaskConfig;
  totalTasks: number;
  correctCount: number;
  totalTimeMs: number;
  history: TaskResult[]; // <--- Добавили массив с историей
}