import { runExpress } from './express.js';

export const express = (config) => (correlationConfig) =>
  runExpress(correlationConfig, config);
