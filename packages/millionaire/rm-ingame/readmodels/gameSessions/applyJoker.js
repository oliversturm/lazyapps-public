import { getGameSession } from './getGameSession.js';
import { sessionUpdateHandler } from './sessionUpdateHandler.js';
import { rng } from './rng.js';

export const applyJoker = (context, aggregateId, joker) =>
  getGameSession(context, aggregateId).then((gameSession) => {
    if (!gameSession.availableJokers.includes(joker)) {
      throw new Error(`Joker ${joker} not available`);
    }
    const updateObject = {
      availableJokers: gameSession.availableJokers.filter(
        (availableJoker) => availableJoker !== joker,
      ),
    };
    const selectedKeepIndex = (() => {
      let index;
      do {
        index = Math.floor(
          rng() * gameSession.mainRoundQuestion.answers.length,
        );
      } while (index === gameSession.mainRoundQuestion.correctAnswerIndex);
      return index;
    })();
    if (joker === 'fifty') {
      updateObject.mainRoundQuestion = {
        ...gameSession.mainRoundQuestion,
        // fix -- I had `filter` here, but that breaks
        // the connection to the `correctAnswerIndex`.
        // Removing the answer text is interpreted correctly
        // by the UI and makes the answer unavailable.
        answers: gameSession.mainRoundQuestion.answers.map((answer, index) =>
          index === gameSession.mainRoundQuestion.correctAnswerIndex ||
          index === selectedKeepIndex
            ? answer
            : '',
        ),
      };
    }
    return sessionUpdateHandler(context, aggregateId, updateObject);
  });
