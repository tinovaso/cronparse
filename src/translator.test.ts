import { translateCron, translateParsed, getTranslation, listLocales } from './translator';
import { parseCron } from './parser';

describe('getTranslation', () => {
  it('returns english translation map', () => {
    const t = getTranslation('en');
    expect(t.every).toBe('every');
    expect(t.weekday[1]).toBe('Monday');
    expect(t.month[1]).toBe('January');
  });

  it('returns spanish translation map', () => {
    const t = getTranslation('es');
    expect(t.every).toBe('cada');
    expect(t.weekday[1]).toBe('lunes');
  });

  it('returns french translation map', () => {
    const t = getTranslation('fr');
    expect(t.every).toBe('chaque');
    expect(t.month[3]).toBe('mars');
  });

  it('returns german translation map', () => {
    const t = getTranslation('de');
    expect(t.every).toBe('jeden');
    expect(t.weekday[5]).toBe('Freitag');
  });
});

describe('translateCron', () => {
  it('returns english humanize output for en locale', () => {
    const result = translateCron('* * * * *', 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('translates every-minute expression to spanish', () => {
    const result = translateCron('* * * * *', 'es');
    expect(result).toContain('cada');
    expect(result).toContain('minuto');
  });

  it('translates hourly expression to french', () => {
    const result = translateCron('0 * * * *', 'fr');
    expect(result).toContain('chaque');
  });

  it('translates specific time to german', () => {
    const result = translateCron('30 9 * * *', 'de');
    expect(result).toContain('9');
    expect(result).toContain('30');
  });

  it('throws on invalid expression', () => {
    expect(() => translateCron('invalid', 'en')).toThrow();
  });

  it('translates weekday expression to spanish', () => {
    const result = translateCron('0 9 * * 1,5', 'es');
    expect(result).toContain('lunes');
    expect(result).toContain('viernes');
  });

  it('translates month expression to french', () => {
    const result = translateCron('0 0 1 3 *', 'fr');
    expect(result).toContain('mars');
  });
});

describe('translateParsed', () => {
  it('translates parsed expression to german', () => {
    const parsed = parseCron('0 8 * * 1')!;
    const result = translateParsed(parsed, 'de');
    expect(result).toContain('Montag');
  });
});

describe('listLocales', () => {
  it('returns all supported locales', () => {
    const locales = listLocales();
    expect(locales).toContain('en');
    expect(locales).toContain('es');
    expect(locales).toContain('fr');
    expect(locales).toContain('de');
  });
});
