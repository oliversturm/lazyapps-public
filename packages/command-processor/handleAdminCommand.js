import { getLogger } from '@lazyapps/logger';

export const handleAdminCommand = (
  context,
  command,
  params,
  auth,
  correlationId,
) => {
  const log = getLogger('CP/AdHandler', correlationId);
  // Not very flexible this check, but we'll live with it for now
  if (!auth || !auth.admin) {
    log.error(`Unauthorized ${auth}`);
    return Promise.reject(new Error(`Unauthorized ${auth}`));
  }

  if (command !== 'setReplayState') {
    log.error(`Invalid admin command ${command}`);
    return Promise.reject(new Error(`Invalid admin command ${command}`));
  }

  if (!params || typeof params.state !== 'boolean') {
    log.error(`Invalid replay state ${params.state}`);
    return Promise.reject(new Error(`Invalid replay state ${params.state}`));
  }

  const { eventBus } = context;
  if (!eventBus) {
    log.error(`Event bus not found`);
    return Promise.reject(new Error(`Event bus not found`));
  }

  // Trying to remember why, but this call is synchronous
  return new Promise((resolve) => {
    resolve(eventBus.publishReplayState(correlationId)(params.state));
  });
};
