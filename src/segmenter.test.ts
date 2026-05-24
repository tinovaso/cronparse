import { segmentCron, getSegment, hasWildcardField, CronSegment } from './segmenter';

describe('segmentCron', () => {
  it('should return all 5 segments for a valid expression', () => {
    const result = segmentCron('0 9 * * 1-5');
    expect(result.segments).toHaveLength(5);
    expect(result.expression).toBe('0 9 * * 1-5');
  });

  it('should correctly identify wildcard fields', () => {
    const result = segmentCron('* * * * *');
    result.segments.forEach((seg) => {
      expect(seg.isWildcard).toBe(true);
    });
  });

  it('should correctly identify step fields', () => {
    const result = segmentCron('*/5 * * * *');
    expect(result.segments[0].isStep).toBe(true);
    expect(result.segments[0].isWildcard).toBe(false);
  });

  it('should correctly identify range fields', () => {
    const result = segmentCron('0 9 * * 1-5');
    const dowSegment = result.segments.find((s) => s.field === 'dayOfWeek')!;
    expect(dowSegment.isRange).toBe(true);
    expect(dowSegment.values).toEqual([1, 2, 3, 4, 5]);
  });

  it('should correctly identify list fields', () => {
    const result = segmentCron('0 9,12,17 * * *');
    const hourSegment = result.segments.find((s) => s.field === 'hour')!;
    expect(hourSegment.isList).toBe(true);
    expect(hourSegment.values).toEqual([9, 12, 17]);
  });

  it('should expand wildcard to all values for minute field', () => {
    const result = segmentCron('* 0 * * *');
    const minuteSegment = result.segments.find((s) => s.field === 'minute')!;
    expect(minuteSegment.values).toHaveLength(60);
  });

  it('should assign correct field names in order', () => {
    const result = segmentCron('0 9 15 6 1');
    const fields = result.segments.map((s) => s.field);
    expect(fields).toEqual(['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek']);
  });
});

describe('getSegment', () => {
  it('should return the correct segment for a given field', () => {
    const segment = getSegment('30 8 * * *', 'minute');
    expect(segment.raw).toBe('30');
    expect(segment.values).toEqual([30]);
  });

  it('should return hour segment correctly', () => {
    const segment = getSegment('0 14 * * *', 'hour');
    expect(segment.raw).toBe('14');
    expect(segment.values).toEqual([14]);
  });
});

describe('hasWildcardField', () => {
  it('should return true for wildcard field', () => {
    expect(hasWildcardField('0 9 * * *', 'dayOfMonth')).toBe(true);
  });

  it('should return false for non-wildcard field', () => {
    expect(hasWildcardField('0 9 * * *', 'minute')).toBe(false);
  });
});
