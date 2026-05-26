# Flattener

The **flattener** module converts a cron expression into a compact, sorted list of
*minute-of-week* values, making schedule comparison and analysis fast and easy.

## Minute-of-week encoding

Each value encodes a single weekly fire time:

```
minuteOfWeek = dayOfWeek * 1440 + hour * 60 + minute
```

| Day       | Range           |
|-----------|-----------------|
| Sunday    | 0 – 1439        |
| Monday    | 1440 – 2879     |
| …         | …               |
| Saturday  | 8640 – 10079    |

## API

### `flattenCron(expr: CronExpression): FlatSchedule`
Converts a parsed `CronExpression` to a sorted `FlatSchedule`.

### `flattenExpression(expression: string): FlatSchedule`
Parses a cron string and returns its flat schedule.

### `countFiringsPerWeek(expression: string): number`
Returns the total number of distinct fire times in a week.

### `avgFiringsPerDay(expression: string): number`
Returns the average number of fire times per day (firings / 7).

### `flatSchedulesEqual(a, b): boolean`
Returns `true` when two flat schedules contain exactly the same values.

### `flatDifference(a, b): FlatSchedule`
Returns entries present in `a` but absent in `b`.

### `flatIntersection(a, b): FlatSchedule`
Returns entries present in both `a` and `b`.

## Example

```ts
import { flattenExpression, countFiringsPerWeek } from 'cronparse';

const schedule = flattenExpression('0 9 * * 1-5');
console.log(countFiringsPerWeek('0 9 * * 1-5')); // 5
```
