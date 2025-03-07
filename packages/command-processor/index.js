import { initializeContext } from './context.js';
import { handleCommand } from './handleCommand.js';
import { createCommandRecorder } from './commandRecorder.js';
import { handleAdminCommand } from './handleAdminCommand.js';

export const startCommandProcessor = (correlationConfig, config) => {
  const commandRecorder = config.commandRecording?.enabled
    ? createCommandRecorder(config.commandRecording.filePath)
    : null;
  return initializeContext(
    correlationConfig,
    config,
    (...args) => handleCommand(...args, commandRecorder),
      config.commandRecording ? handleAdminCommand(config.commandRecording.skipAuthCheck): null,
  ).then((context) => config.receiver(context));
};
