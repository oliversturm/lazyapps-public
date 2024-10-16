import { initializeContext } from './context.js';

export const startReadModels = (correlationConfig, config) =>
  initializeContext(correlationConfig, config).then((context) =>
    config.listener(context),
  );
