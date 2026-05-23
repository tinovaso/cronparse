import {
  resolveAlias,
  registerAlias,
  listAliases,
  findAliasByExpression,
} from './alias';

describe('resolveAlias', () => {
  it('resolves built-in aliases', () => {
    expect(resolveAlias('hourly')).toBe('0 * * * *');
    expect(resolveAlias('daily')).toBe('0 0 * * *');
    expect(resolveAlias('weekly')).toBe('0 0 * * 0');
    expect(resolveAlias('monthly')).toBe('0 0 1 * *');
    expect(resolveAlias('yearly')).toBe('0 0 1 1 *');
  });

  it('returns undefined for unknown alias', () => {
    expect(resolveAlias('nonexistent')).toBeUndefined();
  });
});

describe('registerAlias', () => {
  it('registers a custom alias and resolves it', () => {
    registerAlias({
      name: 'test-custom',
      expression: '30 6 * * 1',
      description: 'Every Monday at 6:30 AM',
    });
    expect(resolveAlias('test-custom')).toBe('30 6 * * 1');
  });

  it('overwrites an existing alias', () => {
    registerAlias({ name: 'hourly', expression: '0 */1 * * *', description: 'Overridden hourly' });
    expect(resolveAlias('hourly')).toBe('0 */1 * * *');
    // restore
    registerAlias({ name: 'hourly', expression: '0 * * * *', description: 'Once per hour' });
  });
});

describe('listAliases', () => {
  it('returns an array of alias entries', () => {
    const aliases = listAliases();
    expect(Array.isArray(aliases)).toBe(true);
    expect(aliases.length).toBeGreaterThan(0);
  });

  it('each entry has name, expression, description', () => {
    listAliases().forEach((a) => {
      expect(typeof a.name).toBe('string');
      expect(typeof a.expression).toBe('string');
      expect(typeof a.description).toBe('string');
    });
  });
});

describe('findAliasByExpression', () => {
  it('finds an alias matching the given expression', () => {
    const entry = findAliasByExpression('0 0 * * *');
    expect(entry).toBeDefined();
    expect(entry?.name).toBe('daily');
  });

  it('returns undefined for unknown expression', () => {
    expect(findAliasByExpression('99 99 * * *')).toBeUndefined();
  });
});
