import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { expressjwt } from 'express-jwt';
import { socketIoCookieJwt } from './socketIoCookieJwt.js';
import { Server as SocketIoServer } from 'socket.io';
import http from 'http';

import { getLogger, getStream } from '@lazyapps/logger';
import { initSockets, createNotifier } from './notifier.js';

const log = getLogger('Changes/HTTP');

const runExpress = ({
  port = 3008,
  host = '0.0.0.0',
  jwtSecret,
  authCookieName,
  credentialsRequired,
  ioAuthHandler,
  changeInfoAuthHandler,
}) => {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(morgan('dev', { stream: getStream(log.debug) }));
    app.use(bodyParser.json());
    app.use(cookieParser());

    // Similar code as in express/runExpress.js -- refactor?
    if (jwtSecret) {
      app.use(
        expressjwt({
          secret: jwtSecret,
          algorithms: ['HS256'],
          credentialsRequired: credentialsRequired || false,
          getToken: (req) => {
            // check Authorization header first
            if (
              req.headers.authorization &&
              req.headers.authorization.split(' ')[0] === 'Bearer'
            ) {
              return req.headers.authorization.split(' ')[1];
            }
            // consider cookie if a name has been given
            if (authCookieName) {
              const token = req.cookies[authCookieName || 'access_token'];
              if (token) {
                return token;
              }
            }
            return null;
          },
        }),
      );
    }

    const server = http.createServer(app);
    const io = new SocketIoServer(server, {
      cors: { origin: true },
    });
    io.use(socketIoCookieJwt({ jwtSecret, cookieName: authCookieName }));
    initSockets(io, jwtSecret && ioAuthHandler ? ioAuthHandler : () => true);
    const notifier = createNotifier(
      io,
      jwtSecret && changeInfoAuthHandler ? changeInfoAuthHandler : () => true,
    );
    app.post('/change', notifier);

    server.listen(port, host);
    server.on('listening', resolve);
    server.on('error', reject);
  })
    .catch((err) => {
      log.error(`Can't run HTTP server: ${err}`);
    })
    .then(() => {
      log.info(
        `HTTP API listening on port ${port}, ${
          jwtSecret && credentialsRequired ? 'requiring ' : 'checking for '
        } a JWT Bearer token${
          authCookieName ? ` or a cookie named ${authCookieName}` : ''
        }`,
      );
    });
};

export { runExpress };
