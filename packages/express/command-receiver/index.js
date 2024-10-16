import { createApiHandler } from './command-api-handler.js';
import { runExpress } from '../runExpress.js';
import { getLogger } from '@lazyapps/logger';

const log = getLogger('EX/CP/HTTP', 'INIT');

const installHandlers = (context, app) => {
  const processCommand = createApiHandler(context);
  app.post('/api/command', processCommand);
};

export const express = (externalConfig) =>
  runExpress({ log, installHandlers, ...externalConfig });
