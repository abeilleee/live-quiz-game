import { Game } from "../types";

export const findGameById = (state: Map<string, Game>, gameId: string) => {
  return [...state.values()].find((g) => g.id === gameId);
};
