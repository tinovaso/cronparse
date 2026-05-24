# Ranker

The `ranker` module scores and ranks cron expressions by human-readability and simplicity.

## API

### `scoreCron(expression: string): RankResult`

Scores a single cron expression from 0–100. Returns an object with:

- `expression` — the original expression
- `score` — numeric score (higher = more readable)
- `reasons` — list of human-readable explanations for score adjustments

**Scoring factors:**

| Factor | Effect |
|---|---|
| High complexity | Penalty: `(complexity - 5) * 8` |
| Wildcard fields (≥3) | Bonus: `wildcardCount * 3` |
| Many minute values (>30) | Penalty: `-20` |
| Step syntax (`/`) | Bonus: `stepCount * 5` |
| Long comma lists (>4) | Penalty: `listCount * 2` |

### `rankCrons(expressions: string[]): RankResult[]`

Ranks multiple expressions from most to least readable.

```ts
const ranked = rankCrons(['*/5 * * * *', '1,3,5,7 * * * *', '0 0 * * *']);
console.log(ranked[0].expression); // most readable
```

### `bestCron(expressions: string[]): string`

Returns the most readable expression from a list. Throws if the list is empty.

```ts
const best = bestCron(['*/15 * * * *', '0,15,30,45 * * * *']);
console.log(best); // '*/15 * * * *'
```

## Use Cases

- Suggest the simplest equivalent expression after merging or diffing
- Rank user-submitted cron expressions for a UI
- Automatically select the most legible form from generated alternatives
