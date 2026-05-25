import { describe, it, expect } from 'vitest';
import { processCron, createPipeline, parseStep, validateStep, humanizeStep, analyzeStep } from './pipeline';

describe('pipeline integration', () => {
  const cases = [
    '* * * * *',
    '0 9 * * 1-5',
    '*/15 * * * *',
    '0 0 1 * *',
    '30 18 * * 0',
  ];

  it.each(cases)('fully processes valid expression: %s', (expr) => {
    const result = processCron(expr);
    expect(result.raw).toBe(expr);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.parsed).toBeDefined();
    expect(result.humanized).toBeTruthy();
    expect(result.analysis).toBeDefined();
  });

  it('custom pipeline with only parse and validate steps', () => {
    const pipeline = createPipeline(parseStep, validateStep);
    const result = pipeline('0 12 * * *');
    expect(result.valid).toBe(true);
    expect(result.humanized).toBeUndefined();
    expect(result.analysis).toBeUndefined();
  });

  it('custom pipeline with all steps matches processCron', () => {
    const full = createPipeline(parseStep, validateStep, humanizeStep, analyzeStep);
    const expr = '0 6 * * 1';
    const a = processCron(expr);
    const b = full(expr);
    expect(a.valid).toBe(b.valid);
    expect(a.humanized).toBe(b.humanized);
    expect(a.errors).toEqual(b.errors);
  });

  it('invalid expression propagates errors through full pipeline', () => {
    const result = processCron('0 25 * * *');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
