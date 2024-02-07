import { start } from '@lazyapps/bootstrap';
import { express } from '@lazyapps/tokens';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Create PWDHASH using `create-hash.js` in this directory.

const readSecretFiles = (names) =>
  names.map((name) => fs.readFileSync(`/run/secrets/${name}`, 'utf8').trim());

const [USERNAME, JWT_SECRET, PWDHASH] = readSecretFiles([
  'username',
  'jwt-secret',
  'pwdhash',
]);

const getClaims = (input) => {
  const { username, password } = input;
  if (username !== USERNAME) {
    throw new Error('Invalid username');
  }
  if (
    !bcrypt.compareSync(
      password,
      Buffer.from(PWDHASH, 'base64').toString('utf-8'),
    )
  ) {
    throw new Error('Invalid password');
  }

  return {
    claims: {
      user: username,
      admin: true,
    },
    options: {
      expiresIn: '24h',
      issuer: 'millionaire',
    },
  };
};

start({
  tokens: {
    listener: express({
      port: process.env.EXPRESS_PORT || 80,
      getClaims,
      secret: JWT_SECRET,
    }),
  },
});
