import { gameReducer } from "../reducers/gameReducer";
import { Game, GameAction } from "../types";
import { Store } from "./store";

class GameStore extends Store<Map<string, Game>> {
  constructor() {
    super(new Map());
  }

  public dispatch(action: GameAction) {
    const { state, result } = gameReducer(this.state, action);
    this.state = state;

    return result;
  }
}

export const gameStore = new GameStore();
