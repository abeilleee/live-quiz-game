import { userReducer } from '../reducers/userReducer';
import { User } from '../types';
import { CLIENT_MSG } from '../constants';

type UserAction = {
  type: CLIENT_MSG.REGISTER;
  payload: { name: string; password: string; index: string };
};

export class UserStore {
  private state: Map<string, User> = new Map();

  getState() {
    return this.state;
  }

  public dispatch(action: UserAction) {
    const { state, result } = userReducer(this.state, action);
    this.state = state;

    return result;
  }
}

export const userStore = new UserStore();
