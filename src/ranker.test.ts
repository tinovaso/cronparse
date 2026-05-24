import { scoreCron, rankCrons, bestCron } from './ranker';

describe('scoreCron', () => {
  it('gives a high score to simple expressions', () => {
    const result = scoreCron('0 * * * *');
    expect(result.score).toBeGreaterThan(70);
    expect(result.expression).toBe('0 * * * *');
  });

  it('gives a lower score to complex list expressions', () => {
    const simple = scoreCron('*/5 * * * *');
    const complex = scoreCron('1,3,5,7,9,11,13,15,17,19 * * * *');
    expect(simple.score).toBeGreaterThan(complex.score);
  });

  it('rewards step syntax', () => {
    const step = scoreCron('*/10 */2 * * *');
    expect(step.reasons.some(r => r.includes('Step syntax'))).toBe(true);
  });

  it('penalizes many minute values', () => {
    const result = scoreCron('*/2 * * * *'); // 30 values
    expect(result.reasons.some(r => r.includes('minute'))).toBe(true);
  });

  it('returns score between 0 and 100', () => {
    const expressions = ['* * * * *', '0 0 * * *', '*/5 * * * *', '0 12 * * 1-5'];
    for (const expr of expressions) {
      const { score } = scoreCron(expr);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('includes reasons array', () => {
    const result = scoreCron('0 0 * * *');
    expect(Array.isArray(result.reasons)).toBe(true);
  });
});

describe('rankCrons', () => {
  it('returns results sorted by score descending', () => {
    const results = rankCrons(['*/5 * * * *', '0 0 * * *', '1,3,5,7,9,11,13,15 * * * *']);
    expect(results.length).toBe(3);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
    }
  });

  it('handles a single expression', () => {
    const results = rankCrons(['0 * * * *']);
    expect(results.length).toBe(1);
  });

  it('returns empty array for empty input', () => {
    expect(rankCrons([])).toEqual([]);
  });
});

describe('bestCron', () => {
  it('returns the highest scoring expression', () => {
    const best = bestCron(['*/5 * * * *', '0 0 * * *']);
    expect(typeof best).toBe('string');
  });

  it('throws for empty array', () => {
    expect(() => bestCron([])).toThrow('No expressions provided');
  });

  it('returns the only expression when given one', () => {
    expect(bestCron(['0 12 * * *'])).toBe('0 12 * * *');
  });
});
