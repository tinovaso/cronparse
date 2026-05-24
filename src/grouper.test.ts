import { groupByMinute, groupByHour, groupByDayOfWeek, groupByFrequency, groupBy } from './grouper';

describe('groupByMinute', () => {
  it('groups expressions with the same minute field', () => {
    const exprs = ['0 9 * * *', '0 10 * * *', '30 9 * * *'];
    const groups = groupByMinute(exprs);
    expect(groups['0']).toEqual(['0 9 * * *', '0 10 * * *']);
    expect(groups['30']).toEqual(['30 9 * * *']);
  });

  it('handles a single expression', () => {
    expect(groupByMinute(['*/15 * * * *'])).toEqual({ '*/15': ['*/15 * * * *'] });
  });
});

describe('groupByHour', () => {
  it('groups expressions with the same hour field', () => {
    const exprs = ['0 9 * * *', '30 9 * * *', '0 17 * * *'];
    const groups = groupByHour(exprs);
    expect(groups['9']).toEqual(['0 9 * * *', '30 9 * * *']);
    expect(groups['17']).toEqual(['0 17 * * *']);
  });
});

describe('groupByDayOfWeek', () => {
  it('groups expressions by day of week', () => {
    const exprs = ['0 9 * * 1', '0 17 * * 1', '0 9 * * 5'];
    const groups = groupByDayOfWeek(exprs);
    expect(groups['1']).toEqual(['0 9 * * 1', '0 17 * * 1']);
    expect(groups['5']).toEqual(['0 9 * * 5']);
  });

  it('groups wildcard day-of-week together', () => {
    const exprs = ['0 9 * * *', '0 10 * * *'];
    const groups = groupByDayOfWeek(exprs);
    expect(groups['*']).toHaveLength(2);
  });
});

describe('groupByFrequency', () => {
  it('classifies a once-per-day expression', () => {
    const groups = groupByFrequency(['0 9 * * *']);
    expect(groups['once']).toContain('0 9 * * *');
  });

  it('classifies an hourly expression as frequent', () => {
    const groups = groupByFrequency(['0 * * * *']);
    expect(groups['frequent']).toContain('0 * * * *');
  });

  it('classifies a few-times-per-day expression', () => {
    const groups = groupByFrequency(['0 9,17 * * *']);
    expect(groups['few']).toContain('0 9,17 * * *');
  });
});

describe('groupBy', () => {
  it('uses a custom classifier', () => {
    const exprs = ['0 9 * * *', '0 9 * * 1', '*/5 * * * *'];
    const groups = groupBy(exprs, (_expr, parsed) => {
      return parsed.dayOfWeek === '*' ? 'everyday' : 'specific-day';
    });
    const everyday = groups.find(g => g.label === 'everyday');
    const specific = groups.find(g => g.label === 'specific-day');
    expect(everyday?.expressions).toContain('0 9 * * *');
    expect(everyday?.expressions).toContain('*/5 * * * *');
    expect(specific?.expressions).toContain('0 9 * * 1');
  });
});
