import { lint } from './linter';

describe('lint', () => {
  it('returns valid for a correct expression', () => {
    const result = lint('0 9 * * 1-5');
    expect(result.valid).toBe(true);
  });

  it('returns error for an invalid expression', () => {
    const result = lint('invalid expression here');
    expect(result.valid).toBe(false);
    expect(result.issues[0].severity).toBe('error');
  });

  it('warns when both dom and dow are specified', () => {
    const result = lint('0 0 1 * 1');
    expect(result.valid).toBe(true);
    const warnings = result.issues.filter(i => i.severity === 'warning');
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('gives info when expression runs every day', () => {
    const result = lint('0 0 * * *');
    const infos = result.issues.filter(i => i.severity === 'info');
    expect(infos.length).toBeGreaterThan(0);
  });

  it('gives info for step of 1', () => {
    const result = lint('*/1 * * * *');
    const infos = result.issues.filter(i => i.severity === 'info');
    expect(infos.some(i => i.message.includes('Step of 1'))).toBe(true);
  });

  it('returns no issues for a strict specific schedule', () => {
    const result = lint('30 14 15 6 *');
    const errors = result.issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('returns no issues for a step expression', () => {
    const result = lint('*/15 * * * *');
    expect(result.valid).toBe(true);
  });
});
