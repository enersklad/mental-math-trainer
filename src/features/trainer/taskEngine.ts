import type { Task, TaskConfig, Operation, DigitPair, DeliveryType } from './types';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNumber(digits: number): number {
  if (digits === 1) return randomInt(1, 9);
  if (digits === 2) return randomInt(10, 99);
  if (digits === 3) return randomInt(100, 999);
  return randomInt(1, 9);
}

function pickOperation(operations: Operation[]): Operation {
  return operations[Math.floor(Math.random() * operations.length)];
}

function pickDigitPair(pairs: DigitPair[]): DigitPair {
  return pairs[Math.floor(Math.random() * pairs.length)];
}

function getNumberByConfig(config: TaskConfig, digits: number): number {
  let num = generateNumber(digits);
  if (config.signType === 'both' && Math.random() < 0.3) {
    num = -num;
  }
  return num;
}

// Генерация неправильных ответов для теста
function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>();
  options.add(correctAnswer);

  const deltas = [-8, -6, -4, -2, 2, 4, 6, 8];
  
  while (options.size < 4) {
    const delta = deltas[Math.floor(Math.random() * deltas.length)];
    const wrongAnswer = correctAnswer + delta;
    // Добавляем, только если это не 0 (если ответ не 0) и еще нет в списке
    if (wrongAnswer !== 0 || correctAnswer === 0) {
      options.add(wrongAnswer);
    }
  }

  // Перемешиваем массив (Fisher-Yates shuffle)
  return Array.from(options).sort(() => Math.random() - 0.5);
}

// Маскировка выражения для "Окошек"
function maskExpression(expression: string, answer: number, operation: Operation): string {
  // Простейший вариант: если это сложение/вычитание, прячем последнее число.
  // Пример: "5 + 3" -> "5 + ..."
  if (operation === 'add' || operation === 'sub' || operation === 'mul' || operation === 'div') {
    const parts = expression.split(' ');
    if (parts.length >= 3) {
      parts[parts.length - 1] = '...';
      return parts.join(' ');
    }
  }
  return expression;
}

export function generateTask(config: TaskConfig): Task {
  // СПЕЦИАЛЬНАЯ ЛОГИКА ДЛЯ ТАБЛИЦЫ УМНОЖЕНИЯ
  if (config.multiplicationDigits && config.multiplicationDigits.length > 0) {
    const digits = config.multiplicationDigits;
    // Выбираем случайную цифру из выбранных пользователем
    const a = digits[Math.floor(Math.random() * digits.length)];
    // Второй множитель от 2 до 9
    const b = Math.floor(Math.random() * 8) + 2; 
    const answer = a * b;
    
    return {
      expression: `${a} × ${b}`,
      answer,
      deliveryType: config.deliveryType,
      // Для тестов генерируем варианты
      options: config.deliveryType === 'test' ? generateOptions(answer) : undefined,
    };
  }

  const op1 = pickOperation(config.operations);
  
  const pair1 = pickDigitPair(config.digitPairs);
  const a = getNumberByConfig(config, pair1[0]);
  
  const pair2 = config.digitPairs[1] || pair1;
  const b = getNumberByConfig(config, pair2[0]);

  let expression = '';
  let answer = 0;

  const formatNum = (num: number) => (num < 0 ? `(${num})` : `${num}`);

  const applyOp = (currentVal: number, nextVal: number, operation: Operation): number => {
    switch (operation) {
      case 'add': return currentVal + nextVal;
      case 'sub': return currentVal - nextVal;
      case 'mul': return currentVal * nextVal;
      case 'div': return nextVal !== 0 ? currentVal / nextVal : currentVal;
      default: return currentVal + nextVal;
    }
  };

  if (op1 === 'div') {
    const bDiv = Math.abs(b) || 2;
    const quotient = generateNumber(pair2[1] || 1);
    const aDiv = bDiv * quotient;
    expression = `${formatNum(aDiv)} ÷ ${formatNum(bDiv)}`;
    answer = quotient;
  } else {
    const opSymbol = op1 === 'add' ? '+' : op1 === 'sub' ? '-' : '×';
    expression = `${formatNum(a)} ${opSymbol} ${formatNum(b)}`;
    answer = applyOp(a, b, op1);
  }

  if (config.operandCount === 3) {
    const op2 = pickOperation(config.operations);
    const pair3 = config.digitPairs[1] || pair1;
    let c = getNumberByConfig(config, pair3[0]);

    if (op2 === 'div') {
      c = Math.abs(c) || 2; 
      expression = `(${expression}) ÷ ${formatNum(c)}`;
      answer = applyOp(answer, c, 'div');
    } else {
      const opSymbol2 = op2 === 'add' ? '+' : op2 === 'sub' ? '-' : '×';
      expression = `${expression} ${opSymbol2} ${formatNum(c)}`;
      answer = applyOp(answer, c, op2);
    }
  }

  // Определяем итоговый тип подачи (если mixed, то рандом)
  let finalDelivery: DeliveryType = config.deliveryType;
  if (config.deliveryType === 'mixed') {
    const types: DeliveryType[] = ['classic', 'test', 'window'];
    finalDelivery = types[Math.floor(Math.random() * types.length)];
  }

  const task: Task = {
    expression,
    answer,
    deliveryType: finalDelivery,
  };

  if (finalDelivery === 'test') {
    task.options = generateOptions(answer);
  }

  if (finalDelivery === 'window') {
    // Для окошек маскируем последнее число (или операцию, если это деление)
    const lastOp = config.operandCount === 3 ? op1 : op1; 
    task.maskedExpression = maskExpression(expression, answer, lastOp);
  }

  return task;
}

export function generateSession(config: TaskConfig): Task[] {
  const tasks: Task[] = [];
  for (let i = 0; i < config.taskCount; i++) {
    tasks.push(generateTask(config));
  }
  return tasks;
}

// Генерация данных для режима "Цепочка"
export function generateChain(length: number): { sequence: string[], answer: number } {
  const sequence: string[] = [];
  const operations = ['+', '-'];
  
  // Генерируем первую цифру (без знака)
  let currentVal = randomInt(1, 9);
  sequence.push(currentVal.toString());
  
  let answer = currentVal;

  for (let i = 1; i < length; i++) {
    const op = operations[Math.floor(Math.random() * operations.length)];
    const num = randomInt(1, 9);
    
    // Объединяем знак и цифру в один элемент (например, "+3")
    sequence.push(`${op}${num}`);

    if (op === '+') {
      answer += num;
    } else {
      answer -= num;
    }
  }

  return { sequence, answer };
}