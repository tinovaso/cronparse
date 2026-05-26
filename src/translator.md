# Translator

The `translator` module provides multi-locale human-readable descriptions of cron expressions.

## Supported Locales

| Code | Language   |
|------|------------|
| `en` | English    |
| `es` | Spanish    |
| `fr` | French     |
| `de` | German     |

Custom locales can be registered via `locale-registry`.

## API

### `translateCron(expression: string, locale: Locale): string`

Parses and translates a cron expression string into a human-readable sentence in the given locale.

```ts
import { translateCron } from './translator';

translateCron('0 9 * * 1-5', 'es');
// → "a las 9:00 el lunes y viernes"
```

### `translateParsed(parsed: CronExpression, locale: Locale): string`

Translates an already-parsed `CronExpression` object.

### `getTranslation(locale: Locale): TranslationMap`

Returns the raw translation map for a given locale.

### `listLocales(): Locale[]`

Returns all built-in supported locale codes.

## Custom Locales

Use `locale-registry` to extend the translator with additional languages:

```ts
import { registerLocale } from './locale-registry';

registerLocale('pt', {
  every: 'todo', at: 'às', on: 'no', and: 'e', through: 'até',
  minute: 'minuto', minutes: 'minutos', hour: 'hora', hours: 'horas',
  day: 'dia', days: 'dias',
  weekday: { 0: 'domingo', 1: 'segunda', ... },
  month: { 1: 'janeiro', ... },
});
```

## TranslationMap Shape

```ts
interface TranslationMap {
  every: string;
  at: string;
  on: string;
  and: string;
  through: string;
  minute: string;
  minutes: string;
  hour: string;
  hours: string;
  day: string;
  days: string;
  weekday: Record<number, string>;
  month: Record<number, string>;
}
```
