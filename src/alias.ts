/**
 * Named schedule aliases — maps human-friendly names to cron expressions.
 */

export interface AliasEntry {
  name: string;
  expression: string;
  description: string;
}

const builtinAliases: AliasEntry[] = [
  { name: 'every-minute',       expression: '* * * * *',     description: 'Every minute' },
  { name: 'every-5-minutes',    expression: '*/5 * * * *',   description: 'Every 5 minutes' },
  { name: 'every-15-minutes',   expression: '*/15 * * * *',  description: 'Every 15 minutes' },
  { name: 'every-30-minutes',   expression: '*/30 * * * *',  description: 'Every 30 minutes' },
  { name: 'hourly',             expression: '0 * * * *',     description: 'Once per hour' },
  { name: 'daily',              expression: '0 0 * * *',     description: 'Once per day at midnight' },
  { name: 'weekly',             expression: '0 0 * * 0',     description: 'Once per week on Sunday' },
  { name: 'monthly',            expression: '0 0 1 * *',     description: 'First day of every month' },
  { name: 'yearly',             expression: '0 0 1 1 *',     description: 'Once per year on Jan 1st' },
  { name: 'weekdays',           expression: '0 9 * * 1-5',   description: 'Weekdays at 9 AM' },
  { name: 'weekends',           expression: '0 10 * * 6,0',  description: 'Weekends at 10 AM' },
  { name: 'business-hours',     expression: '0 9-17 * * 1-5',description: 'Business hours (Mon-Fri 9-17)' },
];

const registry = new Map<string, AliasEntry>(
  builtinAliases.map((a) => [a.name, a])
);

export function registerAlias(entry: AliasEntry): void {
  registry.set(entry.name, entry);
}

export function resolveAlias(name: string): string | undefined {
  return registry.get(name)?.expression;
}

export function listAliases(): AliasEntry[] {
  return Array.from(registry.values());
}

export function findAliasByExpression(expression: string): AliasEntry | undefined {
  return Array.from(registry.values()).find((a) => a.expression === expression);
}
