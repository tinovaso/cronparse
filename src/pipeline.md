# Pipeline

The `pipeline` module provides a composable, step-based processing chain for cron expressions.

## Overview

A pipeline is a sequence of transform functions applied to a shared result object. Each step can enrich, validate, or annotate the result.

## Usage

```ts
import { processCron, createPipeline, parseStep, validateStep } from './pipeline';

// Use the default pipeline
const result = processCron('0 9 * * 1-5');
console.log(result.humanized); // "At 09:00 on every weekday"
console.log(result.valid);     // true

// Build a custom pipeline
const myPipeline = createPipeline(parseStep, validateStep);
const partial = myPipeline('*/15 * * * *');
```

## Built-in Steps

| Step | Description |
|------|-------------|
| `parseStep` | Parses the raw expression into a `CronExpression` |
| `validateStep` | Runs the linter and collects errors/warnings |
| `humanizeStep` | Converts the expression to a human-readable string |
| `analyzeStep` | Runs full analysis (complexity, frequency, etc.) |

## PipelineResult

```ts
interface PipelineResult {
  raw: string;
  parsed: CronExpression;
  valid: boolean;
  errors: string[];
  warnings: string[];
  humanized: string;
  analysis: AnalysisResult;
}
```

## Custom Transforms

```ts
const myStep: PipelineTransform = (result) => {
  return { ...result, custom: 'value' };
};

const pipeline = createPipeline(parseStep, validateStep, myStep);
```

Transforms receive a `Partial<PipelineResult>` and must return one.
