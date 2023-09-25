import { adminPrivileges } from '../validation.js';

const collectionName = 'games_fffQuestions';

export default {
  projections: {
    FFF_QUESTION_CREATED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      {
        aggregateId,
        payload: { id, question, answers, correctAnswerOrder, retired },
      },
    ) =>
      storage
        .insertOne(collectionName, {
          id,
          gameId: aggregateId,
          question,
          answers,
          correctAnswerOrder,
          retired,
        })
        .then(() =>
          sendChangeNotification(
            createChangeInfo(
              'rm-data-maintenance',
              'gamesFffQuestions',
              'all',
              'addRow',
              {
                id,
                gameId: aggregateId,
                question,
                answers,
                correctAnswerOrder,
                retired,
              },
            ),
          ),
        ),

    FFF_QUESTION_MODIFIED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      {
        aggregateId,
        payload: { id, question, answers, correctAnswerOrder, retired },
      },
    ) =>
      storage
        .updateOne(
          collectionName,
          { id },
          {
            $set: {
              gameId: aggregateId,
              question,
              answers,
              correctAnswerOrder,
              retired,
            },
          },
        )
        .then(() =>
          sendChangeNotification(
            createChangeInfo(
              'rm-data-maintenance',
              'gamesFffQuestions',
              'all',
              'updateRow',
              {
                id,
                gameId: aggregateId,
                question,
                answers,
                correctAnswerOrder,
                retired,
              },
            ),
          ),
        ),
  },

  resolvers: {
    all: (storage, { gameId }, auth) => {
      adminPrivileges(auth);

      return storage
        .find(collectionName, { gameId })
        .project({ _id: 0 })
        .toArray();
    },
  },
};
