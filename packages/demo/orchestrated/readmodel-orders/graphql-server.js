import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { importSchema } from 'graphql-import';

import { getLogger } from '@lazyapps/logger';

const log = getLogger('RM/GraphQL');

import {
  ordersCollectionName,
  customersCollectionName,
} from './readmodels/overview.js';

const schema = buildSchema(importSchema('schema.graphql'));

const addDynamicOrdersQuery = (context) => (customers) =>
  customers.map((customer) => ({
    ...customer,
    orders: () => {
      log.debug(`Querying orders for customer ${customer.id}`);
      return context.storage
        .find(ordersCollectionName, { customerId: customer.id })
        .project({ _id: 0 })
        .toArray()
        .then(addUsdInfo());
    },
  }));

const addUsdInfo = () => (orders) =>
  orders.map((order) => ({
    ...order,
    usdRate: order.usdInfo.exchangeRate,
    usdValue: order.usdInfo.value,
  }));

const createRoot = (context) => ({
  orders: () => {
    log.debug('Querying all orders');
    return context.storage
      .find(ordersCollectionName, {})
      .project({ _id: 0 })
      .toArray()
      .then(addUsdInfo());
  },
  order: ({ id }) => {
    log.debug(`Querying order ${id}`);
    return context.storage
      .find(ordersCollectionName, { id })
      .project({ _id: 0 })
      .toArray()
      .then(addUsdInfo())
      .then((orders) => orders[0]);
  },
  customers: () => {
    log.debug('Querying all customers');
    return context.storage
      .find(customersCollectionName, {})
      .project({ _id: 0 })
      .toArray()
      .then(addDynamicOrdersQuery(context));
  },
  customer: ({ id }) => {
    log.debug(`Querying customer ${id}`);
    return context.storage
      .find(customersCollectionName, { id })
      .project({ _id: 0 })
      .toArray()
      .then(addDynamicOrdersQuery(context))
      .then((customers) => customers[0]);
  },
});

export const customizeExpress = (context, app) => {
  log.debug('Adding GraphQL endpoint');
  const rootValue = createRoot(context);
  app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      rootValue,
      graphiql: true,
    }),
  );
};
