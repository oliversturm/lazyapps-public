import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import http from 'http';

import { getLogger, getStream } from '@lazyapps/logger';
import { login, logout, getJwt } from './handlers.js';
import { nanoid } from 'nanoid';

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

const runExpress = (correlationConfig, config) => {
  const { port = 80, host = '0.0.0.0' } = config;
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(correlationId(correlationConfig));
    app.use(
      morgan(
        '[:correlation-id] :method :url :status :response-time ms - :res[content-length]',
        { stream: getStream(log.debugBare) },
      ),
    );

    const server = http.createServer(app);
    app.post('/login', login(config));
    app.get('/logout', logout(config));
    app.post('/getJwt', getJwt(config));

    server.listen(port, host);
    server.on('listening', resolve);
    server.on('error', reject);
  })
    .catch((err) => {
      log.error(`Can't run HTTP server: ${err}`);
    })
    .then(() => {
      log.info(`HTTP API listening on port ${port}`);
    });
};

export { runExpress };
