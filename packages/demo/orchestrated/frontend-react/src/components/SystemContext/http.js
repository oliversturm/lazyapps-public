const query =
  (endpoint) =>
  (correlationId, readModelName, resolverName, params = {}) => {
    const url = new URL(`/query/${readModelName}/${resolverName}`, endpoint);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId,
      },
      body: JSON.stringify(params),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Fetch error: ${res.status}/${res.statusText}`);
        }
        return res;
      })
      .then((res) => res.json())
      .catch((err) => {
        console.error(
          `Can't query ${url} with params ${JSON.stringify(params)}: ${err}`,
        );
      });
  };

const postCommand = (endpoint, content) => {
  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Fetch error: ${res.status}/${res.statusText}`);
      }
      return res;
    })
    .catch((err) => {
      console.error(
        `Can't post command to ${endpoint} with content ${JSON.stringify(
          content,
        )}: ${err}`,
      );
    });
};

export { query, postCommand };
