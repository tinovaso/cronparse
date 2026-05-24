# Templater

The `templater` module provides a way to define parameterized cron expression templates using `{{variable}}` placeholders.

## API

### `createTemplate(name, description, expression)`

Creates a `CronTemplate` from an expression string containing `{{variable}}` placeholders.

```ts
const t = createTemplate('daily-at', 'Run daily at hour', '0 {{hour}} * * *');
```

### `applyTemplate(template, variables)`

Renders the template with the given variables and returns a parsed `CronExpression`.

```ts
const expr = applyTemplate(t, { hour: '9' });
// => { minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
```

### `renderTemplate(template, variables)`

Replaces `{{variable}}` placeholders in a string. Throws if a variable is missing.

### `extractVariables(template)`

Returns a deduplicated list of variable names found in a template string.

### `templateFromExpression(name, description, parsed, fieldMask)`

Converts a parsed `CronExpression` into a template by replacing specified fields with named placeholders.

```ts
const t = templateFromExpression('weekly', 'Weekly', parsed, { hour: 'runHour' });
```

## Template Registry

The `template-registry` module provides a global store for named templates.

### Built-in Templates

| Name | Expression | Variables |
|------|------------|-----------|
| `every-n-minutes` | `*/{{n}} * * * *` | `n` |
| `daily-at` | `0 {{hour}} * * *` | `hour` |
| `weekly-on` | `0 {{hour}} * * {{day}}` | `hour`, `day` |
| `monthly-on` | `0 {{hour}} {{day}} * *` | `hour`, `day` |

```ts
import { useTemplate } from './template-registry';
const expr = useTemplate('daily-at', { hour: '6' });
```
