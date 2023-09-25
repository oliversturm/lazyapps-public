import { adminPrivileges } from '../validation.js';

const collectionName = 'games_mainroundQuestions';

export default {
  projections: {
    MAINROUND_QUESTION_CREATED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      {
        aggregateId, // game id
        payload: { id, question, level, answers, correctAnswerIndex, retired },
      },
    ) =>
      storage
        .insertOne(collectionName, {
          id,
          gameId: aggregateId,
          question,
          level,
          answers,
          correctAnswerIndex,
          retired,
        })
        .then(() =>
          sendChangeNotification(
            createChangeInfo(
              'rm-data-maintenance',
              'gamesMainRoundQuestions',
              'all',
              'addRow',
              {
                id,
                gameId: aggregateId,
                question,
                level,
                answers,
                correctAnswerIndex,
                retired,
              },
            ),
          ),
        ),

    MAINROUND_QUESTION_MODIFIED: (
      {
        storage,
        changeNotification: { sendChangeNotification, createChangeInfo },
      },
      {
        aggregateId,
        payload: { id, question, level, answers, correctAnswerIndex, retired },
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
              level,
              answers,
              correctAnswerIndex,
              retired,
            },
          },
        )
        .then(() =>
          sendChangeNotification(
            createChangeInfo(
              'rm-data-maintenance',
              'gamesMainRoundQuestions',
              'all',
              'updateRow',
              {
                id,
                gameId: aggregateId,
                question,
                level,
                answers,
                correctAnswerIndex,
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
