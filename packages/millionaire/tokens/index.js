import { start } from '@lazyapps/bootstrap';
import { express } from '@lazyapps/tokens';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Create PWDHASH using something like this:
// ➜ node
// Welcome to Node.js v16.15.0.
// Type ".help" for more information.
// > var bcrypt = require('bcryptjs')
// undefined
// > btoa(bcrypt.hashSync('testpwd',10))
// 'JDJhJDEwJElxSGNxOFBvTnZSZHk0NGpVMnF3TXUzN1ZwVmlKMjNaWG1sY3FZcHF3eVlVd3ZDbVBBb29l'
// >

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
  if (!bcrypt.compareSync(password, atob(PWDHASH))) {
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
