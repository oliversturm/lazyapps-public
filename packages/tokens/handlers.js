import jwt from 'jsonwebtoken';

import { getLogger } from '@lazyapps/logger';

const createJwt = (config, req) => {
  const input = req.body;
  const log = getLogger('Tokens/Hndl', input.correlationId);

  try {
    const { claims, options } = config.getClaims(input);
    return jwt.sign(claims, config.secret, options);
  } catch (err) {
    log.error(`Error fetching claims: ${err}`);
    throw err;
  }
};

// I should probably have a real refresh token
// mechanism here. But since I only use this
// for the millionaire app, it is fine like this.
export const login = (config) => (req, res) => {
  const token = createJwt(config, req);
  const log = getLogger('Tokens/Hndl', req.body.correlationId);

  res.cookie(config.cookieName || 'access_token', token, {
    httpOnly: true,
    sameSite: 'strict',
  });
  if (req.query.redirect) {
    log.debug(`Redirecting to ${req.query.redirect}`);
    res.redirect(req.query.redirect);
  } else {
    res.sendStatus(200);
  }
};

export const logout = (config) => (req, res) => {
  res.clearCookie(config.cookieName || 'access_token', {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.sendStatus(200);
};

export const authStatus = (/*config*/) => (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  const hasAuth = !!req.auth;
  const log = getLogger('Tokens/Hndl', req.body.correlationId);
  log.debug(`Auth status: ${hasAuth}`);
  if (hasAuth) {
    log.debug(`Claims-: ${JSON.stringify(req.auth)}`);
  }
  if (hasAuth) {
    res.json({ status: 'authenticated', claims: req.auth });
  } else {
    res.json({ status: 'unauthenticated' });
  }
};
export const getJwt = (config) => (req, res) => {
  const token = createJwt(config, req);

  res.format({
    'application/json': () => {
      res.json({ token });
    },
    'text/plain': () => {
      res.send(token);
    },
  });
};
