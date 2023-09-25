import { doesntExist, exists, has } from './validate.js';

export default {
  initial: () => ({}),

  commands: {
    CREATE: (aggregate, payload) => {
      doesntExist(aggregate);
      has(payload, 'customerId');
      has(payload, 'text');
      has(payload, 'value');
      return { type: 'ORDER_CREATED', payload };
    },

    ADD_USD_RATE_AND_VALUE: (aggregate, payload) => {
      exists(aggregate);
      has(payload, 'time');
      has(payload, 'usdRate');
      has(payload, 'usdValue');
      return { type: 'ORDER_USD_RATE_AND_VALUE_ADDED', payload };
    },
  },

  projections: {
    ORDER_CREATED: (aggregate, { timestamp }) => ({
      ...aggregate,
      creationTimestamp: timestamp,
    }),
  },
};
