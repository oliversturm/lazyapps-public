import { query } from '$lib/query.js';

export function load() {
  return {
    // top level, await the promise
    items: query('customersOverview', 'all'),
  };
}
