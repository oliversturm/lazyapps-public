import { describe, test, expect, vi } from 'vitest';
import { handleCommand } from '../handleCommand';

describe('handleCommand', () => {
  test('handleCommand', () => {
    const aggregateStore = {
      getAggregateState: vi.fn(),
      applyAggregateProjection: (/*correlationId*/) =>
        vi.fn().mockImplementation((x) => x),
    };
    const eventStore = {
      addEvent: (/*correlationId*/) => vi.fn().mockImplementation((x) => x),
    };
    const eventBus = {
      publishEvent: vi.fn().mockImplementation((x) => x),
    };
    const commandHandler = vi
      .fn()
      .mockReturnValue({ type: 'DONE', flag: 'eventmixin' });

    const date = new Date(2022, 11, 22);
    vi.useFakeTimers();
    vi.setSystemTime(date);

    return handleCommand(
      aggregateStore,
      eventStore,
      eventBus,
      'CREATE',
      'thing',
      'id-1',
      {
        flag: 'payload',
      },
      commandHandler /*, auth, timestamp, correlationId */,
    ).then((res) => {
      expect(res).toEqual({
        type: 'DONE',
        flag: 'eventmixin',
        aggregateName: 'thing',
        aggregateId: 'id-1',
        timestamp: 1671667200000,
      });

      vi.useRealTimers();
    });
  });
});
