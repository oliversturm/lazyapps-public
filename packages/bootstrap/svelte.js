import { createServer, createLogger as createViteLogger } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { getLogger } from '@lazyapps/logger';

// Note, the custom logger stuff is currently
// missing from vite docs. Best example I found
// is here: https://github.com/vitejs/vite/issues/10940
// There's a PR for the upcoming docs as well,
// but it's hard to read and not very verbose.

const log = getLogger('BS/Svelte');
const viteLog = getLogger('BS/Svelte/Vite');
const viteOrigLogger = createViteLogger();
// Sometimes vite sends empty output with a
// warn level, so prevent this from being logged.
const wrap = (f) => (msg) => msg ? f(msg) : undefined;
const customLogger = {
  ...viteOrigLogger,
  info: wrap(viteLog.info), // ignoring second parameter options
  warn: wrap(viteLog.warn),
  error: wrap(viteLog.error),
};

export const startSvelteKit = ({
  port = 5173,
  host = 'localhost',
  logLevel = 'info',
  mqCommandsPort = 51883,
  mqQueriesPort = 51884,
} = {}) => {
  const config = {
    plugins: [sveltekit()],

    server: {
      host,
      port,
    },

    define: {
      // Decided to use the 'process.env' prefix here, because
      // otherwise the defined value will be marked as an error
      // by eslint. In the context of this monolith setup, the
      // use as an actual environment variable is not relevant.
      'process.env.MQ_COMMANDS_PORT': JSON.stringify(mqCommandsPort),
      'process.env.MQ_QUERIES_PORT': JSON.stringify(mqQueriesPort),
    },

    clearScreen: false,
    logLevel,
    customLogger,
  };

  return createServer(config)
    .then((server) =>
      server.listen().then(() => {
        server.printUrls();
      })
    )
    .then(() => {
      log.debug(`SvelteKit frontend started on ${host}:${port}`);
    })
    .catch((err) => {
      log.error(
        `An error occurred starting the SvelteKit frontend on ${host}:${port}`,
        err
      );
    });
};
