import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import http from 'http';

import { getLogger, getStream } from '@lazyapps/logger';
import { login, logout, getJwt, authStatus } from './handlers.js';
import { nanoid } from 'nanoid';
import { expressjwt } from 'express-jwt';
import cookieParser from 'cookie-parser';

const log = getLogger('Tokens/HTTP', 'INIT');

const correlationId = (correlationConfig) => (req, res, next) => {
  // check where a correlation Id might already exist
  const existingId = req.body.correlationId || req.headers['x-correlation-id'];

  // since we want to use it in code, make sure the body
  // now has an id in any case
  req.body.correlationId =
    existingId || `${correlationConfig?.serviceId || 'UNK'}-${nanoid()}`;

  // also in the result, not needed right now but can't hurt
  // for debugging
  res.setHeader('X-Correlation-ID', req.body.correlationId);
  next();
};

morgan.token('correlation-id', function (req) {
  return req.body.correlationId;
});

export const runExpress = (correlationConfig, config) => {
  const {
    port = 80,
    host = '0.0.0.0',
    secret: jwtSecret,
    authCookieName,
    credentialsRequired,
  } = config;
  return new Promise((resolve, reject) => {
    const app = express();
    app.set('etag', false);
    app.use(cors());
    app.use(bodyParser.json());
    app.use(correlationId(correlationConfig));
    app.use(
      morgan(
        '[:correlation-id] :method :url :status :response-time ms - :res[content-length]',
        { stream: getStream(log.debugBare) },
      ),
    );
    app.use(cookieParser());

    if (jwtSecret) {
      log.debug('Using JWT');
      app.use(
        expressjwt(
          defaultExpressJwtConfig(
            jwtSecret,
            authCookieName,
            credentialsRequired,
          ),
        ),
      );
    } else {
      log.debug('Not using JWT');
    }
    app.post('/login', login(config));
    app.get('/logout', logout(config));
    app.get('/authStatus', authStatus(config));
    app.post('/getJwt', getJwt(config));

    app.use(defaultExpressJwtExpiryHandler(authCookieName));
    const server = http.createServer(app);
    server.listen(port, host);
    server.on('listening', () => {
      resolve(server);
    });
    server.on('error', reject);
  })
    .catch((err) => {
      log.error(`Can't run HTTP server: ${err}`);
    })
    .then((server) => {
      log.info(`HTTP API listening on port ${port}`);
      return server;
    });
};

export const defaultExpressJwtConfig = (
  jwtSecret,
  authCookieName,
  credentialsRequired,
) => ({
  secret: jwtSecret,
  algorithms: ['HS256'],
  credentialsRequired: credentialsRequired || false,
  getToken: (req) => {
    const log = getLogger('Tokens/GetT', req.body.correlationId);
    if (
      req.headers.authorization &&
      req.headers.authorization.split(' ')[0] === 'Bearer'
    ) {
      log.debug('Using Authorization header');
      return req.headers.authorization.split(' ')[1];
    }
    if (authCookieName) {
      const token = req.cookies[authCookieName || 'access_token'];
      if (token) {
        log.debug('Using cookie');
        return token;
      }
    }
    log.debug('No token found');
    return null;
  },
});

export const defaultExpressJwtExpiryHandler =
  (authCookieName) => (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.clearCookie(authCookieName || 'access_token', {
        httpOnly: true,
        sameSite: 'strict',
      });
      res.status(401).json({
        error: 'Token expired or invalid',
        code: 'token_expired',
      });
    } else {
      next(err);
    }
  };
