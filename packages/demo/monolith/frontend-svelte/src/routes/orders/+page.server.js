import { query } from '$lib/query.js';

export function load() {
  return {
    items: query('ordersOverview', 'all'),
  };
}
