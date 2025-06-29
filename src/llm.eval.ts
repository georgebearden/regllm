import ollama, { Options } from 'ollama';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';


const LlmEvalResponseSchema = z.object({
  passed: z.boolean(),
  comment: z.string(),
});

export type LlmEvalOutput = z.infer<typeof LlmEvalResponseSchema>;

export interface LlmEvalInput {
  input: string;
  actual_output: string;
  reference_output: string;
}

export interface LlmEvaluatorProps {
  readonly model: string;
  readonly options?: Partial<Options>;
}

export class LlmEvaluator {

  constructor(private readonly props: LlmEvaluatorProps) { }

  async eval(params: LlmEvalInput): Promise<LlmEvalOutput> {
    const prompt = this.buildEvalPrompt(params);
    
    try {
      const response = await ollama.generate({
        model: this.props.model,
        options: this.props.options,
        prompt,
        format: zodToJsonSchema(LlmEvalResponseSchema)
      });

      const parsedResponse = JSON.parse(response.response);
      const validatedResponse = LlmEvalResponseSchema.parse(parsedResponse);
      return validatedResponse;
    } catch (error) {
      throw new Error(`Llm evaluation failed: ${error}`);
    }
  }

  private buildEvalPrompt(params: LlmEvalInput): string {
    const { input, actual_output, reference_output } = params;

    // this correctness evaluation prompt is from: https://github.com/langchain-ai/openevals/blob/ed84cc206361aba35097876ec7f0ad0d7474d85b/js/src/prompts/correctness.ts
    return `You are an expert data labeler evaluating model outputs for correctness. Your task is to assign a score based on the following rubric:

<Rubric>
  A correct answer:
  - Provides accurate and complete information
  - Contains no factual errors
  - Addresses all parts of the question
  - Is logically consistent
  - Uses precise and accurate terminology

  When scoring, you should penalize:
  - Factual errors or inaccuracies
  - Incomplete or partial answers
  - Misleading or ambiguous statements
  - Incorrect terminology
  - Logical inconsistencies
  - Missing key information
</Rubric>

<Instructions>
  - Carefully read the input and output
  - Check for factual accuracy and completeness
  - Focus on correctness of information rather than style or verbosity
</Instructions>

<Reminder>
  The goal is to evaluate factual correctness and completeness of the response.
</Reminder>

<input>
  ${input}
</input>

<output>
  ${actual_output}
</output>

Use the reference outputs below to help you evaluate the correctness of the response:

<reference_outputs>
  ${reference_output}
</reference_outputs>
`;
  }
}