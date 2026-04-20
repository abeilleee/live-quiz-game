import { WebSocketServer, WebSocket } from 'ws';
import { Logger } from './utils/logger';
import { ServerResponse } from './types';
import { BASE_IDX, CLIENT_MSG, SERVER_MSG } from './constants';
import { userStore } from './store/userStore';
import { gameStore } from './store/gameStore';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });
Logger.success(`🚀 Websocker server started on ${PORT} port`);

const sendToSocket = (ws: WebSocket, response: ServerResponse) => {
  ws.send(JSON.stringify(response));
};

const wsToUser = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());
    const type = msg.type;
    let response: ServerResponse;

    switch (type) {
      case CLIENT_MSG.REGISTER:
        const { success, data } = userStore.dispatch({
          type: CLIENT_MSG.REGISTER,
          payload: msg.data,
        });

        response = {
          type: CLIENT_MSG.REGISTER,
          data: {
            name: data?.name ?? '',
            index: data.index,
            error: !success,
            errorText: data?.errorText ?? '',
          },
          id: BASE_IDX,
        };

        wsToUser.set(ws, { index: data.index });
        sendToSocket(ws, response);

        break;

      case CLIENT_MSG.CREATE_GAME:
        const { gameId, code } = gameStore.dispatch({
          type: SERVER_MSG.GAME_CREATED,
          payload: msg.data,
        });

        response = {
          type: SERVER_MSG.GAME_CREATED,
          data: { gameId, code },
          id: BASE_IDX,
        };

        sendToSocket(ws, response);

        break;
    }
  });
});
