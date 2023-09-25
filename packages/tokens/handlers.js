import jwt from 'jsonwebtoken';

import { getLogger } from '@lazyapps/logger';

const log = getLogger('Tokens/Handlers');

const createJwt = (config, req) => {
  const input = req.body;
  try {
    const { claims, options } = config.getClaims(input);
    return jwt.sign(claims, config.secret, options);
  } catch (err) {
    log.error(`Error fetching claims: ${err}`);
    throw err;
  }
};

export const login = (config) => (req, res) => {
  const token = createJwt(config, req);

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
