import { describe, test, expect, vi, afterEach, beforeEach } from 'vitest';
import { testing } from '../projections.js';

import { getLogger } from '@lazyapps/logger';

const {
  collectProjections,
  logProjections,
  updateInternalReadModelTimestamps,
  updateTimestamp,
  handleProjections,
} = testing;

vi.mock('@lazyapps/logger', () => {
  const getLogger = vi.fn().mockReturnValue({
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  });
  return { getLogger };
});

describe('collectProjections', () => {
  let log;

  beforeEach(() => {
    log = getLogger();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('find two', () => {
    const readModels = {
      rm1: {
        projections: {
          event1: () => 'projection result 1',
          event2: () => 'projection result 2',
        },
      },
      rm2: {
        projections: {
          event1: () => 'projection result 3',
          event2: () => 'projection result 4',
        },
      },
    };
    return collectProjections(
      readModels,
      { type: 'event1', timestamp: 4 },
      false
    ).then((projections) => {
      expect(projections).toBeDefined();
      expect(projections).toStrictEqual([
        ['rm1', readModels.rm1.projections.event1],
        ['rm2', readModels.rm2.projections.event1],
      ]);
    });
  });

  test('find none', () => {
    const readModels = {
      rm1: {
        projections: {
          event1: () => 'projection result 1',
          event2: () => 'projection result 2',
        },
      },
      rm2: {
        projections: {
          event1: () => 'projection result 3',
          event2: () => 'projection result 4',
        },
      },
    };
    return collectProjections(
      readModels,
      { type: 'event3', timestamp: 4 },
      false
    ).then((projections) => {
      expect(projections).toBeDefined();
      expect(projections).toStrictEqual([]);
    });
  });

  test('ignore read model without projections', () => {
    const readModels = {
      rm1: {
        projections: {
          event1: () => 'projection result 1',
          event2: () => 'projection result 2',
        },
      },
      rm2: {},
    };
    return collectProjections(
      readModels,
      { type: 'event1', timestamp: 4 },
      false
    ).then((projections) => {
      expect(projections).toBeDefined();
      expect(projections).toStrictEqual([
        ['rm1', readModels.rm1.projections.event1],
      ]);
    });
  });

  test('log error and ignore event out of sequence', () => {
    const readModels = {
      rm1: {
        lastProjectedEventTimestamp: 10,
        projections: {
          event1: () => 'projection result 1',
          event2: () => 'projection result 2',
        },
      },
      rm2: {},
    };
    return collectProjections(
      readModels,
      { type: 'event1', timestamp: 4 },
      false
    ).then((projections) => {
      expect(projections).toBeDefined();
      expect(projections).toStrictEqual([]);
      expect(log.error).toBeCalledTimes(1);
    });
  });
});

describe('logProjections', () => {
  let log;

  beforeEach(() => {
    log = getLogger();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('empty list', () => {
    const projs = [];
    expect(logProjections(false)(projs)).toBe(projs);
    expect(log.debug).toHaveBeenCalledTimes(0);
  });

  test('inReplay false', () => {
    const projs = [['rm1'], ['rm2']];
    expect(logProjections(false)(projs)).toBe(projs);
    expect(log.debug).toHaveBeenCalledWith(
      'Projecting event for read models: ["rm1","rm2"] (inReplay=false)'
    );
  });

  test('inReplay true', () => {
    const projs = [['rm1'], ['rm2']];
    expect(logProjections(true)(projs)).toBe(projs);
    expect(log.debug).toHaveBeenCalledWith(
      'Projecting event for read models: ["rm1","rm2"] (inReplay=true)'
    );
  });
});

describe('updateInternalReadModelTimestamps', () => {
  test('update', () => {
    const event = { type: 'event1', timestamp: 5 };
    const readModels = {
      rm1: { lastProjectedEventTimestamp: 3 },
      rm2: { lastProjectedEventTimestamp: 13 },
      rm3: { lastProjectedEventTimestamp: 99 },
    };

    const projections = [['rm1'], ['rm2']];
    return updateInternalReadModelTimestamps(
      event,
      readModels
    )(projections).then((projs) => {
      expect(projs).toBe(projections);
      expect(readModels.rm1.lastProjectedEventTimestamp).toEqual(5);
      // this value has been changed downwards
      // that's the implementation - probably
      // shouldn't normally happen, but let's
      // document it for now
      expect(readModels.rm2.lastProjectedEventTimestamp).toEqual(5);
      // this one is untouched
      expect(readModels.rm3.lastProjectedEventTimestamp).toEqual(99);
    });
  });
});

describe('updateTimestamp', () => {
  test('update', () => {
    const storage = {
      updateLastProjectedEventTimestamps: vi.fn().mockResolvedValue(),
    };
    return updateTimestamp(storage, 'rm1', 99).then(() => {
      // any result we receive is irrelevant and depends on what the
      // read model projection does
      expect(storage.updateLastProjectedEventTimestamps).toHaveBeenCalledWith(
        ['rm1'],
        99
      );
    });
  });
});

describe('handleProjections', () => {
  let log;

  beforeEach(() => {
    log = getLogger();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const projContext = {};
  const getProjectionContext = () => vi.fn().mockReturnValue(projContext);
  const context = {
    storage: {
      updateLastProjectedEventTimestamps: vi.fn().mockResolvedValue(),
    },
  };
  const event = { timestamp: 10 };

  test('all good', () => {
    const f1 = vi.fn().mockResolvedValue();
    const f2 = vi.fn().mockResolvedValue();
    const projections = [
      ['rm1', f1],
      ['rm2', f2],
    ];
    return handleProjections(
      context,
      getProjectionContext,
      false,
      event
    )(projections).then((res) => {
      expect(res).toSatisfy((r) => Array.isArray(r));
      expect(res.length).toBe(2);
      // the results themselves have no meanings

      expect(f1).toHaveBeenCalledOnce();
      expect(f2).toHaveBeenCalledOnce();

      expect(log.error).toHaveBeenCalledTimes(0);
    });
  });

  test('one good, one error', () => {
    const f1 = vi.fn().mockRejectedValue();
    const f2 = vi.fn().mockResolvedValue();
    const projections = [
      ['rm1', f1],
      ['rm2', f2],
    ];
    return handleProjections(
      context,
      getProjectionContext,
      false,
      event
    )(projections).then((res) => {
      expect(res).toSatisfy((r) => Array.isArray(r));
      expect(res.length).toBe(2);
      // the results themselves have no meanings

      expect(f1).toHaveBeenCalledOnce();
      expect(f2).toHaveBeenCalledOnce();

      expect(log.error).toHaveBeenCalledTimes(1);
    });
  });
});
