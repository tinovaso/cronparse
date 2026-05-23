/**
 * Integration tests: converter + alias working together.
 */
import { toParsed, toQuartzExpression, intervalToExpression } from './converter';
import { resolveAlias, findAliasByExpression } from './alias';

describe('converter + alias integration', () => {
  it('resolves alias then parses the expression', () => {
    const expr = resolveAlias('daily')!;
    const parsed = toParsed(expr);
    expect(parsed.minute).toBe('0');
    expect(parsed.hour).toBe('0');
  });

  it('converts interval to expression and finds matching alias', () => {
    const expr = intervalToExpression(1800); // 30 minutes
    expect(expr).toBe('*/30 * * * *');
    const alias = findAliasByExpression(expr);
    expect(alias?.name).toBe('every-30-minutes');
  });

  it('converts alias expression to Quartz format', () => {
    const expr = resolveAlias('monthly')!;
    const quartz = toQuartzExpression(expr);
    expect(quartz).toBe('0 0 0 1 * *');
  });

  it('roundtrips: preset -> expression -> Quartz', () => {
    const quartz = toQuartzExpression('@weekly');
    expect(quartz).toBe('0 0 0 * * 0');
  });

  it('interval expression is parseable', () => {
    const expr = intervalToExpression(3600); // 1 hour
    const parsed = toParsed(expr);
    expect(parsed.minute).toBe('0');
    expect(parsed.hour).toBe('*/1');
  });
});
