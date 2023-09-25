import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import http from 'http';

import { getLogger, getStream } from '@lazyapps/logger';
import { login, logout, getJwt } from './handlers.js';

const log = getLogger('Tokens/HTTP');

const runExpress = (config) => {
  const { port = 80, host = '0.0.0.0' } = config;
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(cors());
    app.use(morgan('dev', { stream: getStream(log.debug) }));
    app.use(bodyParser.json());

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
