import { WebSocket } from "ws";

export type SessionUser = { index: string; name: string };

export const wsToUser = new Map<WebSocket, SessionUser>();
