import { diffCron, areEquivalent } from './differ';

describe('diffCron', () => {
  it('should detect identical expressions', () => {
    const result = diffCron('0 9 * * 1', '0 9 * * 1');
    expect(result.identical).toBe(true);
    expect(result.summary).toBe('Expressions are equivalent');
    expect(result.changes.every((c) => !c.changed)).toBe(true);
  });

  it('should detect a change in the hour field', () => {
    const result = diffCron('0 9 * * 1', '0 10 * * 1');
    expect(result.identical).toBe(false);
    const hourDiff = result.changes.find((c) => c.field === 'hour');
    expect(hourDiff?.changed).toBe(true);
    expect(hourDiff?.from).toBe('9');
    expect(hourDiff?.to).toBe('10');
  });

  it('should detect multiple field changes', () => {
    const result = diffCron('0 9 * * 1', '30 18 * * 5');
    expect(result.identical).toBe(false);
    const changedFields = result.changes.filter((c) => c.changed).map((c) => c.field);
    expect(changedFields).toContain('minute');
    expect(changedFields).toContain('hour');
    expect(changedFields).toContain('dayOfWeek');
    expect(result.summary).toContain('minute');
    expect(result.summary).toContain('hour');
  });

  it('should treat semantically equivalent expressions as identical', () => {
    const result = diffCron('*/5 * * * *', '0,5,10,15,20,25,30,35,40,45,50,55 * * * *');
    expect(result.identical).toBe(true);
  });

  it('should include expanded values in diff output', () => {
    const result = diffCron('0-2 * * * *', '0,1,2 * * * *');
    const minuteDiff = result.changes.find((c) => c.field === 'minute');
    expect(minuteDiff?.expandedFrom).toEqual([0, 1, 2]);
    expect(minuteDiff?.expandedTo).toEqual([0, 1, 2]);
    expect(result.identical).toBe(true);
  });
});

describe('areEquivalent', () => {
  it('should return true for equivalent expressions', () => {
    expect(areEquivalent('* * * * *', '* * * * *')).toBe(true);
  });

  it('should return false for different expressions', () => {
    expect(areEquivalent('0 9 * * *', '0 10 * * *')).toBe(false);
  });

  it('should handle step and list equivalence', () => {
    expect(areEquivalent('0/30 * * * *', '0,30 * * * *')).toBe(true);
  });
});
