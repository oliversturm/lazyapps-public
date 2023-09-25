import { getGameSession } from './getGameSession.js';
import { fffQuestionsCollectionName } from './collectionNames.js';
import { rng } from './rng.js';

export const selectFffQuestion = (context, aggregateId) =>
  getGameSession(context, aggregateId).then((gameSession) =>
    context.storage
      .find(fffQuestionsCollectionName, {
        /* id NOT one of those in gameSession.usedFffQuestions */
        id: { $nin: gameSession.usedFffQuestions },
        retired: false,
      })
      .toArray()
      .then((possibleFffQuestions) => {
        if (possibleFffQuestions.length === 0) {
          throw new Error(
            `No FFF questions available for game session ${aggregateId}`,
          );
        }
        return {
          selectedFffQuestion:
            possibleFffQuestions[
              Math.floor(rng() * possibleFffQuestions.length)
            ],
          possibleFffQuestionsCount: possibleFffQuestions.length - 1, // -1 because one question has just been used up
        };
      })
      .then(({ selectedFffQuestion, possibleFffQuestionsCount }) =>
        context.sideEffects.schedule(() =>
          context.commands.execute(
            {
              aggregateName: 'gameSession',
              aggregateId,
              command: 'SELECT_FFF_QUESTION',
              payload: {
                question: selectedFffQuestion,
                possibleFffQuestionsCount,
              },
            },
            { name: 'Select FFF question' },
          ),
        ),
      ),
  );
