import { createProjectionHandler } from './projections.js';
import { createSideEffectsHandler } from './sideEffects.js';
import { createChangeNotificationHandler } from './changeNotification.js';
import { createCommandHandler } from './commands.js';

export const initializeContext = ({
  readModels,
  storage,
  eventBus,
  changeNotificationSender,
  commandSender,
}) =>
  storage()
    .then((storage) => ({ storage, readModels }))
    .then((context) =>
      context.storage
        .readLastProjectedEventTimestamps(readModels)
        .then(() => context)
    )
    .then((context) =>
      createCommandHandler({ commandSender }).then((commands) => ({
        ...context,
        commands,
      }))
    )
    .then((context) =>
      createSideEffectsHandler().then((sideEffects) => ({
        ...context,
        sideEffects,
      }))
    )
    .then((context) =>
      createChangeNotificationHandler(changeNotificationSender).then(
        (changeNotification) => ({
          ...context,
          changeNotification,
        })
      )
    )
    .then((context) =>
      createProjectionHandler(context).then((projectionHandler) => ({
        ...context,
        projectionHandler,
      }))
    )
    .then((context) => eventBus(context).then(() => context));
