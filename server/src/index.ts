import { WebSocketServer } from "ws";
import { Logger } from "./utils/logger";
import { CLIENT_MSG } from "./constants";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });
Logger.success(`🚀 Websocker server started on ${PORT} port`);

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = JSON.parse(message.toString());
    const { type } = msg;

    switch (type) {
      case CLIENT_MSG.REGISTER:
        Logger.user("User registered");
      case CLIENT_MSG.CREATE_GAME:
        Logger.plain("Game created");
      case CLIENT_MSG.JOIN_GAME:
        Logger.plain("Game joined");
      case CLIENT_MSG.START_GAME:
        Logger.plain("Game started");
      case CLIENT_MSG.ANSWER:
        Logger.plain("Answer sent");
    }
  });

  ws.on("close", () => {
    Logger.user("User disconnected");
  });
});
