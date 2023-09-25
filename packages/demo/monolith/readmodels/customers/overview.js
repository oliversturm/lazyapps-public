const collectionName = 'customers_overview';

export default {
  projections: {
    CUSTOMER_CREATED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      { aggregateId, payload: { name } },
    ) =>
      storage.insertOne(collectionName, { id: aggregateId, name }).then(() =>
        sendChangeNotification(
          createChangeInfo('customers', 'overview', 'all', 'addRow', {
            id: aggregateId,
            name,
          }),
        ),
      ),

    CUSTOMER_UPDATED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      { aggregateId, payload: { name } },
    ) =>
      storage
        .updateOne(collectionName, { id: aggregateId }, { $set: { name } })
        .then(() =>
          sendChangeNotification(
            createChangeInfo('customers', 'overview', 'all', 'updateRow', {
              id: aggregateId,
              name,
            }),
          ),
        ),
  },

  resolvers: {
    all: (storage) =>
      storage.find(collectionName, {}).project({ _id: 0 }).toArray(),
  },
};
