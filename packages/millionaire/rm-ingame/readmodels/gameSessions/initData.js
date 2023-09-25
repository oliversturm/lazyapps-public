export const gameSessionInitData = {
  usedFffQuestions: [],
  possibleFffQuestionsCount: -1,
  possibleMainRoundQuestionsCountLevel1: -1,
  possibleMainRoundQuestionsCountLevel2: -1,
  possibleMainRoundQuestionsCountLevel3: -1,
  usedMainRoundQuestions: [],
  results: [],
};

export const overallMainRoundInitData = {
  fffQuestion: null,
  fffAnswersCount: 0,
  lastFffResults: [],
  fffRoundStartedTimeStamp: 0,
  mainRoundLevel: -1,
  mainRoundNumber: -1,
  currentMainRoundPoints: 0,
  currentPlayerId: null,
  currentPlayerViewName: null,
  availableJokers: [],
};

export const perRoundInitData = {
  mainRoundQuestion: null,
  mainRoundPreselectedAnswer: -1,
  mainRoundMarkCorrectAnswer: -1,
  mainRoundMarkWrongAnswer: -1,
  lastMainRoundAnswerCorrect: false,
};
