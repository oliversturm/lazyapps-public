import fetch from 'node-fetch';
import { nanoid } from 'nanoid';

const gameSessionId = 'mRwpUYKP_FhpItbiE_4mL';
const COMMAND_API_URL = 'https://millionaire2.oliversturm.com/api/command';

const userDetails = [...Array(100).keys()].map((n) => ({
  viewName: `user${n}`,
  realName: `User ${n}`,
  gameSessionId,
  playerId: nanoid(),
}));

const promises = userDetails.map((ud) =>
  fetch(COMMAND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      aggregateName: 'gameSession',
      aggregateId: ud.gameSessionId,
      command: 'REGISTER_FFF_PLAYER',
      payload: ud,
    }),
  })
    .then((res) => {
      if (!res.ok) {
        console.log(
          `Error POSTing user ${ud.viewName}: ${res.status} ${res.statusText}`,
        );
      }
    })
    .then(() => {
      console.log(`Registered ${ud.viewName}`);
    }),
);

Promise.all(promises).then(() => {
  console.log('Done');
});
