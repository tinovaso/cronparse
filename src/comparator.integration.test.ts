import { compareCron, isSupersetOf, isSubsetOf } from './comparator';
import { areEquivalent } from './differ';

describe('comparator integration with differ', () => {
  it('isEqual in compareCron agrees with areEquivalent from differ', () => {
    const pairs: [string, string][] = [
      ['0 * * * *', '0 * * * *'],
      ['*/5 * * * *', '0/5 * * * *'],
      ['0 0 * * 0', '0 0 * * 7'],
    ];
    for (const [a, b] of pairs) {
      const compareResult = compareCron(a, b);
      const equivalent = areEquivalent(a, b);
      expect(compareResult.isEqual).toBe(equivalent);
    }
  });

  it('subset and superset are consistent', () => {
    const a = '0 * * * *';
    const b = '0/30 * * * *';
    expect(isSubsetOf(a, b)).toBe(true);
    expect(isSupersetOf(b, a)).toBe(true);
    expect(isSubsetOf(b, a)).toBe(false);
    expect(isSupersetOf(a, b)).toBe(false);
  });
});
