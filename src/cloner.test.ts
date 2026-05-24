import { cloneExpression, cloneCron, cloneMany, cloneWithField } from './cloner';
import { parseCron } from './parser';

describe('cloneExpression', () => {
  it('returns a deep copy of the expression', () => {
    const original = parseCron('*/5 * * * *');
    const clone = cloneExpression(original);
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone.minute).not.toBe(original.minute);
  });

  it('modifications to clone do not affect original', () => {
    const original = parseCron('0 9 * * 1');
    const clone = cloneExpression(original);
    (clone.hour as any).raw = '12';
    expect((original.hour as any).raw).toBe('9');
  });
});

describe('cloneCron', () => {
  it('clones a simple cron string', () => {
    const result = cloneCron('0 0 * * *');
    expect(result).toBe('0 0 * * *');
  });

  it('clones and applies overrides', () => {
    const override = parseCron('30 6 * * *');
    const result = cloneCron('0 0 * * *', { minute: override.minute, hour: override.hour });
    expect(result).toContain('30');
    expect(result).toContain('6');
  });

  it('returns a string', () => {
    expect(typeof cloneCron('*/10 * * * *')).toBe('string');
  });
});

describe('cloneMany', () => {
  it('returns an empty array for count 0', () => {
    expect(cloneMany('* * * * *', 0)).toEqual([]);
  });

  it('returns correct number of clones', () => {
    const clones = cloneMany('0 12 * * *', 3);
    expect(clones).toHaveLength(3);
  });

  it('all clones are equal strings', () => {
    const clones = cloneMany('*/5 * * * *', 4);
    expect(new Set(clones).size).toBe(1);
  });

  it('clones are independent strings', () => {
    const clones = cloneMany('0 0 1 * *', 2);
    expect(clones[0]).toBe(clones[1]);
  });
});

describe('cloneWithField', () => {
  it('patches the minute field', () => {
    const result = cloneWithField('0 12 * * *', 'minute', '30');
    expect(result.startsWith('30')).toBe(true);
  });

  it('patches the hour field', () => {
    const result = cloneWithField('0 12 * * *', 'hour', '9');
    expect(result).toContain('9');
  });
});
