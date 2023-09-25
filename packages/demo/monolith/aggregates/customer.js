import { doesntExist, exists, has } from './validate.js';

export default {
  initial: () => ({}),

  commands: {
    CREATE: (aggregate, payload) => {
      doesntExist(aggregate);
      has(payload, 'name');
      return { type: 'CUSTOMER_CREATED', payload };
    },

    UPDATE: (aggregate, payload) => {
      exists(aggregate);
      has(payload, 'name');
      return { type: 'CUSTOMER_UPDATED', payload };
    },
  },

  projections: {
    CUSTOMER_CREATED: (aggregate, { timestamp }) => ({
      ...aggregate,
      creationTimestamp: timestamp,
    }),
  },
};
