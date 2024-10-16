import { initializeContext } from './context.js';
import { handleCommand } from './handleCommand.js';

export const startCommandProcessor = (correlationConfig, config) =>
  initializeContext(correlationConfig, config, handleCommand).then((context) =>
    config.receiver(context),
  );
