import { useContext, useEffect } from 'react';

import { SystemContext } from './provider';
import { nanoid } from 'nanoid';

const useReadModel = (readModelSpec, handler, loadRequired) => {
  const { readModels } = useContext(SystemContext);
  useEffect(() => {
    const { endpoint, readModel, resolver, params } = readModelSpec;
    const correlationId = `REACT-${nanoid()}`;
    readModels[endpoint]
      .query(correlationId, readModel, resolver, params)
      .then(handler);
  }, [readModelSpec, handler, readModels, loadRequired]);
};

const useCommands = (options = {}) => {
  const { commands } = useContext(SystemContext);
  const finalCommands = options.chainHandler
    ? Object.keys(commands).reduce(
        (r, v) => ({
          ...r,
          [v]: (...args) => commands[v](...args).then(options.chainHandler),
        }),
        {},
      )
    : commands;
  return finalCommands;
};

export { useReadModel, useCommands };
