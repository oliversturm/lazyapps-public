import filter from 'lodash/fp/filter.js';
import { getGameSession } from './getGameSession.js';
import {
  fffAnswersCollectionName,
  fffPlayersCollectionName,
} from './collectionNames.js';

// not sure if I need to make this more complicated
const isCorrectFffAnswer = (correctAnswerOrder) => (submittedAnswer) =>
  correctAnswerOrder === submittedAnswer.answer;

// TODO: check that multiple answers submitted by the same
// player are excluded.
// This can only happen if we assume that a player modifies
// the local storage data in their browser during the running
// FFF round. They would submit an answer, then remove that
// part from the object in local storage, reload and submit
// another answer. This seems far-fetched unless it's
// automated... anyway, in this case we could end up with
// multiple answers recorded for the same `playerId`.
export const calculateFffResult = (context, aggregateId) =>
  getGameSession(context, aggregateId).then((gameSession) =>
    context.storage
      .find(fffAnswersCollectionName, {
        gameSessionId: aggregateId,
        questionId: gameSession.fffQuestion.id,
      })
      .sort({ timestamp: 1 })
      .toArray()
      .then(
        filter(isCorrectFffAnswer(gameSession.fffQuestion.correctAnswerOrder)),
      )
      .then((correctAnswers) =>
        context.storage
          .find(fffPlayersCollectionName, {
            gameSessionId: aggregateId,
            id: {
              $in: correctAnswers.map(
                (correctAnswer) => correctAnswer.playerId,
              ),
            },
          })
          .toArray()
          .then((players) =>
            correctAnswers.map((correctAnswer) => ({
              playerId: correctAnswer.playerId,
              playerName: players.find(
                (player) => player.id === correctAnswer.playerId,
              ).viewName,
              answerTime:
                correctAnswer.timestamp - gameSession.fffRoundStartedTimeStamp,
            })),
          )
          .then((results) =>
            context.sideEffects.schedule(() =>
              context.commands.execute(
                {
                  aggregateName: 'gameSession',
                  aggregateId,
                  command: 'SUBMIT_FFF_ROUND_RESULTS',
                  payload: { results },
                },
                { name: 'Submit FFF round results' },
              ),
            ),
          ),
      ),
  );
