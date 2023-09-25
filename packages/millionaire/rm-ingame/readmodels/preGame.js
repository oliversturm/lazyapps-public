import { adminPrivileges } from './validation.js';

export default {
  projections: {
    GAME_CREATED: ({ storage }, { aggregateId, payload: { name } }) =>
      storage.insertOne('ingame_preGame_games', {
        id: aggregateId,
        name,
      }),

    GAME_SESSION_CREATED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      { aggregateId, timestamp, payload: { gameId, name } },
    ) =>
      storage
        .find('ingame_preGame_games', { id: gameId })
        .toArray()
        .then((games) => {
          if (games.length === 0) {
            throw new Error(`Game for id ${gameId} not found`);
          }
          return games[0];
        })
        .then((game) =>
          storage
            .insertOne('ingame_preGame_gameSessions', {
              id: aggregateId,
              gameId,
              gameName: game.name,
              name,
              timestamp,
              active: true,
            })
            .then(() =>
              sendChangeNotification(
                createChangeInfo(
                  'rm-ingame',
                  'preGame',
                  'byGameSessionId',
                  'addRow',
                  {
                    id: aggregateId,
                    gameId,
                    gameName: game.name,
                    name,
                    timestamp,
                    active: true,
                  },
                ),
              ),
            ),
        ),

    GAME_SESSION_ENDED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      { aggregateId },
    ) =>
      storage
        .updateOne(
          'ingame_preGame_gameSessions',
          { id: aggregateId },
          { $set: { active: false } },
        )
        .then(() =>
          sendChangeNotification(
            createChangeInfo(
              'rm-ingame',
              'preGame',
              'byGameSessionId',
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
    byGameSessionId: (storage, { gameSessionId }, auth) => {
      adminPrivileges(auth);
      return storage
        .find('ingame_preGame_gameSessions', { id: gameSessionId })
        .project({ _id: 0 })
        .limit(1)
        .toArray();
    },
  },
};
