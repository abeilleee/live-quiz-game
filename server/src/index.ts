import { WebSocketServer } from "ws";
import { Logger } from "./utils/logger";
import { CLIENT_MSG } from "./constants";
import { handleRegister } from "./handlers/register";
import { handleCreateGame } from "./handlers/createGame";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });
Logger.success(`🚀 Websocker server started on ${PORT} port`);

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = JSON.parse(message.toString());
    const { type, data: payload } = msg;

    switch (type) {
      case CLIENT_MSG.REGISTER:
        handleRegister({ ws, payload });
        break;

      case CLIENT_MSG.CREATE_GAME:
        handleCreateGame({ ws, payload });
        break;

      case CLIENT_MSG.JOIN_GAME:
        Logger.plain("Game joined");
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
