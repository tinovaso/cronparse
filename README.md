# cronparse

> Human-readable cron expression parser and scheduler utility for Node.js

[![npm version](https://img.shields.io/npm/v/cronparse)](https://www.npmjs.com/package/cronparse)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Installation

```bash
npm install cronparse
# or
yarn add cronparse
```

---

## Usage

```typescript
import { parse, describe, schedule } from 'cronparse';

// Parse a cron expression into a structured object
const parsed = parse('0 9 * * 1-5');
console.log(parsed);
// { minute: 0, hour: 9, dayOfMonth: '*', month: '*', dayOfWeek: '1-5' }

// Get a human-readable description
const description = describe('0 9 * * 1-5');
console.log(description);
// "At 09:00, Monday through Friday"

// Schedule a job using a cron expression
schedule('0 9 * * 1-5', () => {
  console.log('Good morning! Starting the workday.');
});
```

---

## API

| Function | Description |
|---|---|
| `parse(expr)` | Parses a cron string into a structured object |
| `describe(expr)` | Returns a human-readable description of the expression |
| `schedule(expr, fn)` | Schedules a callback function using the given expression |

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

[MIT](./LICENSE) © cronparse contributors