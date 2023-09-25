import { initializeContext } from './context.js';

export const startReadModels = (config) =>
  initializeContext(config).then((context) => config.listener(context));
