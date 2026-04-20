import { randomUUID } from 'node:crypto';
import { Game, GameAction, Question } from '../types';
import { Store } from './store';
import { gameReducer } from '../reducers/gameReducer';

export class GameStore extends Store<Map<string, Game>> {
  constructor() {
    super(new Map());
  }

  public getGame(id: string) {
    return this.state.get(id);
  }

  public dispatch(action: GameAction) {
    const { state, result } = gameReducer(this.state, action);
    this.state = state;

    return result;
  }
}

export const gameStore = new GameStore();
