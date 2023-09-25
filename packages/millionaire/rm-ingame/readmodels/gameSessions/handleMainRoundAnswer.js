import { getGameSession } from './getGameSession.js';
import { sessionUpdateHandler } from './sessionUpdateHandler.js';
import { mainState } from '../gameSessionStates.js';

const roundScores = [10, 50, 200, 750, 2500];

// Note, this is the answer *index*, not the answer itself
export const handleMainRoundAnswer = (context, aggregateId, answer) =>
  getGameSession(context, aggregateId).then((gameSession) => {
    const answerCorrect =
      answer === gameSession.mainRoundQuestion.correctAnswerIndex;
    return sessionUpdateHandler(context, aggregateId, {
      mainRoundPreselectedAnswer: -1,
      lastMainRoundAnswerCorrect: answerCorrect,
      mainRoundMarkWrongAnswer: !answerCorrect ? answer : -1,
      // always include correct answer
      mainRoundMarkCorrectAnswer:
        gameSession.mainRoundQuestion.correctAnswerIndex,
      currentMainRoundPoints: answerCorrect
        ? gameSession.currentMainRoundPoints +
          roundScores[gameSession.mainRoundNumber]
        : gameSession.currentMainRoundPoints,
      mainState: mainState.mainRoundDisplayAnswerResult,
    });
  });
