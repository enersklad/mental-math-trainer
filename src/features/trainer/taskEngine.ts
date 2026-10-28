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
function generateOptions(correctAnswer: number, isMultiplicationTable = false): number[] {
  const options = new Set<number>();
  options.add(correctAnswer);

  if (isMultiplicationTable) {
    // Твой алгоритм для таблицы умножения
    const tableValues = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 35, 36, 40, 42, 45, 48, 49, 54, 56, 63, 64, 72, 81];
    
    // Берем 3 ближайших значения меньше и 3 ближайших больше
    const lower = tableValues.filter(v => v < correctAnswer).slice(-3);
    const higher = tableValues.filter(v => v > correctAnswer).slice(0, 3);
    const candidates = [...lower, ...higher];

    // Перемешиваем кандидатов и берем 3 случайных
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 3; i++) {
      if (shuffled[i]) options.add(shuffled[i]);
    }
  } else {
    // Старый алгоритм для остальных режимов
    const deltas = [-8, -6, -4, -2, 2, 4, 6, 8];
    while (options.size < 4) {
      const delta = deltas[Math.floor(Math.random() * deltas.length)];
      const wrongAnswer = correctAnswer + delta;
      if (wrongAnswer !== 0 || correctAnswer === 0) {
        options.add(wrongAnswer);
      }
    }
  }

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
    const a = digits[Math.floor(Math.random() * digits.length)];
    const b = Math.floor(Math.random() * 8) + 2; 
    const answer = a * b;
    
    return {
      expression: `${a} × ${b}`,
      answer,
      deliveryType: config.deliveryType,
      options: config.deliveryType === 'test' ? generateOptions(answer, true) : undefined,
    };
  }

  // ОБЫЧНАЯ ЛОГИКА
  const formatNum = (num: number) => (num < 0 ? `(${num})` : `${num}`);
  const pair1 = pickDigitPair(config.digitPairs);
  const pair2 = config.digitPairs[1] || pair1;
  
  let expression = '';
  let answer = 0;

  // Функция для генерации одного числа с учетом знака
  const getNum = (digits: number) => {
    let num = generateNumber(digits);
    if (config.signType === 'both' && Math.random() < 0.3) num = -num;
    return num;
  };

  // Если переменных 2
  if (config.operandCount === 2) {
    const op = pickOperation(config.operations);
    const a = getNum(pair1[0]);
    const b = getNum(pair2[0]);

    if (op === 'div') {
      // Для деления: генерируем b и частное, чтобы a нацело делилось на b
      const bDiv = Math.abs(b) || 2;
      const quotient = generateNumber(pair2[1] || 1);
      const aDiv = bDiv * quotient;
      expression = `${formatNum(aDiv)} ÷ ${formatNum(bDiv)}`;
      answer = quotient;
    } else if (op === 'mul') {
      expression = `${formatNum(a)} × ${formatNum(b)}`;
      answer = a * b;
    } else if (op === 'add') {
      expression = `${formatNum(a)} + ${formatNum(b)}`;
      answer = a + b;
    } else {
      expression = `${formatNum(a)} - ${formatNum(b)}`;
      answer = a - b;
    }
  } 

  // Если переменных 3
  else {
    const op1 = pickOperation(config.operations);
    const op2 = pickOperation(config.operations);
    
    // Вспомогательные функции
    const apply = (x: number, y: number, operation: Operation) => {
      switch(operation) {
        case 'add': return x + y;
        case 'sub': return x - y;
        case 'mul': return x * y;
        case 'div': return y !== 0 ? x / y : x;
        default: return x + y;
      }
    };
    const formatSymbol = (op: Operation) => op === 'add' ? '+' : op === 'sub' ? '-' : op === 'mul' ? '×' : '÷';

    // Если оба действия — умножение/деление (высокий приоритет)
    if ((op1 === 'mul' || op1 === 'div') && (op2 === 'mul' || op2 === 'div')) {
      const finalQuotient = generateNumber(pair2[1] || 1);
      
      if (op1 === 'mul' && op2 === 'mul') {
        const a = generateNumber(pair1[0]);
        const b = generateNumber(pair2[0]);
        const c = generateNumber(pair2[0]);
        expression = `${formatNum(a)} × ${formatNum(b)} × ${formatNum(c)}`;
        answer = a * b * c;
      } 
      else if (op1 === 'mul' && op2 === 'div') {
        const b = generateNumber(pair2[0]);
        const c = Math.abs(generateNumber(pair2[0])) || 2;
        const a = Math.round((finalQuotient * c) / b) || 1; 
        expression = `(${formatNum(a)} × ${formatNum(b)}) ÷ ${formatNum(c)}`;
        answer = (a * b) / c;
      } 
      else if (op1 === 'div' && op2 === 'mul') {
        const cNew = generateNumber(pair2[0]);
        const bNew = Math.abs(generateNumber(pair2[0])) || 2;
        expression = `(${formatNum(bNew * finalQuotient)} ÷ ${formatNum(bNew)}) × ${formatNum(cNew)}`;
        answer = finalQuotient * cNew; 
      } 
      else if (op1 === 'div' && op2 === 'div') {
        const b = Math.abs(generateNumber(pair2[0])) || 2;
        const c = Math.abs(generateNumber(pair2[0])) || 2;
        const a = finalQuotient * b * c;
        expression = `${formatNum(a)} ÷ ${formatNum(b)} ÷ ${formatNum(c)}`;
        answer = finalQuotient;
      }
    } 
    // Если есть + или -, а также умножение/деление
    else {
      const a = getNum(pair1[0]);
      const b = getNum(pair2[0]);
      const c = getNum(pair2[0]);

      if (op1 === 'div' || op2 === 'div') {
        if (op1 === 'div') {
          const bDiv = Math.abs(b) || 2;
          const quotient = generateNumber(pair2[1] || 1);
          const aDiv = bDiv * quotient;
          
          if (op2 === 'add') {
            expression = `${formatNum(aDiv)} ÷ ${formatNum(bDiv)} + ${formatNum(c)}`;
            answer = quotient + c;
          } else if (op2 === 'sub') {
            expression = `${formatNum(aDiv)} ÷ ${formatNum(bDiv)} - ${formatNum(c)}`;
            answer = quotient - c;
          } else if (op2 === 'mul') {
             expression = `(${formatNum(aDiv)} ÷ ${formatNum(bDiv)}) × ${formatNum(c)}`;
             answer = quotient * c;
          } else {
             const cDiv = Math.abs(c) || 2;
             const aFinal = quotient * bDiv * cDiv;
             expression = `(${formatNum(aFinal)} ÷ ${formatNum(bDiv)}) ÷ ${formatNum(cDiv)}`;
             answer = aFinal / bDiv / cDiv;
          }
        } 
        else if (op2 === 'div') {
          const cDiv = Math.abs(c) || 2;
          const quotient = generateNumber(pair2[1] || 1);
          const bDiv = cDiv * quotient;

          if (op1 === 'add') {
            expression = `${formatNum(a)} + (${formatNum(bDiv)} ÷ ${formatNum(cDiv)})`;
            answer = a + quotient;
          } else if (op1 === 'sub') {
            expression = `${formatNum(a)} - (${formatNum(bDiv)} ÷ ${formatNum(cDiv)})`;
            answer = a - quotient;
          } else if (op1 === 'mul') {
             expression = `${formatNum(a)} × (${formatNum(bDiv)} ÷ ${formatNum(cDiv)})`;
             answer = a * quotient;
          }
        }
      } 
      else {
        if (op2 === 'mul') {
          expression = `${formatNum(a)} ${formatSymbol(op1)} (${formatNum(b)} × ${formatNum(c)})`;
          answer = apply(a, b * c, op1);
        } else if (op1 === 'mul') {
          expression = `(${formatNum(a)} × ${formatNum(b)}) ${formatSymbol(op2)} ${formatNum(c)}`;
          answer = apply(a * b, c, op2);
        } else {
          expression = `${formatNum(a)} ${formatSymbol(op1)} ${formatNum(b)} ${formatSymbol(op2)} ${formatNum(c)}`;
          answer = apply(apply(a, b, op1), c, op2);
        }
      }
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
    const lastOp = config.operandCount === 3 ? pickOperation(config.operations) : pickOperation(config.operations); 
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