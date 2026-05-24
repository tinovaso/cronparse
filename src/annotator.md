# Annotator & Linter

The `annotator` and `linter` modules provide structured inspection and quality feedback for cron expressions.

## annotator.ts

### `annotateField(name, raw): FieldAnnotation`
Returns metadata about a single cron field:
- `field` — field name (e.g. `minute`, `hour`)
- `raw` — raw string value
- `description` — human-readable description via `describeField`
- `isWildcard`, `isStep`, `isRange`, `isList` — structural flags

### `annotate(expression): CronAnnotation`
Annotates a full cron expression:
- `fields` — array of `FieldAnnotation` for each field
- `summary` — concatenated description of non-wildcard fields
- `warnings` — advisory messages (e.g. conflicting dom/dow)

## linter.ts

### `lint(expression): LintResult`
Runs structural and semantic checks on a cron expression.

Returns:
- `valid` — whether the expression parses successfully
- `issues` — array of `LintIssue` with `severity` (`error | warning | info`), optional `field`, and `message`

### Checks performed
| Severity | Condition |
|----------|-----------|
| `error`  | Expression fails to parse |
| `warning`| Both day-of-month and day-of-week are non-wildcard |
| `info`   | Expression runs every day (dom and dow both `*`) |
| `info`   | Step value is `1` (equivalent to wildcard) |

## Example

```ts
import { annotate } from './annotator';
import { lint } from './linter';

const annotation = annotate('*/5 9-17 * * 1-5');
console.log(annotation.summary);
// => "every 5 minutes, between 09:00 and 17:00, Monday through Friday"

const result = lint('0 0 1 * 1');
console.log(result.issues);
// => [{ severity: 'warning', message: 'Both day-of-month and day-of-week are specified...' }]
```
