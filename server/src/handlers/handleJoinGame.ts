import { WebSocket } from "ws";
import { JoinGameData } from "../types";
import { sendTo } from "../utils/sendTo";
import { CLIENT_MSG, SERVER_MSG } from "../constants";
import { gameStore } from "../store/gameStore";
import { broadcastToParticipants } from "../utils/broadcastToParticipants";

export const handleJoinGame = ({
  ws,
  payload,
  name,
  index,
}: {
  ws: WebSocket;
  payload: JoinGameData;
  /** user name */
  name: string;
  /** user index */
  index: string;
}) => {
  const result = gameStore.dispatch({
    type: CLIENT_MSG.JOIN_GAME,
    payload: { ...payload, player: { name, index, score: 0 } },
  });

  if (!result.success) {
    sendTo(ws, SERVER_MSG.ERROR, {
      message: result.errorText,
    });

    return;
  }

  const { data, game } = result;

  if (!game) {
    return;
  }

  sendTo(ws, SERVER_MSG.GAME_JOINED, data);

  // Notify all game participants
  broadcastToParticipants({
    room: payload.code,
    payload: {
      type: SERVER_MSG.PLAYER_JOINED,
      data: { playerName: name, playerCount: game.players.length },
    },
  });

  broadcastToParticipants({
    room: payload.code,
    payload: {
      type: SERVER_MSG.UPDATE_PLAYERS,
      data: game.players.map(({ name, index, score }) => ({
        name,
        index,
        score,
      })),
    },
  });
};
