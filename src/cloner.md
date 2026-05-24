# Cloner Module

The `cloner` module provides utilities for copying and patching cron expressions without mutating the originals.

## API

### `cloneExpression(expr: CronExpression): CronExpression`

Returns a deep copy of a parsed `CronExpression` object. Useful when you need to mutate an expression without affecting the source.

### `cloneCron(expression: string, overrides?: Partial<CronExpression>): string`

Parses a cron string, clones it, optionally merges field overrides, and returns the resulting cron string.

```ts
cloneCron('0 0 * * *');                        // '0 0 * * *'
cloneCron('0 0 * * *', parsedOverride);        // with field overrides applied
```

### `cloneMany(expression: string, count: number): string[]`

Produces `count` independent clones of a cron string. Returns an empty array if `count < 1`.

```ts
cloneMany('*/5 * * * *', 3); // ['*/5 * * * *', '*/5 * * * *', '*/5 * * * *']
```

### `cloneWithField(expression: string, field: keyof CronExpression, value: string): string`

Clones a cron string and replaces a specific field with the given raw value string.

```ts
cloneWithField('0 12 * * *', 'minute', '30'); // '30 12 * * *'
```

## Use Cases

- Safely mutating expressions in pipelines
- Generating variants of a base schedule
- Testing field substitution without side effects
