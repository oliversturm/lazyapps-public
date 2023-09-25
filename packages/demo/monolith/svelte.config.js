import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    appDir: `./frontend-svelte/_app`,
    files: {
      assets: `./frontend-svelte/static`,
      hooks: {
        client: `./frontend-svelte/src/hooks.client`,
        server: `./frontend-svelte/src/hooks.server`,
      },
      lib: `./frontend-svelte/src/lib`,
      params: `./frontend-svelte/src/params`,
      routes: `./frontend-svelte/src/routes`,
      serviceWorker: `./frontend-svelte/src/service-worker`,
      appTemplate: `./frontend-svelte/src/app.html`,
    },
    outDir: `./frontend-svelte/.svelte-kit`,
  },
};

export default config;
