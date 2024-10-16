import fetch from 'isomorphic-fetch';

export const changeNotificationSenderFetch = ({ url, jwt }) => ({
  sendChangeNotification: (correlationId, content) => {
    const headers = { 'Content-Type': 'application/json' };
    if (jwt) {
      headers.Authorization = `Bearer ${jwt}`;
    }
    content.correlationId = correlationId;
    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(content),
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
