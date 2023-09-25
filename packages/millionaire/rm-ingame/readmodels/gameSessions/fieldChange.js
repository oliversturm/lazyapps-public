export const fieldChange = (scn, cci, changeObject) => () =>
  scn(
    cci(
      'rm-ingame',
      'gameSessions',
      'byGameSessionId',
      'updateRow',
      changeObject,
    ),
  );
