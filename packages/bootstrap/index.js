import { startCommandProcessor } from '@lazyapps/command-processor';
import { startReadModels } from '@lazyapps/readmodels';
import { getLogger } from '@lazyapps/logger';
import { startSvelteKit } from './svelte.js';

const log = getLogger('BS', 'INIT');

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
    startCommandProcessor(correlationConfig, commands);
  }
  if (readModels) {
    log.debug('Starting read models');
    startReadModels(correlationConfig, readModels);
  }
  if (changeNotifier) {
    log.debug('Starting change notifier');
    changeNotifier.listener(correlationConfig);
  }
  if (tokens) {
    log.debug('Starting tokens');
    tokens.listener(correlationConfig);
  }
  if (svelte) {
    log.debug('Starting SvelteKit frontend');
    startSvelteKit(correlationConfig, svelte);
  }
}
