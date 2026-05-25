# Throttler

The `throttler` module provides utilities to validate whether a cron expression
respects configurable rate limits before it is registered or executed.

## API

### `throttleCheck(expression, options): ThrottleResult`

Checks a cron expression against throttle constraints.

**Options:**

| Option | Type | Description |
|---|---|---|
| `maxPerHour` | `number` | Maximum allowed fires per hour |
| `maxPerDay` | `number` | Maximum allowed fires per 24-hour window |
| `minIntervalMinutes` | `number` | Minimum minutes between any two fires |

**Returns** a `ThrottleResult`:

```ts
{
  allowed: boolean;          // Whether the expression passes all checks
  reason?: string;           // Human-readable explanation if blocked
  suggestedExpression?: string; // A less frequent alternative expression
}
```

## Example

```ts
import { throttleCheck } from 'cronparse';

const result = throttleCheck('*/2 * * * *', {
  maxPerHour: 10,
  minIntervalMinutes: 5,
});

if (!result.allowed) {
  console.warn(result.reason);
  console.log('Try:', result.suggestedExpression);
}
```

## Use Cases

- Prevent runaway jobs from overloading downstream services
- Enforce SLA-based scheduling policies
- Suggest safer alternatives when user input is too aggressive
