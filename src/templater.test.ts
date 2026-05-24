import {
  extractVariables,
  renderTemplate,
  createTemplate,
  applyTemplate,
  templateFromExpression,
} from './templater';
import { parseCron } from './parser';

describe('extractVariables', () => {
  it('extracts single variable', () => {
    expect(extractVariables('{{minute}} * * * *')).toEqual(['minute']);
  });

  it('extracts multiple unique variables', () => {
    expect(extractVariables('{{m}} {{h}} * * *')).toEqual(['m', 'h']);
  });

  it('deduplicates repeated variables', () => {
    expect(extractVariables('{{x}} {{x}} * * *')).toEqual(['x']);
  });

  it('returns empty array when no variables', () => {
    expect(extractVariables('0 * * * *')).toEqual([]);
  });
});

describe('renderTemplate', () => {
  it('replaces variables with values', () => {
    expect(renderTemplate('{{m}} {{h}} * * *', { m: '0', h: '9' })).toBe(
      '0 9 * * *'
    );
  });

  it('throws on missing variable', () => {
    expect(() => renderTemplate('{{m}} * * * *', {})).toThrow(
      'Missing variable: m'
    );
  });
});

describe('createTemplate', () => {
  it('creates template with extracted variables', () => {
    const t = createTemplate('daily', 'Run daily', '0 {{hour}} * * *');
    expect(t.name).toBe('daily');
    expect(t.variables).toEqual({ hour: '*' });
  });
});

describe('applyTemplate', () => {
  it('applies variables and parses expression', () => {
    const t = createTemplate('test', 'Test', '{{m}} {{h}} * * *');
    const result = applyTemplate(t, { m: '30', h: '8' });
    expect(result.minute).toBe('30');
    expect(result.hour).toBe('8');
  });
});

describe('templateFromExpression', () => {
  it('creates template from parsed expression with field mask', () => {
    const parsed = parseCron('0 9 * * 1');
    const t = templateFromExpression('weekly', 'Weekly job', parsed, {
      hour: 'runHour',
    });
    expect(t.expression).toContain('{{runHour}}');
    expect(t.expression).toContain('0');
  });
});
