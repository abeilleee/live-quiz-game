import { WebSocket } from "ws";
import { CLIENT_MSG, ERROR, SERVER_MSG } from "../constants";
import { gameStore } from "../store/gameStore";
import { AnswerData } from "../types";
import { Logger } from "../utils/logger";
import { sendTo } from "../utils/sendTo";

export const handleAnswer = ({
  ws,
  payload,
  playerIndex,
}: {
  ws: WebSocket;
  payload: AnswerData;
  playerIndex: string;
}) => {
  const result = gameStore.dispatch({
    type: CLIENT_MSG.ANSWER,
    payload: { ...payload, playerIndex },
  });

  if (!result.success) {
    Logger.error(result.errorText ?? ERROR.UNEXPECTED_ERROR);
    sendTo(ws, SERVER_MSG.ERROR, {
      message: result.errorText,
    });

    return;
  }

  sendTo(ws, SERVER_MSG.ANSWER_ACCEPTED, result.data);
};
