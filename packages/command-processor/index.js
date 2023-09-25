import { initializeContext } from './context.js';
import { handleCommand } from './handleCommand.js';

export const startCommandProcessor = (config) =>
  initializeContext(config, handleCommand).then((context) =>
    config.receiver(context)
  );
