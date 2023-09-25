import io from 'socket.io-client';

const getKey = ({ endpointName, readModelName, resolverName }) =>
  `${endpointName}/${readModelName}/${resolverName}`;

const activateChangeNotifier = (endpoint, sourceMap, store) => {
  const registerResolvers = sourceMap.map(
    ({ endpointName, readModelName, resolverName }) => ({
      endpointName,
      readModelName,
      resolverName,
    })
  );

  const socket = io(endpoint);
  socket.on('connect', () => {
    socket.emit('register', registerResolvers);
  });

  const actionCreatorMap = sourceMap.reduce(
    (r, v) => ({
      ...r,
      [getKey(v)]: v.actionCreator,
    }),
    {}
  );

  socket.on('change', changeInfo => {
    store.dispatch(actionCreatorMap[getKey(changeInfo)](changeInfo));
  });
};

export { activateChangeNotifier };
