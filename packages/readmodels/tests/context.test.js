import { describe, test, expect, vi } from 'vitest';
import { initializeContext } from '../context.js';

describe('context', () => {
  test('build', () => {
    const readModels = {};
    const storageResult = {
      readLastProjectedEventTimestamps: vi.fn().mockResolvedValue(),
    };
    const storage = vi.fn().mockResolvedValue(storageResult);
    const eventBus = vi.fn().mockResolvedValue();
    return initializeContext({ readModels, storage, eventBus }).then(
      (context) => {
        expect(context).toBeDefined();
        expect(context.storage).toBeDefined();
        expect(context.commands).toBeDefined();
        expect(context.sideEffects).toBeDefined();
        expect(context.changeNotification).toBeDefined();
        expect(context.projectionHandler).toBeDefined();
        expect(eventBus).toHaveBeenCalledOnce();
      }
    );
  });
});
