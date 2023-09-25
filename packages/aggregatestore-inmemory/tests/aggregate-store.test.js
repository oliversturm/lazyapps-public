import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { inmemory } from '..';

import { getLogger } from '@lazyapps/logger';

vi.mock('@lazyapps/logger', () => {
  const getLogger = vi.fn().mockReturnValue({
    debug: vi.fn(),
    warn: vi.fn(),
  });
  return { getLogger };
});

const aggregates = {
  thing: {
    initial: () => {
      flag: 'initial';
    },
    projections: {
      CREATED: (/*state, event*/) => ({ flag: 'created' }),
    },
  },
};

describe('applyAggregateProjection', () => {
  let log;

  beforeEach(() => {
    log = getLogger();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('apply, no trouble', () => {
    const store = inmemory()(aggregates);
    const event = {
      aggregateName: 'thing',
      aggregateId: 'id-1',
      type: 'CREATED',
      timestamp: 55,
    };
    expect(store.applyAggregateProjection(event)).toEqual(event);

    // Not the cleanest stuff to test, but it confirms
    // the algorithm does what it should. For now.
    expect(log.debug).toBeCalledTimes(1);
    expect(log.warn).toBeCalledTimes(0);
    expect(store.getAggregateState('thing', 'id-1')).toEqual({
      flag: 'created',
    });
  });

  test('no aggregate projection type', () => {
    const store = inmemory()(aggregates);
    const event = {
      aggregateName: 'thing',
      aggregateId: 'id-1',
      type: 'DOMAGIC',
      timestamp: 55,
    };
    expect(store.applyAggregateProjection(event)).toEqual(event);

    // Not the cleanest stuff to test, but it confirms
    // the algorithm does what it should. For now.
    expect(log.debug).toBeCalledTimes(1);
    expect(log.warn).toBeCalledTimes(0);
    expect(store.getAggregateState('thing', 'id-1')).toBeUndefined();
  });

  test('event out of sequence', () => {
    const store = inmemory()(aggregates);
    const event1 = {
      aggregateName: 'thing',
      aggregateId: 'id-1',
      type: 'CREATED',
      timestamp: 55,
    };
    store.applyAggregateProjection(event1);
    const event2 = {
      aggregateName: 'thing',
      aggregateId: 'id-2',
      type: 'CREATED',
      timestamp: 33,
    };
    expect(() => store.applyAggregateProjection(event2)).toThrowError(
      'Event out of sequence'
    );
  });

  test('random event order allowed in replay', () => {
    const store = inmemory()(aggregates);
    const event1 = {
      aggregateName: 'thing',
      aggregateId: 'id-1',
      type: 'CREATED',
      timestamp: 55,
    };
    store.applyAggregateProjection(event1);
    const event2 = {
      aggregateName: 'thing',
      aggregateId: 'id-2',
      type: 'CREATED',
      timestamp: 33,
    };
    store.startReplay();
    store.applyAggregateProjection(event2);
  });
});
