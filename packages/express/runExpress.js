import expressApp from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { expressjwt } from 'express-jwt';
import { getStream } from '@lazyapps/logger';
import { nanoid } from 'nanoid';

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
          expressjwt({
            secret: jwtSecret,
            algorithms: ['HS256'],
            // I was tempted to set this to true, but then it
            // would be impossible to have, e.g., a command that
            // does not need authentication. So I'll leave this
            // false by default, and it can be overridden if
            // a service can only be used by authenticated users.
            // Must explicitly state `false`.
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

      installHandlers(context, app);

      customizeExpress(context, app);

      const server = app.listen(port, interfaceIp || '0.0.0.0');
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
