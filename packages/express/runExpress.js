import expressApp from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { expressjwt } from 'express-jwt';
import { getStream } from '@lazyapps/logger';

export const runExpress =
  ({
    port,
    interfaceIp,
    log,
    installHandlers,
    jwtSecret,
    authCookieName,
    credentialsRequired,
  }) =>
  (context) => {
    return new Promise((resolve, reject) => {
      const app = expressApp();
      app.use(cors());
      app.use(morgan('dev', { stream: getStream(log.debug) }));
      app.use(bodyParser.json());
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
