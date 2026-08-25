import { WebSocket } from "ws";
import { CLIENT_MSG, SERVER_MSG } from "../constants";
import { gameStore } from "../store/gameStore";
import { CreateGameData } from "../types";
import { sendTo } from "../utils/sendTo";

export const handleCreateGame = ({
  ws,
  payload,
  hostId,
}: {
  ws: WebSocket;
  payload: CreateGameData;
  hostId: string;
}) => {
  const result = gameStore.dispatch({
    type: CLIENT_MSG.CREATE_GAME,
    payload: { ...payload, hostId },
  });

  if (!result.success) {
    sendTo(ws, SERVER_MSG.ERROR, {
      message: result.errorText,
    });

    return;
  }

  sendTo(ws, SERVER_MSG.GAME_CREATED, result.data);
};
