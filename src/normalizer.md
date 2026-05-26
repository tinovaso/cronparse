# Normalizer

The `normalizer` module provides utilities to canonicalize cron expressions into a consistent, human-comparable form.

## Functions

### `simplifySteps(field, max)`
Simplifies step expressions that are redundant:
- `*/1` → `*`
- `0/1` → `*`
- `*/60` → `0` (step equals or exceeds max)

### `sortField(field)`
Sorts comma-separated values in a cron field numerically (ascending).

```ts
sortField('30,5,15') // => '5,15,30'
```

### `deduplicateField(field)`
Removes duplicate entries from a comma-separated cron field.

```ts
deduplicateField('5,10,5') // => '5,10'
```

### `normalizeField(field, max)`
Applies all normalizations to a single field: alias resolution, step simplification, deduplication, and sorting.

### `normalizeCron(expression)`
Normalizes a full cron expression string into a canonical form.

```ts
normalizeCron('*/1 30,0 * * *') // => '* 0,30 * * *'
```

### `areNormalizedEqual(a, b)`
Returns `true` if two cron expressions are identical after normalization.

```ts
areNormalizedEqual('*/1 0 * * *', '* 0 * * *') // => true
```

## Use Cases

- Deduplicating stored cron expressions
- Comparing user-supplied expressions for logical equality
- Canonicalizing expressions before storage or display
