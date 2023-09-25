import { getLogger } from '@lazyapps/logger';

const ioLog = getLogger('Changes/IO');
const rmLog = getLogger('Changes/RM');

const getRoomName = (endpointName, readModelName, resolverName) =>
  `${endpointName}/${readModelName}/${resolverName}`;

export const initSockets = (io, ioAuthHandler) => {
  ioLog.debug('Initializing sockets');
  io.on('connect', (socket) => {
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
