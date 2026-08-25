import { WebSocket } from "ws";
import { BASE_IDX, SERVER_MSG } from "../constants";

export const sendTo = (ws: WebSocket, type: SERVER_MSG, data: unknown) => {
  if (ws.readyState !== WebSocket.OPEN) {
    return;
  }

  ws.send(JSON.stringify({ type, data, id: BASE_IDX }));
};
