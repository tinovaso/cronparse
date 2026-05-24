# Grouper

The `grouper` module provides utilities to cluster cron expressions by shared field patterns or computed properties.

## API

### `groupByMinute(expressions: string[]): Record<string, string[]>`

Groups expressions by their **minute** field value.

```ts
groupByMinute(['0 9 * * *', '0 10 * * *', '30 9 * * *']);
// { '0': ['0 9 * * *', '0 10 * * *'], '30': ['30 9 * * *'] }
```

### `groupByHour(expressions: string[]): Record<string, string[]>`

Groups expressions by their **hour** field value.

### `groupByDayOfWeek(expressions: string[]): Record<string, string[]>`

Groups expressions by their **day-of-week** field value.

### `groupByFrequency(expressions: string[]): Record<string, string[]>`

Buckets expressions by how often they fire per day:

| Bucket | Fires per day |
|--------|--------------|
| `once` | 1 |
| `few` | 2–6 |
| `hourly` | 7–24 |
| `frequent` | 25+ |

```ts
groupByFrequency(['0 9 * * *', '0 * * * *']);
// { once: ['0 9 * * *'], frequent: ['0 * * * *'] }
```

### `groupBy(expressions, classifier): CronGroup[]`

Generic grouper that accepts a custom classifier function receiving the raw expression and its parsed form.

```ts
groupBy(exprs, (_expr, parsed) => parsed.dayOfWeek === '*' ? 'everyday' : 'specific');
```

## Use Cases

- Organising a large set of scheduled jobs by run-time pattern
- Dashboard bucketing for frequency visualisation
- Pre-processing step before merging or comparing cron sets
