import { CronTemplate, applyTemplate, createTemplate } from './templater';
import { CronExpression } from './types';

const registry = new Map<string, CronTemplate>();

export function registerTemplate(template: CronTemplate): void {
  if (registry.has(template.name)) {
    throw new Error(`Template '${template.name}' is already registered`);
  }
  registry.set(template.name, template);
}

export function unregisterTemplate(name: string): boolean {
  return registry.delete(name);
}

export function getTemplate(name: string): CronTemplate | undefined {
  return registry.get(name);
}

export function listTemplates(): CronTemplate[] {
  return [...registry.values()];
}

export function useTemplate(
  name: string,
  variables: Record<string, string>
): CronExpression {
  const template = registry.get(name);
  if (!template) {
    throw new Error(`Template '${name}' not found`);
  }
  return applyTemplate(template, variables);
}

export function clearTemplates(): void {
  registry.clear();
}

// Built-in templates
const builtins: Array<[string, string, string]> = [
  ['every-n-minutes', 'Run every N minutes', '*/{{n}} * * * *'],
  ['daily-at', 'Run daily at a specific hour', '0 {{hour}} * * *'],
  ['weekly-on', 'Run weekly on a specific day', '0 {{hour}} * * {{day}}'],
  ['monthly-on', 'Run monthly on a specific day', '0 {{hour}} {{day}} * *'],
];

builtins.forEach(([name, desc, expr]) => {
  registry.set(name, createTemplate(name, desc, expr));
});
