import { flattenExpression, flatSchedulesEqual, flatDifference, flatIntersection } from './flattener';
import { expandCron } from './expander';
import { parseCron } from './parser';

describe('flattener integration', () => {
  it('flat schedule matches manual expansion', () => {
    const expr = '0 6 * * 1,3,5';
    const flat = flattenExpression(expr);
    const expanded = expandCron(parseCron(expr));

    let expected = 0;
    for (const dow of expanded.dayOfWeek)
      for (const h of expanded.hour)
        for (const m of expanded.minute)
          expected++;

    expect(flat.length).toBe(expected);
  });

  it('two semantically equal expressions produce equal flat schedules', () => {
    // "0 9 * * 1-5" and "0 9 * * 1,2,3,4,5" should be identical
    const a = flattenExpression('0 9 * * 1-5');
    const b = flattenExpression('0 9 * * 1,2,3,4,5');
    expect(flatSchedulesEqual(a, b)).toBe(true);
  });

  it('difference of superset minus subset equals extra entries', () => {
    const wider = flattenExpression('0 9 * * 1-5');
    const narrower = flattenExpression('0 9 * * 1,2');
    const diff = flatDifference(wider, narrower);
    expect(diff.length).toBe(3); // Wed, Thu, Fri
  });

  it('intersection of overlapping schedules is non-empty', () => {
    const a = flattenExpression('0,30 9 * * 1,2');
    const b = flattenExpression('0 9 * * 2,3');
    const inter = flatIntersection(a, b);
    // Only Monday at 09:00 is common
    expect(inter.length).toBe(1);
  });

  it('disjoint day schedules have empty intersection', () => {
    const a = flattenExpression('0 9 * * 1');
    const b = flattenExpression('0 9 * * 2');
    expect(flatIntersection(a, b).length).toBe(0);
  });
});
