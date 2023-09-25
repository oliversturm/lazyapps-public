import { gameSessionsCollectionName } from './collectionNames.js';

export const getGameSession = (context, aggregateId) =>
  context.storage
    .find(gameSessionsCollectionName, { id: aggregateId })
    .limit(1)
    .toArray()
    .then((gameSessions) => {
      if (gameSessions.length === 0) {
        throw new Error(`Game session for id ${aggregateId} not found`);
      }
      return gameSessions[0];
    });
