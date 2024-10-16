import Queue from 'promise-queue';

import { getLogger } from '@lazyapps/logger';

const createChangeNotificationHandler =
  (changeNotificationSender) => (correlationId) => {
    const queue = new Queue(1, Infinity);

    const log = getLogger('RM/Chng', correlationId);

    return {
      sendChangeNotification: (changeInfo) =>
        queue.add(() =>
          new Promise((resolve) => {
            log.debug(
              `Sending change notification ${JSON.stringify(changeInfo)}'`,
            );
            resolve();
          })
            .then(
              changeNotificationSender.sendChangeNotification(
                correlationId,
                changeInfo,
              ),
            )
            .catch((err) => {
              log.error(
                `Can't send change notification ${JSON.stringify(
                  changeInfo,
                )}: ${err}`,
              );
            }),
        ),
      createChangeInfo: (
        endpointName,
        readModelName,
        resolverName,
        changeKind,
        details,
      ) => {
        // I used to check these kinds specifically, but that seems
        // counter-productive. These kinds might be handled on a
        // client using standard mechanisms, but it's perfectly fine
        // to pass any custom name as the changeKind and handle
        // the details field accordingly.
        //
        // if (!['all', 'addRow', 'updateRow', 'deleteRow'].includes(changeKind))
        //   throw new Error(`Invalid changeKind ${changeKind}`);
        return {
          endpointName,
          readModelName,
          resolverName,
          changeKind,
          details,
        };
      },
    };
  };

export { createChangeNotificationHandler };
