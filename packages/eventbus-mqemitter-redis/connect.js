import mqRedis from 'mqemitter-redis';

// we're doing this in case the connection throws
export const connect = (params) =>
  new Promise((res) => {
    res(mqRedis(params));
  });
