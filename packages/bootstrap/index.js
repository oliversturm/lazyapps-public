import { startCommandProcessor } from '@lazyapps/command-processor';
import { startReadModels } from '@lazyapps/readmodels';
import { getLogger } from '@lazyapps/logger';
import { startSvelteKit } from './svelte.js';

const log = getLogger('BS', 'INIT');

let signalHandlersInstalled = false;
const handleSignals = (server) => {
  const handler = (signal) => {
    log.info(`Signal ${signal} received`);
    server.close(() => {
      log.info('Server closed, exiting process');
      process.exit(0);
    });
  };

  if (!signalHandlersInstalled) {
    // Let's just do this once per process, since it's possible we're in a monolith
    process.on('SIGTERM', handler);
    process.on('SIGINT', handler);
    signalHandlersInstalled = true;
  }
};

export function start({
  correlation: correlationConfig,
  commands,
  readModels,
  changeNotifier,
  tokens,
  svelte,
}) {
  if (commands) {
    log.debug('Starting command processor');
    startCommandProcessor(correlationConfig, commands).then((server) => {
      handleSignals(server);
    });
  }
  if (readModels) {
    log.debug('Starting read models');
    startReadModels(correlationConfig, readModels).then((server) => {
      handleSignals(server);
    });
  }
  if (changeNotifier) {
    log.debug('Starting change notifier');
    changeNotifier.listener(correlationConfig).then((server) => {
      handleSignals(server);
    });
  }
  if (tokens) {
    log.debug('Starting tokens');
    tokens.listener(correlationConfig).then((server) => {
      handleSignals(server);
    });
  }
  if (svelte) {
    log.debug('Starting SvelteKit frontend');
    startSvelteKit(correlationConfig, svelte);
  }
}
