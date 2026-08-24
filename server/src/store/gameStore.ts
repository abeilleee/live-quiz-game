import { Game } from "../types";
import { Store } from "./store";

class GameStore extends Store<Map<string, Game>> {
  constructor() {
    super(new Map());
  }
}

export const gameStore = new GameStore();
