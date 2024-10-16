import fetch from 'isomorphic-fetch';

export const commandSenderFetch = ({ url, jwt }) => ({
  sendCommand: (correlationId, cmd) => {
    const headers = { 'Content-Type': 'application/json' };
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }
    cmd.correlationId = correlationId;
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(cmd),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(
          `[${correlationId}] Fetch error: ${res.status}/${res.statusText}`,
        );
      }
      return res;
    });
  },
});
