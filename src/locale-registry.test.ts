import {
  registerLocale,
  unregisterLocale,
  getLocale,
  hasLocale,
  listAllLocales,
  translateWithLocale,
  clearCustomLocales,
} from './locale-registry';
import { TranslationMap } from './translator';

const ptMap: TranslationMap = {
  every: 'todo', at: 'às', on: 'no', and: 'e', through: 'até',
  minute: 'minuto', minutes: 'minutos', hour: 'hora', hours: 'horas',
  day: 'dia', days: 'dias',
  weekday: { 0: 'domingo', 1: 'segunda', 2: 'terça', 3: 'quarta', 4: 'quinta', 5: 'sexta', 6: 'sábado' },
  month: { 1: 'janeiro', 2: 'fevereiro', 3: 'março', 4: 'abril', 5: 'maio', 6: 'junho', 7: 'julho', 8: 'agosto', 9: 'setembro', 10: 'outubro', 11: 'novembro', 12: 'dezembro' },
};

afterEach(() => clearCustomLocales());

describe('registerLocale', () => {
  it('registers a custom locale', () => {
    registerLocale('pt', ptMap);
    expect(hasLocale('pt')).toBe(true);
  });

  it('throws if map is missing required fields', () => {
    expect(() => registerLocale('xx', {} as TranslationMap)).toThrow();
  });
});

describe('unregisterLocale', () => {
  it('removes a registered custom locale', () => {
    registerLocale('pt', ptMap);
    const removed = unregisterLocale('pt');
    expect(removed).toBe(true);
    expect(hasLocale('pt')).toBe(false);
  });

  it('returns false for non-existent locale', () => {
    expect(unregisterLocale('zz')).toBe(false);
  });
});

describe('getLocale', () => {
  it('returns builtin locale map', () => {
    const map = getLocale('en');
    expect(map).toBeDefined();
    expect(map!.every).toBe('every');
  });

  it('returns custom locale map', () => {
    registerLocale('pt', ptMap);
    const map = getLocale('pt');
    expect(map!.every).toBe('todo');
  });

  it('returns undefined for unknown locale', () => {
    expect(getLocale('zz')).toBeUndefined();
  });
});

describe('hasLocale', () => {
  it('returns true for builtin locales', () => {
    expect(hasLocale('en')).toBe(true);
    expect(hasLocale('de')).toBe(true);
  });

  it('returns false for unknown locale', () => {
    expect(hasLocale('zz')).toBe(false);
  });
});

describe('listAllLocales', () => {
  it('lists builtin locales', () => {
    const locales = listAllLocales();
    expect(locales).toContain('en');
    expect(locales).toContain('fr');
  });

  it('includes custom locales', () => {
    registerLocale('pt', ptMap);
    expect(listAllLocales()).toContain('pt');
  });
});

describe('translateWithLocale', () => {
  it('uses builtin locale', () => {
    const result = translateWithLocale('* * * * *', 'es');
    expect(result).toContain('cada');
  });

  it('falls back to english for unknown locale', () => {
    const result = translateWithLocale('* * * * *', 'zz', 'en');
    expect(typeof result).toBe('string');
  });
});
