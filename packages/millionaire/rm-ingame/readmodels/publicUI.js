import { noAuth } from './validation.js';
import { mainState } from './gameSessionStates.js';

// This is the readmodel used by the public UI. It contains all details
// for all relevant states. A public client can query it with the
// game session id, and then receive all state updates through
// change notifications.

const gamesCollectionName = 'ingame_publicUI_games';
const gameSessionsCollectionName = 'ingame_publicUI_gameSessions';

const fieldChange = (scn, cci, changeObject) => () =>
  scn(
    cci('rm-ingame', 'publicUI', 'byGameSessionId', 'updateRow', changeObject),
  );

const sessionUpdateHandler = (
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

export default {
  projections: {
    GAME_CREATED: ({ storage }, { aggregateId, payload: { name } }) =>
      storage.insertOne(gamesCollectionName, {
        id: aggregateId,
        name,
      }),

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
            fffQuestion: null,
            fffResults: [],
            mainRoundQuestion: null,
            // These two are to allow highlighting of the buttons
            // on the public UI clients. Should be cool.
            mainRoundSelectedAnswer: 0,
            mainRoundCorrectAnswer: 0,
            mainRoundResult: [],
          }),
        ),

    ROUND_RESTARTED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.fffRegistration,
        // Many of the following are not necessary,
        // but this illustrates the intention:
        // start a new round with a new FFF question,
        // forget everything about the previous round
        // (if there's anything to forget)
        fffQuestion: null,
        fffResults: [],
        mainRoundQuestion: null,
        mainRoundSelectedAnswer: 0,
        mainRoundCorrectAnswer: 0,
      }),

    FFF_REGISTRATION_STARTED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.fffRegistration,
      }),

    // While registration is active, the public UI only displays
    // a player's own name. Other details are not shown here,
    // they appear only on the projector page.
    // FFF_PLAYER_REGISTERED:

    FFF_REGISTRATION_ENDED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.fffWaitForQuestion,
      }),

    // This readmodel accepts the question directly through
    // the event. The internal gameSessions readmodel is more
    // careful and double-checks the question by querying
    // it using the id only.
    FFF_QUESTION_SELECTED: (context, { aggregateId, payload: { question } }) =>
      sessionUpdateHandler(context, aggregateId, {
        fffQuestion: question,
        mainState: mainState.fffQuestionSelected,
      }),

    FFF_ROUND_STARTED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.fffQuestionDisplay,
      }),

    FFF_ROUND_ENDED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.fffWaitForResult,
      }),

    FFF_ROUND_RESULTS_SUBMITTED: (
      context,
      { aggregateId, payload: { results } },
    ) =>
      sessionUpdateHandler(context, aggregateId, {
        fffResults: results,
        mainState: mainState.fffResultDisplay,
      }),

    // This event indicates that the state moves
    // out of the range that the public UI cares about.
    // We won't follow other events that occur later
    // in the cycle, until we start over.
    MAIN_ROUND_STARTED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        mainState: mainState.mainRoundWaitingForQuestion,
      }),

    GAME_SESSION_ENDED: (context, { aggregateId }) =>
      sessionUpdateHandler(context, aggregateId, {
        active: false,
      }),
  },

  resolvers: {
    byGameSessionId: (storage, { gameSessionId }, auth) => {
      noAuth(auth);
      return storage
        .find(gameSessionsCollectionName, { id: gameSessionId })
        .limit(1)
        .project({ _id: 0 })
        .toArray();
    },
  },
};
