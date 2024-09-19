import fetch from 'isomorphic-fetch';
import convert from 'xml-js';
import { checkOrderValue } from './confirmationRequests.js';

export const customersCollectionName = 'orders_customers';
export const ordersCollectionName = 'orders_overview';

const exchangeRateSideEffect = (commands, aggregateId, value) => () =>
  fetch('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml')
    .then((res) => res.text())
    .then((res) => convert.xml2js(res))
    .then((res) => {
      const cube = res.elements[0].elements.find((e) => e.name === 'Cube')
        .elements[0];
      return {
        time: cube.attributes.time,
        usdRate: cube.elements.find((e) => e.attributes.currency === 'USD')
          .attributes.rate,
      };
    })
    .then(({ time, usdRate }) =>
      commands.execute({
        aggregateName: 'order',
        aggregateId,
        command: 'ADD_USD_RATE_AND_VALUE',
        payload: { time, usdRate, usdValue: value * usdRate },
      }),
    );

const persistInitialOrder = (
  storage,
  aggregateId,
  { customerId, text, value },
  { sendChangeNotification, createChangeInfo },
) =>
  storage
    .find(customersCollectionName, { id: customerId })
    .project({ name: 1 })
    .toArray()
    .then(([{ name }]) => name)
    .then((name) =>
      Promise.resolve({
        id: aggregateId,
        customerId,
        text,
        value,
        customerName: name,
        status: 'new',
      }).then(
        (newItem) =>
          storage
            .insertOne(ordersCollectionName, newItem)
            .then(() =>
              sendChangeNotification(
                createChangeInfo(
                  'orders',
                  'overview',
                  'all',
                  'addRow',
                  newItem,
                ),
              ),
            )
            .then(() => newItem), // for further processing
      ),
    );

const confirmOrder = (
  storage,
  { sendChangeNotification, createChangeInfo },
  orderId,
) =>
  Promise.all([
    storage.updateOne(
      ordersCollectionName,
      { id: orderId },
      { $set: { status: 'confirmed' } },
    ),
    sendChangeNotification(
      createChangeInfo('orders', 'overview', 'all', 'updateRow', {
        id: orderId,
        status: 'confirmed',
      }),
    ),
  ]);

export default {
  projections: {
    CUSTOMER_CREATED: ({ storage }, { aggregateId, payload: { name } }) =>
      storage.insertOne(customersCollectionName, { id: aggregateId, name }),

    CUSTOMER_UPDATED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      { aggregateId, payload: { name } },
    ) =>
      Promise.all([
        storage.updateOne(
          customersCollectionName,
          { id: aggregateId },
          { $set: { name } },
        ),
        storage
          .updateMany(
            ordersCollectionName,
            { customerId: aggregateId },
            { $set: { customerName: name } },
          )
          .then(() =>
            // There is no feature that would allow to signal the criterion-
            // based update that was run here, so we indicate a change that
            // requires a full reload
            sendChangeNotification(
              createChangeInfo('orders', 'overview', 'all', 'all'),
            ),
          ),
      ]),

    ORDER_CREATED: (
      { storage, sideEffects, commands, changeNotification },
      { aggregateId, payload },
    ) =>
      Promise.all([
        persistInitialOrder(
          storage,
          aggregateId,
          payload,
          changeNotification,
        ).then((order) => checkOrderValue(commands, changeNotification, order)),
        sideEffects.schedule(
          exchangeRateSideEffect(commands, aggregateId, payload.value),
          { name: 'Add USD rate and value' },
        ),
      ]),

    ORDER_CONFIRMED: ({ storage, changeNotification }, { aggregateId }) =>
      confirmOrder(storage, changeNotification, aggregateId),

    ORDER_USD_RATE_AND_VALUE_ADDED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      { aggregateId, payload: { time, usdRate, usdValue } },
    ) =>
      Promise.resolve({
        usdInfo: {
          exchangeRateDate: time,
          exchangeRate: usdRate,
          value: usdValue,
        },
      })
        .then((updateItem) =>
          storage
            .updateOne(
              ordersCollectionName,
              { id: aggregateId },
              {
                $set: updateItem,
              },
            )
            .then(() => updateItem),
        )
        .then((updateItem) =>
          sendChangeNotification(
            createChangeInfo('orders', 'overview', 'all', 'updateRow', {
              id: aggregateId,
              ...updateItem,
            }),
          ),
        ),
  },

  resolvers: {
    all: (storage) =>
      storage.find(ordersCollectionName, {}).project({ _id: 0 }).toArray(),
    customerById: (storage, { id }) =>
      storage
        .find(customersCollectionName, { id })
        .project({ _id: 0 })
        .toArray(),
  },
};
