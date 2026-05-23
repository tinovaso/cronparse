import { CronExpression } from './types';
import { parseCron } from './parser';

export type CronPreset =
  | '@yearly'
  | '@annually'
  | '@monthly'
  | '@weekly'
  | '@daily'
  | '@midnight'
  | '@hourly';

const PRESET_MAP: Record<CronPreset, string> = {
  '@yearly':   '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly':  '0 0 1 * *',
  '@weekly':   '0 0 * * 0',
  '@daily':    '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly':   '0 * * * *',
};

export function isPreset(value: string): value is CronPreset {
  return value in PRESET_MAP;
}

export function presetToExpression(preset: CronPreset): string {
  return PRESET_MAP[preset];
}

export function intervalToExpression(intervalSeconds: number): string {
  if (intervalSeconds < 60) {
    throw new Error('Minimum supported interval is 60 seconds (1 minute)');
  }
  const minutes = Math.floor(intervalSeconds / 60);
  if (minutes < 60) {
    return `*/${minutes} * * * *`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `0 */${hours} * * *`;
  }
  const days = Math.floor(hours / 24);
  return `0 0 */${days} * *`;
}

export function toParsed(input: string): CronExpression {
  const resolved = isPreset(input) ? presetToExpression(input as CronPreset) : input;
  return parseCron(resolved);
}

export function toQuartzExpression(expression: string): string {
  const resolved = isPreset(expression)
    ? presetToExpression(expression as CronPreset)
    : expression;
  const parts = resolved.trim().split(/\s+/);
  if (parts.length !== 5) {
    throw new Error('Expected a 5-field cron expression');
  }
  const [minute, hour, dom, month, dow] = parts;
  // Quartz format: seconds minutes hours dom month dow [year]
  return `0 ${minute} ${hour} ${dom} ${month} ${dow}`;
}
