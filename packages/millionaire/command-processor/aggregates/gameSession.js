import {
  sessionExists,
  sessionDoesntExist,
  acceptableMainStates,
  adminPrivileges,
  internalPrivileges,
  adminOrInternalPrivileges,
  noAuth,
} from './validation.js';
import { mainState } from './gameSessionStates.js';

export default {
  initial: () => ({}),

  commands: {
    CREATE_GAME_SESSION: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionDoesntExist(agg);
      return { type: 'GAME_SESSION_CREATED', payload: pl };
    },

    END_GAME_SESSION: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      return { type: 'GAME_SESSION_ENDED', payload: pl };
    },

    START_FFF_REGISTRATION: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [
        mainState.preGame,
        mainState.mainRoundResultDisplay,
      ]);
      return { type: 'FFF_REGISTRATION_STARTED', payload: pl };
    },

    REGISTER_FFF_PLAYER: (agg, pl, auth) => {
      // We explicitly don't want `auth` here, since the command
      // should come from an unauthenticated source.
      noAuth(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.fffRegistration]);
      return { type: 'FFF_PLAYER_REGISTERED', payload: pl };
    },

    END_FFF_REGISTRATION: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.fffRegistration]);
      return { type: 'FFF_REGISTRATION_ENDED', payload: pl };
    },

    SELECT_FFF_QUESTION: (agg, pl, auth) => {
      // this originates (exclusively, I think) from
      // the function selectFffQuestion in rm-ingame/gameSessions,
      internalPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.fffWaitForQuestion]);
      return { type: 'FFF_QUESTION_SELECTED', payload: pl };
    },

    START_FFF_ROUND: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.fffQuestionSelected]);
      return { type: 'FFF_ROUND_STARTED', payload: pl };
    },

    SUBMIT_FFF_ANSWER: (agg, pl, auth) => {
      // We explicitly don't want `auth` here, since the command
      // should come from an unauthenticated source.
      noAuth(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.fffQuestionDisplay]);
      return { type: 'FFF_ANSWER_SUBMITTED', payload: pl };
    },

    END_FFF_ROUND: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.fffQuestionDisplay]);
      return { type: 'FFF_ROUND_ENDED', payload: pl };
    },

    SUBMIT_FFF_ROUND_RESULTS: (agg, pl, auth) => {
      // this originates (exclusively, I think) from
      // the function calculateFffResult in
      // rm-ingame/gameSessions,
      internalPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.fffWaitForResult]);
      return { type: 'FFF_ROUND_RESULTS_SUBMITTED', payload: pl };
    },

    INIT_FOR_FIRST_MAIN_ROUND: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.fffResultDisplay]);
      return { type: 'FIRST_MAIN_ROUND_INITIALIZED', payload: pl };
    },

    START_MAIN_ROUND: (agg, pl, auth) => {
      // this MAY originate from the handler
      // of FIRST_MAIN_ROUND_INITIALIZED in
      // rm-ingame/gameSessions -- I believe this command may also
      // originate from the projector UI user though.
      adminOrInternalPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [
        mainState.fffResultDisplay,
        mainState.mainRoundDisplayAnswerResult,
      ]);
      return { type: 'MAIN_ROUND_STARTED', payload: pl };
    },

    SELECT_MAIN_ROUND_QUESTION: (agg, pl, auth) => {
      // this originates (exclusively, I think) from
      // the function selectMainRoundQuestion in
      // rm-ingame/gameSessions,
      internalPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.mainRoundWaitingForQuestion]);
      return { type: 'MAIN_ROUND_QUESTION_SELECTED', payload: pl };
    },

    PRESELECT_MAIN_ROUND_ANSWER: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.mainRound]);
      return { type: 'MAIN_ROUND_ANSWER_PRESELECTED', payload: pl };
    },

    SUBMIT_MAIN_ROUND_ANSWER: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.mainRound]);
      return { type: 'MAIN_ROUND_ANSWER_SUBMITTED', payload: pl };
    },

    APPLY_JOKER: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [mainState.mainRound]);
      return { type: 'JOKER_APPLIED', payload: pl };
    },

    END_MAIN_ROUND: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [
        // These states are covered by the MainRoundView --
        // i.e. during main round play
        mainState.mainRound,
        mainState.mainRoundDisplayAnswerResult,
      ]);
      // we need an explicit command/event for this, because
      // it signals a state change that the read models need
      // to reflect.
      return { type: 'MAIN_ROUND_ENDED', payload: pl };
    },

    SUBMIT_RESULT: (agg, pl, auth) => {
      // this originates from
      // the function finalizeResult in
      // rm-ingame/gameSessions, or from the projector UI
      // in the FFF Result View.
      adminOrInternalPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [
        // this is the state when we come out of the game
        // session
        mainState.mainRoundWaitingForResultDisplay,
        // This state is the FFF result view. In the case
        // that FFF play ends without valid answers, and
        // there are no more questions so a new round
        // is impossible, we get to this point. In this
        // case, an empty result is submitted.
        mainState.fffResultDisplay,
      ]);
      return { type: 'RESULT_SUBMITTED', payload: pl };
    },

    RESTART_ROUND: (agg, pl, auth) => {
      adminPrivileges(auth);
      sessionExists(agg);
      acceptableMainStates(agg, [
        mainState.fffQuestionDisplay,
        mainState.fffResultDisplay,
        mainState.mainRound,
      ]);
      return { type: 'ROUND_RESTARTED', payload: pl };
    },
  },

  projections: {
    GAME_SESSION_CREATED: (agg) => ({
      ...agg,
      mainState: mainState.preGame,
    }),

    GAME_SESSION_ENDED: (agg) => ({
      ...agg,
      mainState: mainState.gameEnded,
    }),

    FFF_REGISTRATION_STARTED: (agg) => ({
      ...agg,
      mainState: mainState.fffRegistration,
    }),

    FFF_REGISTRATION_ENDED: (agg) => ({
      ...agg,
      mainState: mainState.fffWaitForQuestion,
    }),

    FFF_QUESTION_SELECTED: (agg) => ({
      ...agg,
      mainState: mainState.fffQuestionSelected,
    }),

    FFF_ROUND_STARTED: (agg) => ({
      ...agg,
      mainState: mainState.fffQuestionDisplay,
    }),

    FFF_ROUND_ENDED: (agg) => ({
      ...agg,
      mainState: mainState.fffWaitForResult,
    }),

    FFF_ROUND_RESULTS_SUBMITTED: (agg) => ({
      ...agg,
      mainState: mainState.fffResultDisplay,
    }),

    MAIN_ROUND_STARTED: (agg) => ({
      ...agg,
      // this state means that we are in ANY main round
      // -- for the aggregate, the level of the round, jokers
      // used etc, are not relevant.
      mainState: mainState.mainRoundWaitingForQuestion,
    }),

    MAIN_ROUND_QUESTION_SELECTED: (agg) => ({
      ...agg,
      mainState: mainState.mainRound,
    }),

    MAIN_ROUND_ANSWER_SUBMITTED: (agg) => ({
      ...agg,
      mainState: mainState.mainRoundDisplayAnswerResult,
    }),

    MAIN_ROUND_ENDED: (agg) => ({
      ...agg,
      mainState: mainState.mainRoundWaitingForResultDisplay,
    }),

    RESULT_SUBMITTED: (agg) => ({
      ...agg,
      mainState: mainState.mainRoundResultDisplay,
    }),

    ROUND_RESTARTED: (agg) => ({
      ...agg,
      mainState: mainState.fffRegistration,
    }),
  },
};
