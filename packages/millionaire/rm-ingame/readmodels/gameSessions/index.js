import { adminPrivileges } from '../validation.js';
import { mainState } from '../gameSessionStates.js';
import {
  gamesCollectionName,
  gameSessionsCollectionName,
  fffQuestionsCollectionName,
  fffPlayersCollectionName,
  fffAnswersCollectionName,
  mainRoundQuestionsCollectionName,
} from './collectionNames.js';
import {
  gameSessionInitData,
  overallMainRoundInitData,
  perRoundInitData,
} from './initData.js';
import { sessionUpdateHandler } from './sessionUpdateHandler.js';
import { selectFffQuestion } from './selectFffQuestion.js';
import { getGameSession } from './getGameSession.js';
import { calculateFffResult } from './calculateFffResult.js';
import { getPlayer } from './getPlayer.js';
import { selectMainRoundQuestion } from './selectMainRoundQuestion.js';
import { applyJoker } from './applyJoker.js';
import { handleMainRoundAnswer } from './handleMainRoundAnswer.js';
import { finalizeResult } from './finalizeResult.js';

const levelForRound = (round) => [1, 2, 2, 2, 3][round];

// Guideline: implement only those handlers here that deal
// with storage and change notifications. Everything more
// complicated should be in separate files.

export default {
  projections: {
    GAME_CREATED: ({ storage }, { aggregateId, payload: { name } }) =>
      storage.insertOne(gamesCollectionName, {
        id: aggregateId,
        name,
      }),

    FFF_QUESTION_CREATED: (
      { storage },
      {
        aggregateId,
        payload: { id, question, answers, correctAnswerOrder, retired },
      },
    ) =>
      storage.insertOne(fffQuestionsCollectionName, {
        id,
        gameId: aggregateId,
        question,
        answers,
        correctAnswerOrder,
        retired,
      }),

    FFF_QUESTION_MODIFIED: (
      { storage },
      {
        aggregateId,
        payload: { id, question, answers, correctAnswerOrder, retired },
      },
    ) =>
      storage.updateOne(
        fffQuestionsCollectionName,
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
      ),

    MAINROUND_QUESTION_CREATED: (
      { storage },
      {
        aggregateId,
        payload: { id, question, level, answers, correctAnswerIndex, retired },
      },
    ) =>
      storage.insertOne(mainRoundQuestionsCollectionName, {
        id,
        gameId: aggregateId,
        question,
        level,
        answers,
        correctAnswerIndex,
        retired,
      }),

    MAINROUND_QUESTION_MODIFIED: (
      { storage },
      {
        aggregateId,
        payload: { id, question, level, answers, correctAnswerIndex, retired },
      },
    ) =>
      storage.updateOne(
        mainRoundQuestionsCollectionName,
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
      ),

    GAME_SESSION_CREATED: (
      { storage },
      { aggregateId, timestamp, payload: { gameId, name } },
    ) =>
      storage
        .find(gamesCollectionName, { id: gameId })
        .toArray()
        .then((games) => {
          if (games.length === 0) {
            throw new Error(`Game for id ${gameId} not found`);
          }
          return games[0];
        })
        .then((game) =>
          storage.insertOne(gameSessionsCollectionName, {
            id: aggregateId,
            gameId,
            gameName: game.name,
            name,
            timestamp,
            active: true,
            mainState: mainState.preGame,

            ...gameSessionInitData,
            ...overallMainRoundInitData,
            ...perRoundInitData,
          }),
        ),

    // Not sure I really need this much, but the
    // intention of this event was to provide an
    // emergency exit, i.e. allow stepping out of the
    // normal state cycle if necessary.
    ROUND_RESTARTED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.fffRegistration,

        ...overallMainRoundInitData,
        ...perRoundInitData,
      }),

    // This event can follow the pre-game states on
    // first run, but it can also follow mainRoundResultDisplay
    // if a new round is started.
    // Technically, it turns out that this is handled just
    // like ROUND_RESTARTED -- the state check on the
    // aggregate level is different though.
    FFF_REGISTRATION_STARTED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.fffRegistration,

        ...overallMainRoundInitData,
        ...perRoundInitData,
      }),

    FFF_PLAYER_REGISTERED: (
      context,
      { aggregateId, payload: { playerId, viewName, realName, email } },
    ) =>
      context.storage
        .insertOne(fffPlayersCollectionName, {
          id: playerId,
          gameSessionId: aggregateId,
          viewName,
          realName,
          email,
        })
        .then(() =>
          context.changeNotification.sendChangeNotification(
            context.changeNotification.createChangeInfo(
              'rm-ingame',
              'gameSessions',
              'fffPlayerViewNames',
              'addRow',
              { id: playerId, viewName },
            ),
          ),
        ),

    FFF_REGISTRATION_ENDED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.fffWaitForQuestion,
      }).then(() => selectFffQuestion(context, aggregateId)),

    FFF_QUESTION_SELECTED: (
      context,
      {
        aggregateId,
        payload: {
          // We receive the whole question here, which is
          // accepted as is by the public UI readmodel --
          // but we'll be careful here and double-check
          // it by the id.
          question: { id: questionId },
          // this is the count of questions remaining,
          // already excluding the one just selected
          possibleFffQuestionsCount,
        },
      },
    ) =>
      getGameSession(context, aggregateId).then((gameSession) =>
        context.storage
          .find(fffQuestionsCollectionName, { id: questionId })
          .limit(1)
          .toArray()
          .then((fffQuestions) => {
            if (fffQuestions.length === 0) {
              throw new Error(`FFF question for id ${questionId} not found`);
            }
            return fffQuestions[0];
          })
          .then((selectedFffQuestion) =>
            sessionUpdateHandler(context, aggregateId, {
              fffQuestion: selectedFffQuestion,
              usedFffQuestions: gameSession.usedFffQuestions.concat(
                selectedFffQuestion.id,
              ),
              possibleFffQuestionsCount,
              mainState: mainState.fffQuestionSelected,
            }),
          ),
      ),

    FFF_ROUND_STARTED: (context, { aggregateId, timestamp }) =>
      sessionUpdateHandler(context, aggregateId, {
        fffRoundStartedTimeStamp: timestamp,
        mainState: mainState.fffQuestionDisplay,
      }),

    FFF_ANSWER_SUBMITTED: (
      context,
      { aggregateId, timestamp, payload: { playerId, questionId, answer } },
    ) =>
      Promise.all([
        context.storage.insertOne(fffAnswersCollectionName, {
          gameSessionId: aggregateId,
          playerId,
          questionId,
          answer,
          timestamp,
        }),
        context.storage
          .updateOne(
            gameSessionsCollectionName,
            { id: aggregateId },
            { $inc: { fffAnswersCount: 1 } },
          )
          .then(
            // this is a change notification that results in an
            // optimistic update in the projector UI, while
            // fff answers are coming in
            () =>
              context.changeNotification.sendChangeNotification(
                context.changeNotification.createChangeInfo(
                  'rm-ingame',
                  'gameSessions',
                  'byGameSessionId',
                  'optimisticIncFffAnswersCount',
                  {
                    gameSessionId: aggregateId,
                  },
                ),
              ),
          ),
      ]),

    FFF_ROUND_ENDED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.fffWaitForResult,
      }).then(() => calculateFffResult(context, aggregateId)),

    FFF_ROUND_RESULTS_SUBMITTED: (
      context,
      { aggregateId, payload: { results } },
    ) =>
      sessionUpdateHandler(context, aggregateId, {
        lastFffResults: results,
        mainState: mainState.fffResultDisplay,
      }),

    FIRST_MAIN_ROUND_INITIALIZED: (
      context,
      { aggregateId, payload: { playerId } },
    ) =>
      getPlayer(context, playerId).then((player) =>
        sessionUpdateHandler(context, aggregateId, {
          // This number will be incremented right afterwards
          // in MAIN_ROUND_STARTED
          mainRoundNumber: -1,
          // The level will be derived as soon as
          // the round is >=1
          mainRoundLevel: -1,
          availableJokers: ['fifty', 'ask'],
          currentMainRoundPoints: 0,
          currentPlayerId: playerId,
          currentPlayerViewName: player.viewName,
        }).then(() =>
          context.sideEffects.schedule(() =>
            context.commands.execute({
              aggregateName: 'gameSession',
              aggregateId,
              command: 'START_MAIN_ROUND',
              payload: {},
            }),
          ),
        ),
      ),

    MAIN_ROUND_STARTED: (context, { aggregateId }) =>
      getGameSession(context, aggregateId).then((gameSession) =>
        sessionUpdateHandler(context, aggregateId, {
          mainRoundPreselectedAnswer: -1,
          mainRoundMarkCorrectAnswer: -1,
          mainRoundMarkWrongAnswer: -1,
          lastMainRoundAnswerCorrect: false,
          // round number will be 0-4
          mainRoundNumber: gameSession.mainRoundNumber + 1,
          mainRoundLevel: levelForRound(gameSession.mainRoundNumber + 1),
          mainState: mainState.mainRoundWaitingForQuestion,
        }).then(() => selectMainRoundQuestion(context, aggregateId)),
      ),

    MAIN_ROUND_QUESTION_SELECTED: (
      context,
      {
        aggregateId,
        payload: {
          // We receive the whole question here, which is
          // accepted as is by the public UI readmodel --
          // but we'll be careful here and double-check
          // it by the id.
          question: { id: questionId },
          // These are the updated counts of remaining
          // questions on each level, already excluding the one
          // just selected
          possibleMainRoundQuestionsCountLevel1,
          possibleMainRoundQuestionsCountLevel2,
          possibleMainRoundQuestionsCountLevel3,
        },
      },
    ) =>
      getGameSession(context, aggregateId).then((gameSession) =>
        context.storage
          .find(mainRoundQuestionsCollectionName, { id: questionId })
          .limit(1)
          .toArray()
          .then((mainRoundQuestions) => {
            if (mainRoundQuestions.length === 0) {
              throw new Error(
                `Main round question for id ${questionId} not found`,
              );
            }
            return mainRoundQuestions[0];
          })
          .then((selectedMainRoundQuestion) =>
            sessionUpdateHandler(context, aggregateId, {
              mainRoundQuestion: selectedMainRoundQuestion,
              usedMainRoundQuestions: gameSession.usedMainRoundQuestions.concat(
                selectedMainRoundQuestion.id,
              ),
              possibleMainRoundQuestionsCountLevel1,
              possibleMainRoundQuestionsCountLevel2,
              possibleMainRoundQuestionsCountLevel3,
              mainState: mainState.mainRound,
            }),
          ),
      ),

    MAIN_ROUND_ANSWER_PRESELECTED: (
      context,
      { aggregateId, payload: { answer } },
    ) =>
      sessionUpdateHandler(context, aggregateId, {
        // note: this is the answer *index*, not the answer itself
        mainRoundPreselectedAnswer: answer,
      }),

    JOKER_APPLIED: (context, { aggregateId, payload: { joker } }) =>
      applyJoker(context, aggregateId, joker),

    MAIN_ROUND_ANSWER_SUBMITTED: (
      context,
      { aggregateId, payload: { answer } },
    ) => handleMainRoundAnswer(context, aggregateId, answer),

    MAIN_ROUND_ENDED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.mainRoundWaitingForResultDisplay,
      }).then(() => finalizeResult(context, aggregateId)),

    RESULT_SUBMITTED: (context, { aggregateId, payload: { result } }) =>
      getGameSession(context, aggregateId).then((gameSession) =>
        sessionUpdateHandler(context, aggregateId, {
          results: result
            ? gameSession.results.concat(result)
            : gameSession.results,
          mainState: mainState.mainRoundResultDisplay,
        }),
      ),

    GAME_SESSION_ENDED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        active: false,
      }),
  },

  resolvers: {
    byGameSessionId: (storage, { gameSessionId }, auth) => {
      adminPrivileges(auth);
      return storage
        .find(gameSessionsCollectionName, { id: gameSessionId })
        .project({ _id: 0 })
        .toArray();
    },

    fffPlayerViewNames: (storage, { gameSessionId }, auth) => {
      adminPrivileges(auth);
      return storage
        .find(fffPlayersCollectionName, { gameSessionId })
        .project({ _id: 0, id: 1, viewName: 1 })
        .toArray();
    },
  },
};
