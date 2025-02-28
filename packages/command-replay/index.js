import fs from 'fs/promises';
import readline from 'readline';
import fetch from 'node-fetch';
import enquirer from 'enquirer';
import jwt from 'jsonwebtoken';
import { getLogger } from '@lazyapps/logger';
import { Command } from 'commander';

const { prompt } = enquirer;
const log = getLogger('CommandReplay');

let baseUrl;
let commandApiUrl;
let tokenApiUrl;
let adminApiUrl;

const setBaseUrl = (url) => {
  baseUrl = url;
  commandApiUrl = `${baseUrl}/api/command`;
  tokenApiUrl = `${baseUrl}/api/tokens`;
  adminApiUrl = `${baseUrl}/api/admin`;
};

const delay = (ms) => () => new Promise((resolve) => setTimeout(resolve, ms));

const readCommandFile = (filePath) =>
  fs.open(filePath).then((fileHandle) => {
    const rl = readline.createInterface({
      input: fileHandle.createReadStream(),
      crlfDelay: Infinity,
    });
    return { rl, fileHandle };
  });

const replayCommand = async (command, options) => {
  let token = options.token;

  if (!options.noAuth && command.auth) {
    if (command.auth.user === options.username) {
      // Case 1: Auth matches current user - use the token we got from the token service
      token = options.token;
    } else {
      // Case 3: Auth exists but different user - create self-signed token
      token = await createSelfSignedToken(
        command.auth,
        options.jwtsecretPath,
        options.issuer,
      );
    }
  } else {
    // Case 2: No auth - don't send a token
    token = undefined;
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  return fetch(commandApiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      command: command.command,
      aggregateName: command.aggregateName,
      aggregateId: command.aggregateId,
      payload: command.payload,
    }),
  }).then((response) => {
    if (!response.ok) {
      const error = new Error(
        `Failed to replay command: ${response.statusText}`,
      );
      if (!options.continueOnError) throw error;
      log.error(error.message);
    }
    return options.delayBetweenCommands > 0
      ? delay(options.delayBetweenCommands)()
      : Promise.resolve();
  });
};

const createSelfSignedToken = async (auth, jwtsecretPath, issuer) => {
  if (!jwtsecretPath) {
    throw new Error('JWT secret file is required for self-signing tokens');
  }

  const cachedToken = tokenCache.get(auth.user);
  if (cachedToken) return cachedToken;

  const jwtsecret = (await fs.readFile(jwtsecretPath, 'utf8')).trim();
  const tokenPayload = { ...auth };
  delete tokenPayload.iat;
  delete tokenPayload.exp;
  delete tokenPayload.iss;

  const token = jwt.sign(tokenPayload, jwtsecret, {
    expiresIn: '6h',
    ...(issuer && { issuer }),
  });
  tokenCache.set(auth.user, token);
  return token;
};

let tokenCache = new Map();

const processLine = (line, options) =>
  Promise.resolve()
    .then(() => {
      try {
        return JSON.parse(line);
      } catch (error) {
        log.error(`Failed to parse command: ${error.message}`);
        if (!options.continueOnError) throw error;
        return null;
      }
    })
    .then((command) => {
      if (!command) return Promise.resolve();
      log.info(`Replaying command: ${command.command}`);
      return replayCommand(command, options);
    });

const fetchToken = ({ username, password }) =>
  fetch(tokenApiUrl + '/getJwt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/plain',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  }).then((res) => res.text());

const readUserNameAndPassword = () =>
  prompt([
    { type: 'input', name: 'username', message: 'Username:' },
    {
      type: 'password',
      name: 'password',
      message: 'Password:',
    },
  ]);

const setReplayState = async (state, token) => {
  log.info(`Setting replay state to: ${state}`);

  return fetch(`${adminApiUrl}/setReplayState`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      params: { state },
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to set replay state: ${response.statusText}`);
    }
  });
};

const program = new Command();
program
  .requiredOption('-f, --file <path>', 'Command file to replay')
  .option('-u, --url <url>', 'Base URL for the API', 'http://localhost')
  .option('-d, --delay <ms>', 'Delay between commands in milliseconds', '200')
  .option(
    '-c, --continue-on-error',
    'Continue processing if a command fails',
    false,
  )
  .option(
    '-n, --noAuth',
    'Skip authentication (no username/password query, no token handling)',
    false,
  )
  .option(
    '-j, --jwtsecret <path>',
    'Path to JWT secret file for self-signing tokens',
  )
  .option('-i, --issuer <name>', 'Issuer name for self-signed tokens')
  .parse();

const options = program.opts();

// Set base URL immediately
setBaseUrl(options.url);

// Convert delay to number
options.delayBetweenCommands = parseInt(options.delay, 10);

// Show summary and ask for confirmation
const showSummaryAndConfirm = async () => {
  console.log('\nCommand Replay Configuration:');
  console.log('----------------------------');
  console.log(`Command File: ${options.file}`);
  console.log(`Base URL: ${options.url}`);
  console.log(`Delay between commands: ${options.delayBetweenCommands}ms`);
  console.log(`Continue on error: ${options.continueOnError}`);
  console.log(`Skip authentication: ${options.noAuth}`);
  if (!options.noAuth && options.jwtsecret) {
    console.log(`JWT Secret File: ${options.jwtsecret}`);
    if (options.issuer) {
      console.log(`Token Issuer: ${options.issuer}`);
    }
  }
  console.log('----------------------------\n');

  let token, username;
  if (!options.noAuth) {
  const credentials = await readUserNameAndPassword();
    token = await fetchToken(credentials);
    username = credentials.username;
  }

  const { confirmed } = await prompt({
    type: 'confirm',
    name: 'confirmed',
    message: 'Do you want to proceed with these settings?',
  });

  if (!confirmed) {
    console.log('Operation cancelled by user');
    process.exit(0);
  }

  return { token, username };
};

// Main execution
showSummaryAndConfirm()
  .then(({ token, username }) => {
    const options = {
      ...program.opts(),
      token,
      username,
      jwtsecretPath: program.opts().jwtsecret,
    };

    return setReplayState(true, token)
      .then(() =>
        readCommandFile(options.file).then(
          ({ rl, fileHandle }) =>
            new Promise((resolve, reject) => {
              let processPromise = Promise.resolve();

              rl.on('line', (line) => {
                processPromise = processPromise
                  .then(() => processLine(line, options))
                  .catch(reject);
              });

              rl.on('close', () => {
                processPromise
                  .then(() => fileHandle.close())
                  .then(resolve)
                  .catch(reject);
              });

              rl.on('error', reject);
            }),
        ),
      )
      .finally(() =>
        setReplayState(false, token).catch((stateError) => {
          log.error(`Failed to disable replay state: ${stateError}`);
        }),
      );
  })
  .catch((err) => {
    log.error(`Error during command replay: ${err}`);
    process.exit(1);
  });
