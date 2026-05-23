import { mergeCron, mergeAll, unionMinutes } from './merger';

describe('mergeCron', () => {
  it('returns the same expression when both are equivalent', () => {
    const result = mergeCron('0 9 * * 1', '0 9 * * 1');
    expect(result).toBe('0 9 * * 1');
  });

  it('merges two expressions differing only in hour', () => {
    const result = mergeCron('0 9 * * 1', '0 10 * * 1');
    expect(result).toBe('0 9,10 * * 1');
  });

  it('merges two expressions differing only in minute', () => {
    const result = mergeCron('0 9 * * 1', '30 9 * * 1');
    expect(result).toBe('0,30 9 * * 1');
  });

  it('returns null when more than one field differs', () => {
    const result = mergeCron('0 9 * * 1', '30 10 * * 1');
    expect(result).toBeNull();
  });

  it('merges to wildcard when one side is wildcard', () => {
    const result = mergeCron('0 9 * * 1', '0 * * * 1');
    expect(result).toBe('0 * * * 1');
  });

  it('merges expressions differing in dayOfWeek', () => {
    const result = mergeCron('0 9 * * 1', '0 9 * * 2');
    expect(result).toBe('0 9 * * 1,2');
  });

  it('accepts CronExpression objects directly', () => {
    const result = mergeCron(
      { minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1' },
      { minute: '0', hour: '10', dayOfMonth: '*', month: '*', dayOfWeek: '1' }
    );
    expect(result).toBe('0 9,10 * * 1');
  });
});

describe('mergeAll', () => {
  it('returns empty array for empty input', () => {
    expect(mergeAll([])).toEqual([]);
  });

  it('returns single element unchanged', () => {
    expect(mergeAll(['0 9 * * 1'])).toEqual(['0 9 * * 1']);
  });

  it('merges compatible expressions', () => {
    const result = mergeAll(['0 9 * * 1', '0 10 * * 1', '0 11 * * 1']);
    expect(result.length).toBeLessThan(3);
  });

  it('keeps incompatible expressions separate', () => {
    const result = mergeAll(['0 9 * * 1', '30 10 * * 2']);
    expect(result).toHaveLength(2);
  });
});

describe('unionMinutes', () => {
  it('returns combined unique minutes from two expressions', () => {
    const result = unionMinutes('0 9 * * *', '30 9 * * *');
    expect(result).toContain(0);
    expect(result).toContain(30);
  });

  it('deduplicates overlapping minutes', () => {
    const result = unionMinutes('0 9 * * *', '0 10 * * *');
    const zeros = result.filter(m => m === 0);
    expect(zeros).toHaveLength(1);
  });

  it('returns sorted minutes', () => {
    const result = unionMinutes('30 9 * * *', '0 9 * * *');
    expect(result[0]).toBeLessThan(result[result.length - 1]);
  });
});
