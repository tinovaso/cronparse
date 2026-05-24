import { annotate, annotateField } from './annotator';

describe('annotateField', () => {
  it('detects wildcard', () => {
    const result = annotateField('minute', '*');
    expect(result.isWildcard).toBe(true);
    expect(result.isStep).toBe(false);
  });

  it('detects step', () => {
    const result = annotateField('minute', '*/5');
    expect(result.isStep).toBe(true);
    expect(result.isWildcard).toBe(false);
  });

  it('detects range', () => {
    const result = annotateField('hour', '9-17');
    expect(result.isRange).toBe(true);
    expect(result.isList).toBe(false);
  });

  it('detects list', () => {
    const result = annotateField('dayOfWeek', '1,3,5');
    expect(result.isList).toBe(true);
  });

  it('includes raw and field name', () => {
    const result = annotateField('month', '6');
    expect(result.raw).toBe('6');
    expect(result.field).toBe('month');
  });
});

describe('annotate', () => {
  it('annotates a simple expression', () => {
    const result = annotate('0 9 * * 1');
    expect(result.fields).toHaveLength(5);
    expect(result.expression).toBe('0 9 * * 1');
  });

  it('generates a summary for non-wildcard fields', () => {
    const result = annotate('0 9 * * 1');
    expect(result.summary).toBeTruthy();
    expect(result.summary).not.toBe('Runs every minute');
  });

  it('returns empty warnings for normal expression', () => {
    const result = annotate('*/5 * * * *');
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when both dom and dow are set', () => {
    const result = annotate('0 0 1 * 1');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('returns fallback summary for all-wildcard expression', () => {
    const result = annotate('* * * * *');
    expect(result.summary).toBe('Runs every minute');
  });
});
