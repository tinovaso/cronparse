import { parseCron } from './parser';
import { validateExpression } from './validator';
import { humanize } from './humanize';
import { analyze } from './analyzer';
import { lint } from './linter';
import { CronExpression } from './types';

export interface PipelineStep<T, R> {
  name: string;
  run: (input: T) => R;
}

export interface PipelineResult {
  raw: string;
  parsed: CronExpression;
  valid: boolean;
  errors: string[];
  warnings: string[];
  humanized: string;
  analysis: ReturnType<typeof analyze>;
}

export type PipelineTransform = (result: Partial<PipelineResult>) => Partial<PipelineResult>;

export function createPipeline(...transforms: PipelineTransform[]) {
  return function runPipeline(expression: string): PipelineResult {
    let result: Partial<PipelineResult> = { raw: expression };
    for (const transform of transforms) {
      result = transform(result);
    }
    return result as PipelineResult;
  };
}

export const parseStep: PipelineTransform = (result) => {
  try {
    const parsed = parseCron(result.raw!);
    return { ...result, parsed };
  } catch {
    return { ...result, parsed: undefined as any };
  }
};

export const validateStep: PipelineTransform = (result) => {
  const lintResult = lint(result.raw!);
  return {
    ...result,
    valid: lintResult.valid,
    errors: lintResult.errors,
    warnings: lintResult.warnings,
  };
};

export const humanizeStep: PipelineTransform = (result) => {
  if (!result.parsed) return { ...result, humanized: '' };
  try {
    return { ...result, humanized: humanize(result.raw!) };
  } catch {
    return { ...result, humanized: '' };
  }
};

export const analyzeStep: PipelineTransform = (result) => {
  if (!result.parsed) return result;
  try {
    return { ...result, analysis: analyze(result.raw!) };
  } catch {
    return result;
  }
};

export const defaultPipeline = createPipeline(
  parseStep,
  validateStep,
  humanizeStep,
  analyzeStep
);

export function processCron(expression: string): PipelineResult {
  return defaultPipeline(expression);
}
