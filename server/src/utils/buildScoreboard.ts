import { Game, ScoreboardEntry } from "../types";

export const buildScoreboard = (game: Game): ScoreboardEntry[] =>
  [...game.players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      name: player.name,
      score: player.score,
      rank: index + 1,
    }));
