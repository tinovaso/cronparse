import { splitField, splitAll, splitByDayOfWeek, splitByHour } from './splitter';

describe('splitField', () => {
  it('returns original expression when field has no comma', () => {
    const result = splitField('0 9 * * 1', 4);
    expect(result.expressions).toEqual(['0 9 * * 1']);
    expect(result.count).toBe(1);
  });

  it('splits minute field with multiple values', () => {
    const result = splitField('0,30 9 * * *', 0);
    expect(result.expressions).toEqual(['0 9 * * *', '30 9 * * *']);
    expect(result.count).toBe(2);
  });

  it('splits hour field with multiple values', () => {
    const result = splitField('0 8,12,18 * * *', 1);
    expect(result.expressions).toEqual([
      '0 8 * * *',
      '0 12 * * *',
      '0 18 * * *',
    ]);
    expect(result.count).toBe(3);
  });

  it('splits day-of-week field', () => {
    const result = splitField('0 9 * * 1,3,5', 4);
    expect(result.expressions).toEqual([
      '0 9 * * 1',
      '0 9 * * 3',
      '0 9 * * 5',
    ]);
    expect(result.count).toBe(3);
  });
});

describe('splitAll', () => {
  it('returns single expression when no commas present', () => {
    const result = splitAll('0 9 * * 1');
    expect(result.expressions).toEqual(['0 9 * * 1']);
    expect(result.count).toBe(1);
  });

  it('decomposes multiple comma fields into all combinations', () => {
    const result = splitAll('0,30 8,20 * * *');
    expect(result.count).toBe(4);
    expect(result.expressions).toContain('0 8 * * *');
    expect(result.expressions).toContain('0 20 * * *');
    expect(result.expressions).toContain('30 8 * * *');
    expect(result.expressions).toContain('30 20 * * *');
  });

  it('handles three-way comma split', () => {
    const result = splitAll('0 6,12,18 * * *');
    expect(result.count).toBe(3);
  });
});

describe('splitByDayOfWeek', () => {
  it('splits by day-of-week convenience helper', () => {
    const result = splitByDayOfWeek('30 8 * * 1,2');
    expect(result.expressions).toEqual(['30 8 * * 1', '30 8 * * 2']);
  });

  it('returns original if single day', () => {
    const result = splitByDayOfWeek('0 9 * * 5');
    expect(result.count).toBe(1);
  });
});

describe('splitByHour', () => {
  it('splits by hour convenience helper', () => {
    const result = splitByHour('0 9,17 * * *');
    expect(result.expressions).toEqual(['0 9 * * *', '0 17 * * *']);
  });
});
