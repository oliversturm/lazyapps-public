// This file is the same as rm-ingame/readmodels/gameSessionStates.js
// It would be possible to share these two, but logically they can
// have different content -- it really makes more sense to keep
// them separate, and it's cleaner anyway.

export const mainState = {
  // projector UI displays game name/session name, sort of a welcome page
  // public UI shows nothing -- can't have the game session id yet
  preGame: 'PRE_GAME',

  // projector UI shows "thanks for taking part" or similar
  // public UI shows nothing
  gameEnded: 'GAME_ENDED',

  // projector UI shows QR code and updated list of participants
  // public UI shows registration form, or user info from cookie if already registered
  fffRegistration: 'FFF_REGISTRATION',

  // projector UI says "wait for it... starting in a moment!"
  // public UI -- same
  // both UIs should bind to the readmodel for the question display,
  // so that a change notification can update with the selected
  // question without delay
  fffWaitForQuestion: 'FFF_WAITFORQUESTION',

  // projector UI shows something like "question selected, get ready"
  // public UI -- same
  fffQuestionSelected: 'FFF_QUESTIONSELECTED',

  // projector UI shows selected question
  // public UI shows selected question, allows selecting the order
  // of the answers -- I guess it will show A B C D on the buttons
  // allow to "reset" and "submit"?
  fffQuestionDisplay: 'FFF_QUESTIONDISPLAY',

  // projector UI shows the correct answer
  // public UI shows the correct answer
  fffWaitForResult: 'FFF_WAITFORRESULT',

  // projector UI shows the correct answer, and the top five (?) times for correct answers
  // public UI shows the correct answer, and says "you're in place X" for the player
  fffResultDisplay: 'FFF_RESULTDISPLAY',

  // projection UI shows ... tbd
  // public UI shows placeholder "main round in question, please wait" -- or, perhaps we should reflect the projection UI, but without interactivity of course?
  mainRoundWaitingForQuestion: 'MAIN_ROUND_WAITINGFORQUESTION',

  // projection UI shows the question and the answers
  // with interactivity features
  mainRound: 'MAIN_ROUND',

  // projection UI shows the correct answer and highlights the
  // player's answer as correct or incorrect
  mainRoundDisplayAnswerResult: 'MAIN_ROUND_DISPLAYANSWERRESULT',

  // projection UI shows a list for the main round results,
  // perhaps a spinner, or the previous state? Waiting...
  mainRoundWaitingForResultDisplay: 'MAIN_ROUND_WAITINGFORRESULTDISPLAY',

  // projection UI shows the list of main round results, scoreboard
  // public UI ... same thing?
  mainRoundResultDisplay: 'MAIN_ROUND_RESULTDISPLAY',
};
