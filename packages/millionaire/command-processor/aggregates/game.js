import { gameExists, gameDoesntExist, adminPrivileges } from './validation.js';

export default {
  initial: () => ({}),

  commands: {
    CREATE_GAME: (agg, pl, auth) => {
      adminPrivileges(auth);
      gameDoesntExist(agg);
      return { type: 'GAME_CREATED', payload: pl };
    },

    MODIFY_GAME: (agg, pl, auth) => {
      adminPrivileges(auth);
      gameExists(agg);
      return { type: 'GAME_MODIFIED', payload: pl };
    },

    CREATE_MAINROUND_QUESTION: (agg, pl, auth) => {
      adminPrivileges(auth);
      gameExists(agg);
      return { type: 'MAINROUND_QUESTION_CREATED', payload: pl };
    },

    MODIFY_MAINROUND_QUESTION: (agg, pl, auth) => {
      adminPrivileges(auth);
      gameExists(agg);
      return { type: 'MAINROUND_QUESTION_MODIFIED', payload: pl };
    },

    CREATE_FFF_QUESTION: (agg, pl, auth) => {
      adminPrivileges(auth);
      gameExists(agg);
      return { type: 'FFF_QUESTION_CREATED', payload: pl };
    },

    MODIFY_FFF_QUESTION: (agg, pl, auth) => {
      adminPrivileges(auth);
      gameExists(agg);
      return { type: 'FFF_QUESTION_MODIFIED', payload: pl };
    },
  },

  projections: {
    GAME_CREATED: (agg) => ({
      ...agg,
      exists: true,
    }),
  },
};
