import { WebSocket } from "ws";
import { wsToUser } from "../store/session";
import { gameStore } from "../store/gameStore";
import { broadcastToParticipants } from "../utils/broadcastToParticipants";
import { GAME_ACTION, SERVER_MSG } from "../constants";
import { Logger } from "../utils/logger";

export const handleDisconnect = ({ ws }: { ws: WebSocket }) => {
  const user = wsToUser.get(ws);

  if (!user || !user.name) {
    return;
  }

  const { success, game } = gameStore.dispatch({
    type: GAME_ACTION.REMOVE_PLAYER,
    payload: { playerIndex: user.index },
  });

  if (success && game) {
    Logger.user(`User ${user.name} left game ${game.code}`);
    broadcastToParticipants({
      room: game.code,
      payload: {
        type: SERVER_MSG.UPDATE_PLAYERS,
        data: game.players.map(({ name, index, score }) => ({
          name,
          index,
          score,
        })),
      },
    });
  } else {
    Logger.user(`User ${user.name} disconnected`);
  }

  wsToUser.delete(ws);
};
