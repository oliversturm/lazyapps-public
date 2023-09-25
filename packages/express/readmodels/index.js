import { getLogger } from '@lazyapps/logger';
import { createApiHandler } from './query.js';
import { runExpress } from '../runExpress.js';

const log = getLogger('EX/RM/HTTP');

const installHandlers = (context, app) => {
  const executeQuery = createApiHandler(context);
  for (const readModelName in context.readModels) {
    const readModel = context.readModels[readModelName];
    if (readModel.resolvers) {
      for (const resolverName in readModel.resolvers) {
        const resolver = readModel.resolvers[resolverName];
        const handler = executeQuery(
          readModelName,
          readModel,
          resolverName,
          resolver
        );
        app.post(`/query/${readModelName}/${resolverName}`, handler);
        app.get(`/query/${readModelName}/${resolverName}`, handler);
      }
    }
  }
};

export const express = (externalConfig) =>
  runExpress({ log, installHandlers, ...externalConfig });
