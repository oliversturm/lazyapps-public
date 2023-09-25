import { adminPrivileges } from '../validation.js';

const collectionName = 'games_overview';

export default {
  projections: {
    GAME_CREATED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      { aggregateId, payload: { name } },
    ) =>
      storage.insertOne(collectionName, { id: aggregateId, name }).then(() =>
        sendChangeNotification(
          createChangeInfo(
            'rm-data-maintenance',
            'gamesOverview',
            'all',
            'addRow',
            {
              id: aggregateId,
              name,
            },
          ),
        ),
      ),

    GAME_MODIFIED: (
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
            createChangeInfo(
              'rm-data-maintenance',
              'gamesOverview',
              'all',
              'updateRow',
              {
                id: aggregateId,
                name,
              },
            ),
          ),
        ),
  },

  resolvers: {
    all: (storage, args, auth) => {
      adminPrivileges(auth);
      return storage.find(collectionName, {}).project({ _id: 0 }).toArray();
    },
  },
};
