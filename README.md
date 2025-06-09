# regllm

regllm is a library for running offline regression tests on Large Language Model (LLM) responses using Ollama and Zod.

## Installing regllm

```
npm i regllm
```

## Overview

The core of this framework is the `LlmEvaluator` class (found in `src/llm.eval.ts`). This class takes an input prompt, the actual output from your LLM engine/framework/tool, and a reference output. It then uses `ollama` to evaluate the actual output against the reference output, using `zod` for structured outputs.

## Getting Started (Examples)


regllm is a single file library (`src/llm.eval.ts`). Below are a few example usages, with additional examples in the included test suite (`tests/llm.eval.test.ts`).

```typescript
import { LlmEvaluator, LlmEvalInput } from "regllm"

async function runEvaluation() {
  const evaluator = new LlmEvaluator('llama3.2:latest');

  const evalInput: LlmEvalInput = {
    input: "What is the capital of France?",
    actual_output: "Paris is the capital of France.",
    reference_output: "The capital of France is Paris."
  };

  const result = await evaluator.eval(evalInput);
  console.log(`llm response passed: ${result.passed}`)
}

runEvaluation();
```

A more advanced use-case where this library can be utilized is where you want to validate the generated response from your own LLM use within your own applications. 

```typescript
import { LlmEvaluator, LlmEvalInput } from "regllm"

describe('LlmEngine', () => {
  let evaluator: LlmEvaluator;
  let yourFancyLlmEngine: FancyLlmEngine;
  beforeAll(() => {
    evaluator = new LlmEvaluator('llama3.2:latest');
    yourFancyLlmEngine = {};
  })

  it(' uses resume and job description artifacts to find the best candidate', async () => {
    const input = "Using the following set of candidate resume artifacts ${process.env.RESUME_ARTIFACTS_CONTENT}, help me find the single best candidate for the following job description: ${process.env.JOB_DESCRIPTION_CONTENT}";
    
    // call your llm engine with the input
    const actual_output = await yourFancyLlmEngine.call(input);

    // construct the llm evaluation criteria (original input, actual output provided by your llm engine and the expected response)
    const evalInput: LlmEvalInput = {
      input,
      actual_output,
      reference_output: "The best candidate for the provided job description is Abraham Lincoln"
    };

    // evaluate the response from your llm engine, making sure the actual response is inline with the expected response
    const result = await evaluator.eval(evalInput);
    expect(result.passed).toBeTruthy();
  });
})
```

