import { runExpress } from './express.js';

export const express = (config) => () => runExpress(config);
