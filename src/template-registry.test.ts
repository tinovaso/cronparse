import {
  registerTemplate,
  unregisterTemplate,
  getTemplate,
  listTemplates,
  useTemplate,
  clearTemplates,
} from './template-registry';
import { createTemplate } from './templater';

beforeEach(() => {
  // Remove custom templates but keep builtins by re-importing
  // We only clean up custom ones added in tests
  unregisterTemplate('custom-test');
  unregisterTemplate('another-test');
});

describe('registerTemplate', () => {
  it('registers a new template', () => {
    const t = createTemplate('custom-test', 'desc', '{{m}} * * * *');
    registerTemplate(t);
    expect(getTemplate('custom-test')).toBeDefined();
    unregisterTemplate('custom-test');
  });

  it('throws on duplicate name', () => {
    const t = createTemplate('custom-test', 'desc', '{{m}} * * * *');
    registerTemplate(t);
    expect(() => registerTemplate(t)).toThrow('already registered');
    unregisterTemplate('custom-test');
  });
});

describe('getTemplate', () => {
  it('returns undefined for unknown template', () => {
    expect(getTemplate('nonexistent')).toBeUndefined();
  });

  it('returns builtin template', () => {
    expect(getTemplate('daily-at')).toBeDefined();
  });
});

describe('listTemplates', () => {
  it('includes builtin templates', () => {
    const names = listTemplates().map((t) => t.name);
    expect(names).toContain('daily-at');
    expect(names).toContain('every-n-minutes');
  });
});

describe('useTemplate', () => {
  it('applies variables to builtin template', () => {
    const result = useTemplate('daily-at', { hour: '10' });
    expect(result.hour).toBe('10');
    expect(result.minute).toBe('0');
  });

  it('throws for unknown template', () => {
    expect(() => useTemplate('ghost', {})).toThrow("Template 'ghost' not found");
  });
});

describe('unregisterTemplate', () => {
  it('returns false when template does not exist', () => {
    expect(unregisterTemplate('nope')).toBe(false);
  });
});
