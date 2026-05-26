import { Locale, TranslationMap, getTranslation } from './translator';

const customLocales: Map<string, TranslationMap> = new Map();

export function registerLocale(code: string, map: TranslationMap): void {
  if (!map.every || !map.weekday || !map.month) {
    throw new Error('TranslationMap must include every, weekday, and month fields');
  }
  customLocales.set(code, map);
}

export function unregisterLocale(code: string): boolean {
  return customLocales.delete(code);
}

export function getLocale(code: string): TranslationMap | undefined {
  if (customLocales.has(code)) return customLocales.get(code);
  try {
    return getTranslation(code as Locale);
  } catch {
    return undefined;
  }
}

export function hasLocale(code: string): boolean {
  if (customLocales.has(code)) return true;
  const builtins: string[] = ['en', 'es', 'fr', 'de'];
  return builtins.includes(code);
}

export function listAllLocales(): string[] {
  const builtins: string[] = ['en', 'es', 'fr', 'de'];
  const custom = Array.from(customLocales.keys());
  return [...new Set([...builtins, ...custom])];
}

export function translateWithLocale(
  expression: string,
  localeCode: string,
  fallback: Locale = 'en'
): string {
  const { translateCron } = require('./translator');
  if (hasLocale(localeCode)) {
    if (customLocales.has(localeCode)) {
      const { parseCron } = require('./parser');
      const { translateParsed } = require('./translator');
      const parsed = parseCron(expression);
      if (!parsed) throw new Error(`Invalid cron expression: ${expression}`);
      return translateParsed(parsed, localeCode as Locale);
    }
    return translateCron(expression, localeCode as Locale);
  }
  return translateCron(expression, fallback);
}

export function clearCustomLocales(): void {
  customLocales.clear();
}
