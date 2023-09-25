import fetch from 'isomorphic-fetch';

export const commandSenderFetch = ({ url, jwt }) => ({
  sendCommand: (content) => {
    const headers = { 'Content-Type': 'application/json' };
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(content),
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Fetch error: ${res.status}/${res.statusText}`);
      }
      return res;
    });
  },
});
