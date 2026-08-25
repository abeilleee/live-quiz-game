import { WebSocketServer } from "ws";
import { Logger } from "./utils/logger";
import { CLIENT_MSG, ERROR, SERVER_MSG } from "./constants";
import { handleRegister } from "./handlers/register";
import { handleCreateGame } from "./handlers/createGame";
import { handleJoinGame } from "./handlers/handleJoinGame";
import { wsToUser } from "./store/session";
import { sendTo } from "./utils/sendTo";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });
Logger.success(`🚀 Websocker server started on ${PORT} port`);

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = JSON.parse(message.toString());
    const { type, data: payload } = msg;

    if (type === CLIENT_MSG.REGISTER) {
      handleRegister({ ws, payload });

      return;
    }

    // Session user
    const user = wsToUser.get(ws);

    if (!user) {
      sendTo(ws, SERVER_MSG.ERROR, { message: ERROR.UNREGISTERED });

      return;
    }

    const { index, name } = user;

    switch (type) {
      case CLIENT_MSG.CREATE_GAME:
        handleCreateGame({ ws, payload, hostId: index });
        break;

      case CLIENT_MSG.JOIN_GAME:
        handleJoinGame({ ws, payload, name, index });
        break;

      case CLIENT_MSG.START_GAME:
        Logger.plain("Game started");
        break;

      case CLIENT_MSG.ANSWER:
        Logger.plain("Answer sent");
        break;
    }
  });

  ws.on("close", () => {
    Logger.user("User disconnected");
  });
});
