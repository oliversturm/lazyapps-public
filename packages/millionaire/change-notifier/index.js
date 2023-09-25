import fs from 'fs';
import { start } from '@lazyapps/bootstrap';
import { express } from '@lazyapps/change-notifier-socket-io';

const readSecretFiles = (names) =>
  names.map((name) => fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim());

const [jwtSecret] = readSecretFiles(['jwt-secret']);

const ioAuthHandler = (auth, resolvers) => {
  // I considered querying whether the resolvers list contains
  // any "privileged" resolvers. This works, but it seems
  // insecure, because after any additions I would need to
  // remember to add them here explicitly or they might turn
  // out publicly accessible. So better check the other way
  // around.

  const onlyPublicResolvers = resolvers.every(
    ({ endpointName, readModelName, resolverName }) =>
      endpointName === 'rm-ingame' &&
      readModelName === 'publicUI' &&
      resolverName === 'byGameSessionId',
  );

  if (onlyPublicResolvers) {
    return true;
  }

  return auth && auth.admin === true;
};

const changeInfoAuthHandler = (auth) => auth && auth.internal === true;

start({
  changeNotifier: {
    listener: express({
      port: process.env.EXPRESS_PORT || 3008,
      jwtSecret,
      authCookieName: 'access_token',
      credentialsRequired: true,
      ioAuthHandler,
      changeInfoAuthHandler,
    }),
  },
});
