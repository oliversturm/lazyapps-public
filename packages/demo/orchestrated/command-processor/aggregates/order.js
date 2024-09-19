import { doesntExist, exists, has, is, oneOf } from './validate.js';

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

    REQUIRE_CONFIRMATION: (aggregate) => {
      exists(aggregate);
      is(aggregate, 'status', 'new');
      return { type: 'ORDER_CONFIRMATION_REQUIRED' };
    },

    CONFIRM: (aggregate) => {
      exists(aggregate);
      oneOf(aggregate, 'status', ['new', 'unconfirmed']);
      return { type: 'ORDER_CONFIRMED' };
    },
  },

  projections: {
    ORDER_CREATED: (aggregate, { timestamp }) => ({
      ...aggregate,
      creationTimestamp: timestamp,
      status: 'new',
    }),

    ORDER_CONFIRMATION_REQUIRED: (aggregate) => ({
      ...aggregate,
      status: 'unconfirmed',
    }),

    ORDER_CONFIRMED: (aggregate) => ({
      ...aggregate,
      status: 'confirmed',
    }),
  },
};
