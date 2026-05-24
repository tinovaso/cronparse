import { summarize, summarizeMultiple, CronSummary } from './summarizer';

describe('summarize', () => {
  const fixedDate = new Date('2024-01-15T10:00:00Z');

  it('returns a summary object with all expected fields', () => {
    const summary = summarize('0 9 * * 1-5', fixedDate);
    expect(summary).toHaveProperty('expression', '0 9 * * 1-5');
    expect(summary).toHaveProperty('humanReadable');
    expect(summary).toHaveProperty('nextRuns');
    expect(summary).toHaveProperty('medianIntervalMinutes');
    expect(summary).toHaveProperty('isUniform');
    expect(summary).toHaveProperty('complexity');
    expect(summary).toHaveProperty('fieldBreakdown');
  });

  it('fieldBreakdown contains all five fields', () => {
    const summary = summarize('*/5 * * * *', fixedDate);
    const { fieldBreakdown } = summary;
    expect(fieldBreakdown).toHaveProperty('minute');
    expect(fieldBreakdown).toHaveProperty('hour');
    expect(fieldBreakdown).toHaveProperty('dayOfMonth');
    expect(fieldBreakdown).toHaveProperty('month');
    expect(fieldBreakdown).toHaveProperty('dayOfWeek');
  });

  it('describes wildcard field as "every"', () => {
    const summary = summarize('* * * * *', fixedDate);
    expect(summary.fieldBreakdown.minute).toBe('every');
    expect(summary.fieldBreakdown.hour).toBe('every');
  });

  it('describes step field correctly', () => {
    const summary = summarize('*/15 */2 * * *', fixedDate);
    expect(summary.fieldBreakdown.minute).toBe('every 15');
    expect(summary.fieldBreakdown.hour).toBe('every 2');
  });

  it('describes range field correctly', () => {
    const summary = summarize('0 9 * * 1-5', fixedDate);
    expect(summary.fieldBreakdown.dayOfWeek).toBe('range(1-5)');
  });

  it('describes list field correctly', () => {
    const summary = summarize('0 9,12,18 * * *', fixedDate);
    expect(summary.fieldBreakdown.hour).toBe('list(3)');
  });

  it('describes fixed field correctly', () => {
    const summary = summarize('0 9 1 1 *', fixedDate);
    expect(summary.fieldBreakdown.minute).toBe('fixed(0)');
    expect(summary.fieldBreakdown.hour).toBe('fixed(9)');
  });

  it('nextRuns is an array', () => {
    const summary = summarize('0 0 * * *', fixedDate);
    expect(Array.isArray(summary.nextRuns)).toBe(true);
  });

  it('nextRuns contains Date objects', () => {
    const summary = summarize('0 0 * * *', fixedDate);
    summary.nextRuns.forEach((run) => {
      expect(run).toBeInstanceOf(Date);
    });
  });

  it('nextRuns are in ascending order', () => {
    const summary = summarize('*/30 * * * *', fixedDate);
    for (let i = 1; i < summary.nextRuns.length; i++) {
      expect(summary.nextRuns[i].getTime()).toBeGreaterThan(summary.nextRuns[i - 1].getTime());
    }
  });

  it('complexity is a number', () => {
    const summary = summarize('*/5 * * * *', fixedDate);
    expect(typeof summary.complexity).toBe('number');
  });
});

describe('summarizeMultiple', () => {
  const fixedDate = new Date('2024-01-15T10:00:00Z');

  it('returns an array of summaries', () => {
    const results = summarizeMultiple(['* * * * *', '0 9 * * 1-5'], fixedDate);
    expect(results).toHaveLength(2);
    expect(results[0].expression).toBe('* * * * *');
    expect(results[1].expression).toBe('0 9 * * 1-5');
  });

  it('returns empty array for empty input', () => {
    const results = summarizeMultiple([], fixedDate);
    expect(results).toHaveLength(0);
  });
});
