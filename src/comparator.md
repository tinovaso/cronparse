# Comparator Module

The `comparator` module provides set-based comparison utilities for cron expressions.

## API

### `compareCron(a: string, b: string): CompareResult`

Compares two cron expressions and returns a detailed `CompareResult` object:

| Field          | Type       | Description                                          |
|----------------|------------|------------------------------------------------------|
| `isEqual`      | `boolean`  | Both expressions fire at exactly the same times      |
| `isSubset`     | `boolean`  | Every firing of `a` is also a firing of `b`          |
| `isSuperset`   | `boolean`  | Every firing of `b` is also a firing of `a`          |
| `overlapCount` | `number`   | Number of overlapping minute-slots per week          |
| `onlyInA`      | `number[]` | Minute-slots (0–10079) present in `a` but not `b`   |
| `onlyInB`      | `number[]` | Minute-slots (0–10079) present in `b` but not `a`   |

### `isSupersetOf(a: string, b: string): boolean`

Returns `true` if `a` fires on every occasion that `b` fires (or more).

### `isSubsetOf(a: string, b: string): boolean`

Returns `true` if `a` fires only on occasions that `b` also fires.

## How It Works

Expressions are expanded via `expandCron` and mapped to a set of *minute-slots*,
where each slot is `dayOfWeek * 1440 + hour * 60 + minute` (range 0–10079).
Set operations are then applied to produce the comparison result.

## Example

```ts
import { compareCron, isSupersetOf } from 'cronparse';

const result = compareCron('0 * * * *', '0/30 * * * *');
console.log(result.isSubset);   // true  — hourly is a subset of every-30-min
console.log(result.overlapCount); // 168 (once per hour × 7 days)

console.log(isSupersetOf('*/15 * * * *', '0 * * * *')); // true
```
