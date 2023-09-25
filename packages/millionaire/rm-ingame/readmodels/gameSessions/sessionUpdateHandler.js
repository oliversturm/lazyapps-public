import { fieldChange } from './fieldChange.js';
import { gameSessionsCollectionName } from './collectionNames.js';

export const sessionUpdateHandler = (
  { storage, changeNotification: { sendChangeNotification, createChangeInfo } },
  aggregateId,
  changeObject,
) =>
  storage
    .updateOne(
      gameSessionsCollectionName,
      { id: aggregateId },
      {
        $set: changeObject,
      },
    )
    .then(
      fieldChange(sendChangeNotification, createChangeInfo, {
        id: aggregateId,
        ...changeObject,
      }),
    );
