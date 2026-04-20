import { WebSocketServer } from 'ws';
import { Logger } from './utils/logger';
import { ServerResponse } from './types';
import { BASE_IDX, CLIENT_MSG } from './constants';
import { userStore } from './store/userStore';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });
Logger.success(`🚀 Websocker server started on ${PORT} port`);

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());
    const type = msg.type;

    if (type === CLIENT_MSG.REGISTER) {
      const { success, data } = userStore.dispatch({
        type: CLIENT_MSG.REGISTER,
        payload: msg.data,
      });

      const response: ServerResponse = {
        type: CLIENT_MSG.REGISTER,
        data: {
          name: data?.name ?? '',
          index: data.index,
          error: !success,
          errorText: data?.errorText ?? '',
        },
        id: BASE_IDX,
      };

      ws.send(JSON.stringify(response));
    }
  });
});
