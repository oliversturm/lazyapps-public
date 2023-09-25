import { startCommandProcessor } from '@lazyapps/command-processor';
import { startReadModels } from '@lazyapps/readmodels';
import { getLogger } from '@lazyapps/logger';
import { startSvelteKit } from './svelte.js';

const log = getLogger('BS');

export function start({
  commands,
  readModels,
  changeNotifier,
  tokens,
  svelte,
}) {
  if (commands) {
    log.debug('Starting command processor');
    startCommandProcessor(commands);
  }
  if (readModels) {
    log.debug('Starting read models');
    startReadModels(readModels);
  }
  if (changeNotifier) {
    log.debug('Starting change notifier');
    changeNotifier.listener();
  }
  if (tokens) {
    log.debug('Starting tokens');
    tokens.listener();
  }
  if (svelte) {
    log.debug('Starting SvelteKit frontend');
    startSvelteKit(svelte);
  }
}
