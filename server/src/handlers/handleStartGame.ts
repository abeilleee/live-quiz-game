import { WebSocket } from "ws";
import { StartGameData } from "../types";
import { gameStore } from "../store/gameStore";
import { CLIENT_MSG, ERROR, SERVER_MSG } from "../constants";
import { sendTo } from "../utils/sendTo";
import { Logger } from "../utils/logger";
import { deliverQuestion } from "./questionFlow";

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

  const { game } = result;

  if (!game) {
    Logger.error(ERROR.UNEXPECTED_ERROR);
    return;
  }

  Logger.success(`Game ${game.code} started`);
  deliverQuestion(game);
};
