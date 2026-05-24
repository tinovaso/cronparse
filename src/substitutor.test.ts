import { substituteFields, substituteMinute, substituteHour, substituteChain } from './substitutor';

describe('substituteFields', () => {
  it('replaces a single field', () => {
    expect(substituteFields('0 9 * * 1', { minute: '30' })).toBe('30 9 * * 1');
  });

  it('replaces multiple fields at once', () => {
    expect(substituteFields('0 9 * * 1', { minute: '15', hour: '10' })).toBe('15 10 * * 1');
  });

  it('leaves unspecified fields unchanged', () => {
    expect(substituteFields('5 4 3 2 1', { dayOfMonth: '15' })).toBe('5 4 15 2 1');
  });

  it('replaces all fields', () => {
    const result = substituteFields('0 0 1 1 0', {
      minute: '30',
      hour: '12',
      dayOfMonth: '15',
      month: '6',
      dayOfWeek: '5',
    });
    expect(result).toBe('30 12 15 6 5');
  });

  it('throws on invalid expression', () => {
    expect(() => substituteFields('not a cron', { minute: '0' })).toThrow();
  });

  it('preserves wildcard fields', () => {
    expect(substituteFields('* * * * *', { hour: '8' })).toBe('* 8 * * *');
  });
});

describe('substituteMinute', () => {
  it('replaces only the minute field', () => {
    expect(substituteMinute('0 12 * * *', '45')).toBe('45 12 * * *');
  });

  it('supports step syntax', () => {
    expect(substituteMinute('0 * * * *', '*/15')).toBe('*/15 * * * *');
  });
});

describe('substituteHour', () => {
  it('replaces only the hour field', () => {
    expect(substituteHour('30 0 * * *', '18')).toBe('30 18 * * *');
  });

  it('supports range syntax', () => {
    expect(substituteHour('0 9 * * 1-5', '8-17')).toBe('0 8-17 * * 1-5');
  });
});

describe('substituteChain', () => {
  it('applies substitutions in order', () => {
    const result = substituteChain('0 0 * * *', [
      { minute: '30' },
      { hour: '9' },
      { dayOfWeek: '1-5' },
    ]);
    expect(result).toBe('30 9 * * 1-5');
  });

  it('returns original expression when steps are empty', () => {
    expect(substituteChain('0 12 * * 1', [])).toBe('0 12 * * 1');
  });

  it('later steps override earlier steps', () => {
    const result = substituteChain('0 0 * * *', [
      { minute: '15' },
      { minute: '45' },
    ]);
    expect(result).toBe('45 0 * * *');
  });
});
