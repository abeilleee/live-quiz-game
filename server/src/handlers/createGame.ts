import { WebSocket } from "ws";
import { CLIENT_MSG, ERROR, SERVER_MSG } from "../constants";
import { gameStore } from "../store/gameStore";
import { CreateGameData } from "../types";
import { wsToUser } from "../store/session";
import { sendTo } from "../utils/sendTo";

export const handleCreateGame = ({
  ws,
  payload,
}: {
  ws: WebSocket;
  payload: CreateGameData;
}) => {
  const hostId = wsToUser.get(ws)?.index;

  if (!hostId) {
    sendTo(ws, SERVER_MSG.ERROR, {
      message: ERROR.FAILED_TO_CREATE_GAME,
    });

    return;
  }

  const { success, data } = gameStore.dispatch({
    type: CLIENT_MSG.CREATE_GAME,
    payload: { ...payload, hostId },
  });

  if (!success) {
    sendTo(ws, SERVER_MSG.ERROR, {
      message:
        data && "errorText" in data && data.errorText
          ? data.errorText
          : ERROR.FAILED_TO_CREATE_GAME,
    });

    return;
  }

  sendTo(ws, SERVER_MSG.GAME_CREATED, { ...data });
};
