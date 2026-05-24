import { groupByFrequency, groupByDayOfWeek, groupBy } from './grouper';
import { humanize } from './humanize';
import { expandCron } from './expander';

describe('grouper integration', () => {
  const expressions = [
    '0 9 * * 1-5',
    '0 17 * * 1-5',
    '0 12 * * 0,6',
    '*/30 * * * *',
    '0 * * * *',
    '0 9 * * *',
  ];

  it('groups weekday vs weekend expressions via custom groupBy', () => {
    const groups = groupBy(expressions, (_expr, parsed) => {
      const dow = parsed.dayOfWeek;
      if (dow === '*') return 'all-days';
      if (dow.includes('1-5')) return 'weekdays';
      return 'weekend';
    });

    const weekdays = groups.find(g => g.label === 'weekdays');
    const weekend = groups.find(g => g.label === 'weekend');
    const allDays = groups.find(g => g.label === 'all-days');

    expect(weekdays?.expressions).toHaveLength(2);
    expect(weekend?.expressions).toHaveLength(1);
    expect(allDays?.expressions).toHaveLength(3);
  });

  it('frequency groups are consistent with expandCron minute counts', () => {
    const freqGroups = groupByFrequency(expressions);
    const frequentExprs = freqGroups['frequent'] ?? [];
    for (const expr of frequentExprs) {
      const expanded = expandCron(expr);
      const firesPerDay = expanded.minutes.length * expanded.hours.length;
      expect(firesPerDay).toBeGreaterThan(24);
    }
  });

  it('humanize works on every expression in each group', () => {
    const groups = groupByDayOfWeek(expressions);
    for (const [, exprs] of Object.entries(groups)) {
      for (const expr of exprs) {
        expect(() => humanize(expr)).not.toThrow();
      }
    }
  });
});
