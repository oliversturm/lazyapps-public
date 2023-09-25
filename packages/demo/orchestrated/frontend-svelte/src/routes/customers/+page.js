import { query } from '$lib/query.js';

// This demo works client-side only. I made that
// decision only because the URLs I'm using through
// traefik are different from the server-side
// ones and I wanted to keep things "simple".
export const ssr = false;

const readModelEndpoint =
  import.meta.env.VITE_RM_CUSTOMERS_URL || 'http://127.0.0.1:3003'; // customers

export function load({ fetch }) {
  return {
    items: query(fetch)(readModelEndpoint, 'overview', 'all'),
  };
}
