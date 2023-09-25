import { adminPrivileges } from '../validation.js';

const collectionName = 'gameSessions_overview';

export default {
  projections: {
    GAME_SESSION_CREATED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      { aggregateId, timestamp, payload: { gameId, name } },
    ) =>
      storage
        .insertOne(collectionName, {
          id: aggregateId,
          gameId,
          name,
          timestamp,
          active: true,
        })
        .then(() =>
          sendChangeNotification(
            createChangeInfo(
              'rm-data-maintenance',
              'gameSessionsOverview',
              'all',
              'addRow',
              {
                id: aggregateId,
                gameId,
                name,
                timestamp,
                active: true,
              },
            ),
          ),
        ),

    END_GAME_SESSION: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      { aggregateId },
    ) =>
      storage
        .updateOne(
          collectionName,
          { id: aggregateId },
          { $set: { active: false } },
        )
        .then(() =>
          sendChangeNotification(
            createChangeInfo(
              'rm-data-maintenance',
              'gameSessionsOverview',
              'all',
              'updateRow',
              {
                id: aggregateId,
                active: false,
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
