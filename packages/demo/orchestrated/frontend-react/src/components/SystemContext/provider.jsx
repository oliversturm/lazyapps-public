import React, { useMemo } from 'react';

import { postCommand, query } from './http';

const SystemContext = React.createContext();

const SystemProvider = ({
  readModelEndpoints = {},
  commandEndpoint,
  aggregates = {},
  children,
}) => {
  const context = useMemo(
    () => ({
      readModels: Object.keys(readModelEndpoints).reduce(
        (r, v) => ({
          ...r,
          [v]: { query: query(readModelEndpoints[v]) },
        }),
        {}
      ),
      commands: Object.keys(aggregates).reduce(
        (r, aggregateName) => ({
          ...r,
          ...Object.keys(aggregates[aggregateName]).reduce(
            (r, cmdName) => ({
              ...r,
              [cmdName]: (aggregateId, payload) =>
                postCommand(commandEndpoint, {
                  aggregateName,
                  aggregateId,
                  command: aggregates[aggregateName][cmdName],
                  payload,
                }),
            }),
            {}
          ),
        }),
        {}
      ),
    }),
    [aggregates, readModelEndpoints, commandEndpoint]
  );
  return (
    <SystemContext.Provider value={context}>{children}</SystemContext.Provider>
  );
};

export { SystemContext, SystemProvider };
