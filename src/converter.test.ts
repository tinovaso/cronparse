import {
  isPreset,
  presetToExpression,
  intervalToExpression,
  toParsed,
  toQuartzExpression,
} from './converter';

describe('isPreset', () => {
  it('returns true for valid presets', () => {
    expect(isPreset('@daily')).toBe(true);
    expect(isPreset('@hourly')).toBe(true);
    expect(isPreset('@yearly')).toBe(true);
    expect(isPreset('@annually')).toBe(true);
  });

  it('returns false for non-preset strings', () => {
    expect(isPreset('0 * * * *')).toBe(false);
    expect(isPreset('@unknown')).toBe(false);
  });
});

describe('presetToExpression', () => {
  it('converts @daily to correct expression', () => {
    expect(presetToExpression('@daily')).toBe('0 0 * * *');
  });

  it('@annually and @yearly produce the same expression', () => {
    expect(presetToExpression('@annually')).toBe(presetToExpression('@yearly'));
  });

  it('converts @hourly correctly', () => {
    expect(presetToExpression('@hourly')).toBe('0 * * * *');
  });
});

describe('intervalToExpression', () => {
  it('converts 5-minute interval', () => {
    expect(intervalToExpression(300)).toBe('*/5 * * * *');
  });

  it('converts 2-hour interval', () => {
    expect(intervalToExpression(7200)).toBe('0 */2 * * *');
  });

  it('converts 3-day interval', () => {
    expect(intervalToExpression(259200)).toBe('0 0 */3 * *');
  });

  it('throws for intervals under 60 seconds', () => {
    expect(() => intervalToExpression(30)).toThrow();
  });
});

describe('toParsed', () => {
  it('parses a preset into a CronExpression', () => {
    const result = toParsed('@hourly');
    expect(result.minute).toBe('0');
    expect(result.hour).toBe('*');
  });

  it('parses a raw expression', () => {
    const result = toParsed('5 4 * * *');
    expect(result.minute).toBe('5');
    expect(result.hour).toBe('4');
  });
});

describe('toQuartzExpression', () => {
  it('prepends seconds field', () => {
    expect(toQuartzExpression('0 0 * * *')).toBe('0 0 0 * * *');
  });

  it('converts a preset to Quartz format', () => {
    expect(toQuartzExpression('@hourly')).toBe('0 0 * * * *');
  });

  it('throws on invalid field count', () => {
    expect(() => toQuartzExpression('* * *')).toThrow();
  });
});
