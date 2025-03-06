import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { importSchema } from 'graphql-import';

import { getLogger } from '@lazyapps/logger';

const log = getLogger('RM/GraphQL', 'INIT');

import {
  ordersCollectionName,
  customersCollectionName,
} from './readmodels/overview.js';

const schema = buildSchema(importSchema('schema.graphql'));

const addDynamicOrdersQuery = (outerContext) => (customers) =>
  customers.map((customer) => ({
    ...customer,
    orders: (args, context) => {
      const { req } = context;
      const { correlationId } = req.body;
      const log = getLogger('RM/GraphQL', correlationId);
      const storage = outerContext.storage.perRequest(correlationId);
      log.debug(`Querying orders for customer ${customer.id}`);
      return storage
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

const createRoot = (outerContext) => ({
  orders: (args, context) => {
    const { req } = context;
    const { correlationId } = req.body;
    const log = getLogger('RM/GraphQL', correlationId);
    const storage = outerContext.storage.perRequest(correlationId);
    log.debug('Querying all orders');
    return storage
      .find(ordersCollectionName, {})
      .project({ _id: 0 })
      .toArray()
      .then(addUsdInfo());
  },
  order: ({ id }, context) => {
    const { req } = context;
    const { correlationId } = req.body;
    const log = getLogger('RM/GraphQL', correlationId);
    const storage = outerContext.storage.perRequest(correlationId);
    log.debug(`Querying order ${id}`);
    return storage
      .find(ordersCollectionName, { id })
      .project({ _id: 0 })
      .toArray()
      .then(addUsdInfo())
      .then((orders) => orders[0]);
  },
  customers: (args, context) => {
    const { req } = context;
    const { correlationId } = req.body;
    const log = getLogger('RM/GraphQL', correlationId);
    const storage = outerContext.storage.perRequest(correlationId);
    log.debug('Querying all customers');
    return storage
      .find(customersCollectionName, {})
      .project({ _id: 0 })
      .toArray()
      .then(addDynamicOrdersQuery(outerContext));
  },
  customer: ({ id }, context) => {
    const { req } = context;
    const { correlationId } = req.body;
    const log = getLogger('RM/GraphQL', correlationId);
    const storage = outerContext.storage.perRequest(correlationId);
    log.debug(`Querying customer ${id}`);
    return storage
      .find(customersCollectionName, { id })
      .project({ _id: 0 })
      .toArray()
      .then(addDynamicOrdersQuery(outerContext))
      .then((customers) => customers[0]);
  },
});

export const customizeExpress = (context, app) => {
  log.debug('Adding GraphQL endpoint');
  const rootValue = createRoot(context);
  app.use(
    '/graphql',
    graphqlHTTP((request) => ({
      schema: schema,
      rootValue,
      graphiql: true,
      context: { req: request },
    })),
  );
};
