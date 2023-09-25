import { getGameSession } from './getGameSession.js';

export const finalizeResult = (context, aggregateId) =>
  getGameSession(context, aggregateId).then((gameSession) => {
    const result = {
      playerId: gameSession.currentPlayerId,
      playerName: gameSession.currentPlayerViewName,

      // Previously had this falling back to zero,
      // but that's not nice for the short game. Keep
      // the score when somebody crashes out.
      points: gameSession.currentMainRoundPoints,
      // points: gameSession.lastMainRoundAnswerCorrect
      // ? gameSession.currentMainRoundPoints
      // : 0,

      remainingJokers: gameSession.availableJokers,
      fffTime: gameSession.lastFffResults.find(
        (fffResult) => fffResult.playerId === gameSession.currentPlayerId,
      ).answerTime,
    };

    return context.sideEffects.schedule(() =>
      context.commands.execute(
        {
          aggregateName: 'gameSession',
          aggregateId,
          command: 'SUBMIT_RESULT',
          payload: { result },
        },
        { name: 'Submit result' },
      ),
    );
  });
