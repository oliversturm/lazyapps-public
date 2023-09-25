import {
  ValidationError,
  AuthorizationError,
} from '@lazyapps/command-processor/validation.js';

export const sessionExists = (gameSession) => {
  if (!gameSession.mainState)
    throw new ValidationError(`The game session doesn't exist`);
};

export const sessionDoesntExist = (gameSession) => {
  if (gameSession.mainState)
    throw new ValidationError(`The game session exists already`);
};

export const gameExists = (game) => {
  if (!game.exists) throw new ValidationError(`The game doesn't exist`);
};

export const gameDoesntExist = (game) => {
  if (game.exists) throw new ValidationError(`The game exists already`);
};

export const acceptableMainStates = (gameSession, acceptableStates) => {
  const as =
    typeof acceptableStates === 'string'
      ? [acceptableStates]
      : acceptableStates;
  if (!as.includes(gameSession.mainState))
    throw new ValidationError(
      `The current game session state ${
        gameSession.mainState
      } is not compatible with the required ${as.join(', ')}`,
    );
};

export const has = (ob, field) => {
  if (!ob[field])
    throw new ValidationError(
      `The object doesn't include the required field '${field}', or its value is empty`,
    );
};

export const adminPrivileges = (auth) => {
  if (!auth || !auth.admin)
    throw new AuthorizationError(
      `The user doesn't have the required admin privileges`,
    );
};

export const internalPrivileges = (auth) => {
  if (!auth || !auth.internal)
    throw new AuthorizationError(
      `The service doesn't have the required internal privileges`,
    );
};

export const adminOrInternalPrivileges = (auth) => {
  if (!auth || (!auth.admin && !auth.internal))
    throw new AuthorizationError(
      `The user or service doesn't have the required admin or internal privileges`,
    );
};

export const noAuth = (auth) => {
  if (auth)
    throw new AuthorizationError(
      `Received an unexpected authentication token ${auth}`,
    );
};
