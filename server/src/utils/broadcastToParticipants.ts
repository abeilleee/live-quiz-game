import { wsToUser } from "../store/session";
import { gameStore } from "../store/gameStore";
import { sendTo } from "./sendTo";
import { SERVER_MSG } from "../constants";

export const broadcastToParticipants = ({
  room,
  payload,
}: {
  room: string;
  payload: { type: SERVER_MSG; data: unknown };
}) => {
  const game = gameStore.getState().get(room);

  if (!game) {
    return;
  }

  const { type, data } = payload;

  const gameParticipantsIds = new Set([
    game.hostId,
    ...game.players.map((player) => player.index),
  ]);

  for (const [ws, sessionUser] of wsToUser) {
    if (sessionUser.index && gameParticipantsIds.has(sessionUser.index)) {
      sendTo(ws, type, data);
    }
  }
};
