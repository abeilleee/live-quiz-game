import { WebSocketServer, WebSocket } from 'ws';
import { Logger } from './utils/logger';
import { Player, ServerResponse } from './types';
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

type SessionUser = { index: string; name: string };
const wsToUser = new Map<WebSocket, SessionUser>();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());
    const type = msg.type;
    const user = wsToUser.get(ws);
    let response: ServerResponse | undefined;

    switch (type) {
      case CLIENT_MSG.REGISTER: {
        const { success, data } = userStore.dispatch({
          type: CLIENT_MSG.REGISTER,
          payload: msg.data,
        });

        response = {
          type: SERVER_MSG.REGISTER,
          data: {
            name: data?.name ?? '',
            index: data.index,
            error: !success,
            errorText: data?.errorText ?? '',
          },
          id: BASE_IDX,
        };

        wsToUser.set(ws, { index: String(data.index), name: data.name });
        sendToSocket(ws, response);

        break;
      }

      case CLIENT_MSG.CREATE_GAME: {
        if (!user) {
          sendToSocket(ws, {
            type: SERVER_MSG.ERROR,
            data: { message: 'Please register first' },
            id: BASE_IDX,
          });
          break;
        }

        const { gameId, code } = gameStore.dispatch({
          type: CLIENT_MSG.CREATE_GAME,
          payload: { ...msg.data, hostId: user.index },
        });

        response = {
          type: SERVER_MSG.GAME_CREATED,
          data: { gameId, code },
          id: BASE_IDX,
        };

        sendToSocket(ws, response);

        break;
      }

      case CLIENT_MSG.JOIN_GAME: {
        if (!user) {
          sendToSocket(ws, {
            type: SERVER_MSG.ERROR,
            data: { message: 'Please register first' },
            id: BASE_IDX,
          });
          break;
        }

        const joinedPlayer: Player = {
          name: user.name,
          index: user.index,
          score: 0,
        };

        const joinResult = gameStore.dispatch({
          type: CLIENT_MSG.JOIN_GAME,
          payload: { ...msg.data, player: joinedPlayer },
        });

        if (!joinResult.success || !joinResult.gameId || !joinResult.players) {
          sendToSocket(ws, {
            type: SERVER_MSG.ERROR,
            data: { message: joinResult.errorText || 'Failed to join game' },
            id: BASE_IDX,
          });
          break;
        }

        sendToSocket(ws, {
          type: SERVER_MSG.GAME_JOINED,
          data: { gameId: joinResult.gameId },
          id: BASE_IDX,
        });

        const playerIndexes = new Set(joinResult.players.map((player) => String(player.index)));
        wsToUser.forEach((sessionUser, socket) => {
          if (!playerIndexes.has(sessionUser.index)) {
            return;
          }

          sendToSocket(socket, {
            type: SERVER_MSG.PLAYER_JOINED,
            data: {
              playerName: joinResult.joinedPlayerName ?? joinedPlayer.name,
              playerCount: joinResult.players?.length ?? 0,
            },
            id: BASE_IDX,
          });
          sendToSocket(socket, {
            type: SERVER_MSG.UPDATE_PLAYERS,
            data: joinResult.players,
            id: BASE_IDX,
          });
        });

        break;
      }
    }
  });
});
