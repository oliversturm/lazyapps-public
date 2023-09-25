import { AuthorizationError } from '@lazyapps/readmodels/validation.js';

export const adminPrivileges = (auth) => {
  if (!auth || !auth.admin)
    throw new AuthorizationError(
      `The user doesn't have the required admin privileges`,
    );
};
