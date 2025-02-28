import { createApiHandler } from './command-api-handler.js';
import { runExpress } from '../runExpress.js';
import { getLogger } from '@lazyapps/logger';
import { adminHandler } from './admin-handler.js';

const log = getLogger('EX/CP/HTTP', 'INIT');

const installHandlers = (context, app) => {
  const processCommand = createApiHandler(context);
  app.post('/api/command', processCommand);
  app.post('/api/admin/:command', adminHandler(context));
};

export const express = (externalConfig) =>
  runExpress({ log, installHandlers, ...externalConfig });
