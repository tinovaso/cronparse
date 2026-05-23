import { parseCron } from './parser';
import { expandCron } from './expander';
import { CronExpression } from './types';

export interface CronDiff {
  field: keyof CronExpression;
  from: string;
  to: string;
  expandedFrom: number[];
  expandedTo: number[];
  changed: boolean;
}

export interface DiffResult {
  identical: boolean;
  changes: CronDiff[];
  summary: string;
}

const FIELD_RANGES: Record<keyof CronExpression, [number, number]> = {
  minute: [0, 59],
  hour: [0, 23],
  dayOfMonth: [1, 31],
  month: [1, 12],
  dayOfWeek: [0, 6],
};

export function diffCron(expressionA: string, expressionB: string): DiffResult {
  const parsedA = parseCron(expressionA);
  const parsedB = parseCron(expressionB);

  const expandedA = expandCron(expressionA);
  const expandedB = expandCron(expressionB);

  const fields = Object.keys(FIELD_RANGES) as Array<keyof CronExpression>;

  const changes: CronDiff[] = fields.map((field) => {
    const rawFrom = parsedA[field];
    const rawTo = parsedB[field];
    const expFrom = expandedA[field];
    const expTo = expandedB[field];
    const changed =
      expFrom.length !== expTo.length ||
      expFrom.some((v, i) => v !== expTo[i]);

    return {
      field,
      from: rawFrom,
      to: rawTo,
      expandedFrom: expFrom,
      expandedTo: expTo,
      changed,
    };
  });

  const changedFields = changes.filter((c) => c.changed);
  const identical = changedFields.length === 0;

  const summary = identical
    ? 'Expressions are equivalent'
    : `Differs in: ${changedFields.map((c) => c.field).join(', ')}`;

  return { identical, changes, summary };
}

export function areEquivalent(expressionA: string, expressionB: string): boolean {
  return diffCron(expressionA, expressionB).identical;
}
