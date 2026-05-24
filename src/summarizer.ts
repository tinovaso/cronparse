import { parseCron } from './parser';
import { humanize } from './humanize';
import { analyze } from './analyzer';
import { predict } from './predictor';
import { CronExpression } from './types';

export interface CronSummary {
  expression: string;
  humanReadable: string;
  nextRuns: Date[];
  medianIntervalMinutes: number | null;
  isUniform: boolean;
  complexity: number;
  fieldBreakdown: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
}

export function summarize(expression: string, fromDate: Date = new Date()): CronSummary {
  const parsed: CronExpression = parseCron(expression);
  const human = humanize(expression);
  const analysis = analyze(expression);
  const prediction = predict(expression, fromDate);

  const nextRuns = prediction.nextDates ?? [];
  const medianIntervalMinutes = prediction.medianIntervalMinutes ?? null;
  const isUniform = prediction.isUniform ?? false;

  const fieldBreakdown = {
    minute: describeFieldShort(parsed.minute),
    hour: describeFieldShort(parsed.hour),
    dayOfMonth: describeFieldShort(parsed.dayOfMonth),
    month: describeFieldShort(parsed.month),
    dayOfWeek: describeFieldShort(parsed.dayOfWeek),
  };

  return {
    expression,
    humanReadable: human,
    nextRuns,
    medianIntervalMinutes,
    isUniform,
    complexity: analysis.complexity,
    fieldBreakdown,
  };
}

function describeFieldShort(field: string): string {
  if (field === '*') return 'every';
  if (field.includes('/')) {
    const [, step] = field.split('/');
    return `every ${step}`;
  }
  if (field.includes('-')) return `range(${field})`;
  if (field.includes(',')) return `list(${field.split(',').length})`;
  return `fixed(${field})`;
}

export function summarizeMultiple(
  expressions: string[],
  fromDate: Date = new Date()
): CronSummary[] {
  return expressions.map((expr) => summarize(expr, fromDate));
}
