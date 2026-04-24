import { WebSocketServer, WebSocket } from 'ws';
import { Logger } from './utils/logger';
import { Game, Player, ServerResponse } from './types';
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

const broadcastToGameParticipants = (game: Game, message: ServerResponse) => {
  const participantIndexes = new Set<string>([
    String(game.hostId),
    ...game.players.map((player) => String(player.index)),
  ]);

  wsToUser.forEach((sessionUser, socket) => {
    if (participantIndexes.has(sessionUser.index)) {
      sendToSocket(socket, message);
    }
  });
};

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

        let lobbyGame: Game | undefined;
        for (const game of gameStore.getState().values()) {
          if (game.id === joinResult.gameId) {
            lobbyGame = game;
            break;
          }
        }

        const lobbyRecipients = new Set<string>(
          lobbyGame
            ? [
                String(lobbyGame.hostId),
                ...joinResult.players.map((player) => String(player.index)),
              ]
            : joinResult.players.map((player) => String(player.index))
        );

        wsToUser.forEach((sessionUser, socket) => {
          if (!lobbyRecipients.has(sessionUser.index)) {
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

      case CLIENT_MSG.START_GAME: {
        if (!user) {
          sendToSocket(ws, {
            type: SERVER_MSG.ERROR,
            data: { message: 'Please register first' },
            id: BASE_IDX,
          });
          break;
        }

        const startResult = gameStore.dispatch({
          type: CLIENT_MSG.START_GAME,
          payload: { ...msg.data, hostId: user.index },
        });

        if (
          !('success' in startResult) ||
          !startResult.success ||
          !('question' in startResult) ||
          !startResult.question ||
          !('game' in startResult) ||
          !startResult.game
        ) {
          sendToSocket(ws, {
            type: SERVER_MSG.ERROR,
            data: {
              message:
                'errorText' in startResult && startResult.errorText
                  ? startResult.errorText
                  : 'Failed to start game',
            },
            id: BASE_IDX,
          });
          break;
        }

        broadcastToGameParticipants(startResult.game, {
          type: SERVER_MSG.QUESTION,
          data: startResult.question,
          id: BASE_IDX,
        });
        break;
      }
    }
  });
});
