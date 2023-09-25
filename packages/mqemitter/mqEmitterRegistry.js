import { getLogger } from '@lazyapps/logger';
import cs from 'mqemitter-cs';
import net from 'node:net';

const log = getLogger('MQ/Reg');

// These emitters are process bounded and they must be shared
// between different parts of the process. In the case of
// the frontend processes that use vite (or whatever bundler)
// this is not easily done by way of injection. I considered
// using a bundler plugin to inject the emitters, but that
// is quite specific to the bundler. After some research, it
// also appears to be impossible to inject a specific object
// reference into the vite process. It cleans up in such a strange
// way that all imports in the vite context are separate from
// those outside it. I created a registry of emitters so they
// can be shared efficiently between the parts of the monolith
// process that don't have a problem with it, and for other
// parts there is a simple network server instead.

const emitters = new Map();

export const registerSharedMqEmitter = (name, emitter, port = undefined) => {
  log.debug(`Registering shared MQ emitter: ${name}`);
  emitters.set(name, emitter);
  if (port) {
    log.debug(`Publishing shared MQ emitter ${name} on port ${port}`);
    const server = net.createServer(cs.server(emitter));
    server.on('listening', () => {
      log.debug(`MQ emitter ${name} listening on port ${port}`);
    });
    server.listen(port);
  }
};

export const getSharedMqEmitter = (name) => {
  if (!emitters.has(name)) {
    throw new Error(`No shared MQ emitter registered for name: ${name}`);
  }
  log.debug(`Getting shared MQ emitter: ${name}`);
  return emitters.get(name);
};

export const getPublishedMqEmitter = (port) => {
  log.debug(`Getting published MQ emitter on port ${port}`);
  return cs.client(net.connect(port));
};
