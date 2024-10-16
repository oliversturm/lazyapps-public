import { createProjectionHandler } from './projections.js';
import { createSideEffectsHandler } from './sideEffects.js';
import { createChangeNotificationHandler } from './changeNotification.js';
import { createCommandHandler } from './commands.js';

export const initializeContext = (
  correlationConfig,
  { readModels, storage, eventBus, changeNotificationSender, commandSender },
) =>
  storage()
    .then((storage) => ({ storage, readModels, correlationConfig }))
    .then((context) =>
      context.storage
        .readLastProjectedEventTimestamps(readModels)
        .then(() => context),
    )
    .then((context) => ({
      ...context,
      commands: createCommandHandler({ commandSender }),
    }))
    .then((context) =>
      createSideEffectsHandler().then((sideEffects) => ({
        ...context,
        sideEffects,
      })),
    )
    .then((context) => ({
      ...context,
      changeNotification: createChangeNotificationHandler(
        changeNotificationSender,
      ),
    }))
    .then((context) => ({
      ...context,
      projectionHandler: createProjectionHandler(context),
    }))
    .then((context) => eventBus(context).then(() => context));
