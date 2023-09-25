import { fffPlayersCollectionName } from './collectionNames.js';

export const getPlayer = (context, playerId) =>
  context.storage
    .find(fffPlayersCollectionName, { id: playerId })
    .limit(1)
    .toArray()
    .then((players) => {
      if (players.length === 0) {
        throw new Error(`Player for id ${playerId} not found`);
      }
      return players[0];
    });
