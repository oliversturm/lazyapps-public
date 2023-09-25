import { getLogger } from '@lazyapps/logger';
import { createApiHandler } from './command-api-handler.js';
import { runExpress } from '../runExpress.js';

const log = getLogger('EX/CP/HTTP');

const installHandlers = (context, app) => {
  const processCommand = createApiHandler(context);
  app.post('/api/command', processCommand);
};

export const express = (externalConfig) =>
  runExpress({ log, installHandlers, ...externalConfig });
