import { getGameSession } from './getGameSession.js';
import { mainRoundQuestionsCollectionName } from './collectionNames.js';
import { rng } from './rng.js';

const count = (s, u, mrl, l) =>
  s
    .countDocuments(mainRoundQuestionsCollectionName, {
      id: { $nin: u },
      level: l,
      retired: false,
    })
    // If the level is the same as the main round level,
    // we anticipate that one question will be used up
    // and return one less, since the number will only
    // be displayed *after* the selection (end of round).
    .then((c) => (mrl === l ? c - 1 : c));

export const selectMainRoundQuestion = (context, aggregateId) =>
  getGameSession(context, aggregateId).then((gameSession) =>
    Promise.all([
      count(
        context.storage,
        gameSession.usedMainRoundQuestions,
        gameSession.mainRoundLevel,
        1,
      ),
      count(
        context.storage,
        gameSession.usedMainRoundQuestions,
        gameSession.mainRoundLevel,
        2,
      ),
      count(
        context.storage,
        gameSession.usedMainRoundQuestions,
        gameSession.mainRoundLevel,
        3,
      ),
    ]).then(
      ([
        possibleMainRoundQuestionsCountLevel1,
        possibleMainRoundQuestionsCountLevel2,
        possibleMainRoundQuestionsCountLevel3,
      ]) =>
        context.storage
          .find(mainRoundQuestionsCollectionName, {
            /* id NOT one of those in gameSession.usedMainRoundQuestions */
            id: { $nin: gameSession.usedMainRoundQuestions },
            level: gameSession.mainRoundLevel,
            retired: false,
          })
          .toArray()
          .then((possibleMainRoundQuestions) => {
            if (possibleMainRoundQuestions.length === 0) {
              throw new Error(
                `No main round questions available for game session ${aggregateId} on level ${gameSession.mainRoundLevel}}`,
              );
            }
            return possibleMainRoundQuestions[
              Math.floor(rng() * possibleMainRoundQuestions.length)
            ];
          })
          .then((selectedMainRoundQuestion) =>
            context.sideEffects.schedule(() =>
              context.commands.execute(
                {
                  aggregateName: 'gameSession',
                  aggregateId,
                  command: 'SELECT_MAIN_ROUND_QUESTION',
                  payload: {
                    question: selectedMainRoundQuestion,
                    possibleMainRoundQuestionsCountLevel1,
                    possibleMainRoundQuestionsCountLevel2,
                    possibleMainRoundQuestionsCountLevel3,
                  },
                },
                { name: 'Select main round question' },
              ),
            ),
          ),
    ),
  );
