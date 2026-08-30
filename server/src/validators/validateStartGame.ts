import { ERROR } from "../constants";
import { Game } from "../types";

export const validateStartGame = ({
  hostId,
  game,
}: {
  hostId: string;
  game: Game;
}) => {
  if (game.hostId !== hostId) {
    return ERROR.NOT_HOST;
  }

  if (game.status !== "waiting") {
    return ERROR.GAME_ALREADY_STARTED;
  }

  if (game.players.length < 1) {
    return ERROR.NO_PLAYERS;
  }

  return null;
};
