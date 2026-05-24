import { parseCron } from './parser';
import { CronExpression } from './types';

export interface SplitResult {
  expressions: string[];
  count: number;
}

/**
 * Splits a cron expression with multiple values in a field into
 * individual expressions, one per unique combination.
 */
export function splitField(
  expression: string,
  fieldIndex: number
): SplitResult {
  const parsed = parseCron(expression);
  const fields = [parsed.minute, parsed.hour, parsed.dayOfMonth, parsed.month, parsed.dayOfWeek];
  const target = fields[fieldIndex];

  if (!target.includes(',')) {
    return { expressions: [expression], count: 1 };
  }

  const parts = target.split(',');
  const expressions = parts.map((part) => {
    const newFields = [...fields];
    newFields[fieldIndex] = part.trim();
    return newFields.join(' ');
  });

  return { expressions, count: expressions.length };
}

/**
 * Fully decomposes a cron expression into atomic expressions
 * where no field contains a comma-separated list.
 */
export function splitAll(expression: string): SplitResult {
  const parsed = parseCron(expression);
  const fieldValues = [
    parsed.minute.split(','),
    parsed.hour.split(','),
    parsed.dayOfMonth.split(','),
    parsed.month.split(','),
    parsed.dayOfWeek.split(','),
  ];

  const combinations: string[] = [];

  for (const min of fieldValues[0]) {
    for (const hr of fieldValues[1]) {
      for (const dom of fieldValues[2]) {
        for (const mon of fieldValues[3]) {
          for (const dow of fieldValues[4]) {
            combinations.push(
              [min, hr, dom, mon, dow].map((v) => v.trim()).join(' ')
            );
          }
        }
      }
    }
  }

  return { expressions: combinations, count: combinations.length };
}

/**
 * Splits an expression by day-of-week, yielding one expression per day.
 */
export function splitByDayOfWeek(expression: string): SplitResult {
  return splitField(expression, 4);
}

/**
 * Splits an expression by hour field.
 */
export function splitByHour(expression: string): SplitResult {
  return splitField(expression, 1);
}
