import { LlmEvalInput, LlmEvaluator } from '../src/llm.eval';

jest.setTimeout(120000); // 2 minute timeout for ollama-based LLM calls

describe('LlmEvaluator', () => {
  describe('with default options', () => {
    let evaluator: LlmEvaluator;

    beforeAll(() => {
      evaluator = new LlmEvaluator({
        model: 'llama3.2:latest'
      });
    });

    it('should return false when actual_output is empty', async () => {
      const testCase: LlmEvalInput = {
        input: 'Hello, how are you?',
        actual_output: '',
        reference_output: `Hello! I'm doing well, thank you for asking. How are you?`,
      };

      const result = await evaluator.eval(testCase);
      expect(result.passed).toBeFalsy();
    });

    it('should validate evaluation response schema', async () => {
      const testCase: LlmEvalInput = {
        input: 'Test input',
        actual_output: 'Test output',
        reference_output: 'Test reference',
      };

      const result = await evaluator.eval(testCase);

      // Verify all required fields are present
      expect(typeof result.comment).toBe('string');
      expect(typeof result.passed).toBe('boolean');
    });

    it('should evaluate simple math with correct answer', async () => {
      const testCase: LlmEvalInput = {
        input: 'What is 15 + 27?',
        actual_output: '42',
        reference_output: '42',
      };

      const result = await evaluator.eval(testCase);
      expect(result.passed).toBeTruthy();
    }); 

    it('should evaluate simple math with incorrect answer', async () => {
      const testCase: LlmEvalInput = {
        input: 'What is 15 + 27?',
        actual_output: '41', // Wrong answer
        reference_output: '42',
      };

      const result = await evaluator.eval(testCase);
      expect(result.passed).toBeFalsy();
    });
  });
});      
