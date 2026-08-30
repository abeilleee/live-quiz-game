import { WebSocket } from "ws";
import { CLIENT_MSG, ERROR, SERVER_MSG } from "../constants";
import { userStore } from "../store/userStore";
import { wsToUser } from "../store/session";
import { sendTo } from "../utils/sendTo";
import { RegData } from "../types";

export const handleRegister = ({
  ws,
  payload,
}: {
  ws: WebSocket;
  payload: RegData;
}) => {
  const { success, data } = userStore.dispatch({
    type: CLIENT_MSG.REGISTER,
    payload,
  });

  if (success) {
    wsToUser.set(ws, { index: data.index, name: data.name });
  }

  sendTo(ws, SERVER_MSG.REGISTER, {
    name: data.name,
    index: data.index,
    error: !success,
    errorText: success ? "" : ERROR.WRONG_PASSWORD,
  });
};
