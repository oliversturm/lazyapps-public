import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const decodeToken = (jwtSecret, token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    return null;
  }
};

// Note that this middleware is written to extract the token
// if it can be found, but to simply proceed if it can't.

// Also note: the headers are always the ones from the first
// connection (https://github.com/socketio/socket.io/issues/2860#issuecomment-781411803) --
// so if I needed to refresh the token on the client, it would
// be necessary to reconnect to the server.
export const socketIoCookieJwt =
  ({ cookieName = 'access_token', jwtSecret }) =>
  (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      socket.decoded_token = decodeToken(jwtSecret, token);
    } else {
      const cookieHeader = socket.handshake.headers.cookie;
      if (cookieHeader) {
        const cookies = cookie.parse(cookieHeader);
        if (cookies[cookieName]) {
          socket.decoded_token = decodeToken(jwtSecret, cookies[cookieName]);
        }
      }
    }
    next();
  };
