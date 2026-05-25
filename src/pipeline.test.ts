import { describe, it, expect } from 'vitest';
import {
  createPipeline,
  parseStep,
  validateStep,
  humanizeStep,
  analyzeStep,
  processCron,
  PipelineTransform,
} from './pipeline';

describe('createPipeline', () => {
  it('runs transforms in order', () => {
    const log: string[] = [];
    const a: PipelineTransform = (r) => { log.push('a'); return r; };
    const b: PipelineTransform = (r) => { log.push('b'); return r; };
    const pipeline = createPipeline(a, b);
    pipeline('* * * * *');
    expect(log).toEqual(['a', 'b']);
  });

  it('passes result between steps', () => {
    const addFoo: PipelineTransform = (r) => ({ ...r, foo: 1 } as any);
    const addBar: PipelineTransform = (r) => ({ ...r, bar: (r as any).foo + 1 } as any);
    const pipeline = createPipeline(addFoo, addBar);
    const result = pipeline('* * * * *') as any;
    expect(result.bar).toBe(2);
  });
});

describe('parseStep', () => {
  it('parses a valid expression', () => {
    const result = parseStep({ raw: '0 9 * * 1' });
    expect(result.parsed).toBeDefined();
  });

  it('handles invalid expression gracefully', () => {
    const result = parseStep({ raw: 'not-a-cron' });
    expect(result.parsed).toBeUndefined();
  });
});

describe('validateStep', () => {
  it('marks valid expression as valid', () => {
    const result = validateStep({ raw: '0 9 * * 1' });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('marks invalid expression with errors', () => {
    const result = validateStep({ raw: '99 * * * *' });
    expect(result.valid).toBe(false);
    expect(result.errors!.length).toBeGreaterThan(0);
  });
});

describe('processCron', () => {
  it('returns full pipeline result for valid expression', () => {
    const result = processCron('0 9 * * 1-5');
    expect(result.raw).toBe('0 9 * * 1-5');
    expect(result.valid).toBe(true);
    expect(result.humanized).toBeTruthy();
    expect(result.analysis).toBeDefined();
  });

  it('returns errors for invalid expression', () => {
    const result = processCron('60 * * * *');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
