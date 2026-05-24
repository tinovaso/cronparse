# Splitter

The `splitter` module decomposes cron expressions that contain comma-separated
values in one or more fields into multiple simpler expressions.

## API

### `splitField(expression, fieldIndex): SplitResult`

Splits a single field (by index) on commas, returning one expression per value.

| Field Index | Field        |
|-------------|--------------|
| 0           | minute       |
| 1           | hour         |
| 2           | day of month |
| 3           | month        |
| 4           | day of week  |

```ts
splitField('0,30 9 * * *', 0);
// { expressions: ['0 9 * * *', '30 9 * * *'], count: 2 }
```

### `splitAll(expression): SplitResult`

Fully decomposes a cron expression into atomic expressions with no
comma-separated lists in any field. Returns the Cartesian product of all
field values.

```ts
splitAll('0,30 8,20 * * *');
// { expressions: ['0 8 * * *', '0 20 * * *', '30 8 * * *', '30 20 * * *'], count: 4 }
```

### `splitByDayOfWeek(expression): SplitResult`

Convenience wrapper for `splitField` targeting the day-of-week field.

### `splitByHour(expression): SplitResult`

Convenience wrapper for `splitField` targeting the hour field.

## Use Cases

- Normalising expressions before comparison or expansion
- Generating per-day or per-hour scheduled jobs from a compact expression
- Feeding atomic expressions into the `ranker` or `analyzer` modules
