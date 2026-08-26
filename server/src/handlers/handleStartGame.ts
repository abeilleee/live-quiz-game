import { WebSocket } from "ws";
import { StartGameData } from "../types";
import { gameStore } from "../store/gameStore";
import { CLIENT_MSG, ERROR, SERVER_MSG } from "../constants";
import { sendTo } from "../utils/sendTo";
import { broadcastToParticipants } from "../utils/broadcastToParticipants";
import { Logger } from "../utils/logger";

export const handleStartGame = ({
  ws,
  payload,
  hostId,
}: {
  ws: WebSocket;
  payload: StartGameData;
  hostId: string;
}) => {
  const result = gameStore.dispatch({
    type: CLIENT_MSG.START_GAME,
    payload: { ...payload, hostId },
  });

  if (!result.success) {
    Logger.error(result.errorText ?? ERROR.UNEXPECTED_ERROR);
    sendTo(ws, SERVER_MSG.ERROR, {
      message: result.errorText,
    });

    return;
  }

  const { data, game } = result;

  if (!game) {
    Logger.error(ERROR.UNEXPECTED_ERROR);
    return;
  }

  Logger.success("Game started");

  broadcastToParticipants({
    room: game.code,
    payload: {
      type: SERVER_MSG.QUESTION,
      data: data,
    },
  });
};
