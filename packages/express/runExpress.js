import expressApp from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { expressjwt } from 'express-jwt';
import { getStream } from '@lazyapps/logger';
import { nanoid } from 'nanoid';
import {
  defaultExpressJwtConfig,
  defaultExpressJwtExpiryHandler,
} from '@lazyapps/tokens/express.js';

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

export const runExpress =
  ({
    log,
    port,
    interfaceIp,
    installHandlers,
    jwtSecret,
    authCookieName,
    credentialsRequired,
    customizeExpress = () => {},
  }) =>
  (context) => {
    return new Promise((resolve, reject) => {
      const app = expressApp();
      app.use(cors());
      app.use(bodyParser.json());
      app.use(correlationId(context.correlationConfig));
      app.use(
        morgan(
          '[:correlation-id] :method :url :status :response-time ms - :res[content-length]',
          { stream: getStream(log.debugBare) },
        ),
      );
      app.use(cookieParser());

      if (jwtSecret) {
        app.use(
          expressjwt(
            defaultExpressJwtConfig(
              jwtSecret,
              authCookieName,
              credentialsRequired,
            ),
          ),
        );
      }

      installHandlers(context, app);

      customizeExpress(context, app);

      app.use(defaultExpressJwtExpiryHandler(authCookieName));
      const server = app.listen(port, interfaceIp || '0.0.0.0');

      server.on('error', (err) => {
        log.error(`Server error: ${err}`);
        reject(err);
      });
      server.on('listening', () => {
        const addr = server.address();
        log.info(
          `Server listening on ${addr.address}:${addr.port}, ${
            jwtSecret ? 'with JWT' : 'without JWT'
          }`,
        );
        resolve(server);
      });
    });
  };
