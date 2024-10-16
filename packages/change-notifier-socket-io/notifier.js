import { getLogger } from '@lazyapps/logger';
import { nanoid } from 'nanoid';

const getRoomName = (endpointName, readModelName, resolverName) =>
  `${endpointName}/${readModelName}/${resolverName}`;

const ioInitLog = getLogger('Changes/IO', 'INIT');

export const initSockets = (correlationConfig, io, ioAuthHandler) => {
  ioInitLog.debug('Initializing sockets');
  io.on('connect', (socket) => {
    const existingId = socket.handshake.query?.correlationId;
    socket.correlationId =
      existingId || `${correlationConfig?.serviceId || 'UNK'}-${nanoid()}`;

    const ioLog = getLogger('Changes/IO', socket.correlationId);
    ioLog.debug(
      `Connection: ${socket.id} (handshake: ${JSON.stringify(
        socket.handshake,
      )})${
        socket.decoded_token
          ? ` (JWT: ${JSON.stringify(socket.decoded_token)})`
          : ' (no JWT)'
      }`,
    );

    socket.on('disconnect', (reason) => {
      ioLog.debug(`Disconnected ${socket.id}, reason: ${reason}`);
    });

    socket.on('error', (error) => {
      ioLog.debug(`Communication error with ${socket.id}: ${error}`);
    });

    socket.on('register', (resolvers) => {
      try {
        if (!ioAuthHandler(socket.decoded_token, resolvers)) {
          ioLog.error(
            `Unauthorized register ${JSON.stringify(resolvers)} (claims ${
              socket.decoded_token
            })`,
          );
          socket.disconnect();
          return;
        }
        socket.join(
          resolvers.map(({ endpointName, readModelName, resolverName }) =>
            getRoomName(endpointName, readModelName, resolverName),
          ),
        );
        ioLog.debug(`Registered ${socket.id} for ${JSON.stringify(resolvers)}`);
      } catch (err) {
        ioLog.error(
          `Can't register ${socket.id} for ${JSON.stringify(
            resolvers,
          )}: ${err}`,
        );
      }
    });
  });
};

export const createNotifier = (io, changeInfoAuthHandler) => {
  const handler = (req, res) => {
    const auth = req.auth;
    const rmLog = getLogger('Changes/RM', req.body.correlationId);

    if (!changeInfoAuthHandler(auth)) {
      rmLog.error(
        `Unauthorized changeInfo ${JSON.stringify(req.body)} (claims ${auth})`,
      );
      res.sendStatus(403);
      return;
    }

    const changeInfo = req.body;
    try {
      const { endpointName, readModelName, resolverName } = changeInfo;
      const roomName = getRoomName(endpointName, readModelName, resolverName);
      io.to(roomName).emit('change', changeInfo);
      rmLog.debug(`Forwarded changeInfo ${JSON.stringify(changeInfo)}`);
      res.sendStatus(200);
    } catch (err) {
      rmLog.error(
        `Can't forward changeInfo ${JSON.stringify(changeInfo)}: ${err}`,
      );
      res.sendStatus(500);
    }
  };

  return handler;
};
