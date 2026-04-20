import { WebSocketServer } from 'ws';
import { Logger } from './utils/Logger';


const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });
Logger.success(`🚀 Websocker server started on ${PORT} port`);