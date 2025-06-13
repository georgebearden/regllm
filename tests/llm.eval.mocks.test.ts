
// !IMPORTANT - mock ollama calls before referencing it (in LlmEvaluator)
jest.mock('ollama', () => ({
  generate: jest.fn(() => Promise.resolve({ response: JSON.stringify({passed: true, comment: ''}) }))
}));

import { LlmEvalInput, LlmEvaluator } from '../src/llm.eval';
import ollama from 'ollama';


describe('LlmEvaluatorMocks', () => {
  describe('with overridden options', () => {
    let evaluator: LlmEvaluator;
    
    beforeEach(() => {
      evaluator = new LlmEvaluator({
        model: 'llama3.2:latest',
        options: {
          num_ctx: 250
        }
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it.only('should use custom context size in generate call', async () => {
      const testCase: LlmEvalInput = {
        input: 'does not matter for mock',
        actual_output: 'does not matter for mock',
        reference_output: 'does not matter for mock',
      };

      await evaluator.eval(testCase);

      expect(ollama.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'llama3.2:latest',
          options: {
            num_ctx: 250
          }
        })
      );
    });
  });
});      
