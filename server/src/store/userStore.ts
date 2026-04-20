import { userReducer } from '../reducers/userReducer';
import { User } from '../types';
import { CLIENT_MSG } from '../constants';
import { Store } from './store';

type UserAction = {
  type: CLIENT_MSG.REGISTER;
  payload: { name: string; password: string; index: string };
};

export class UserStore extends Store<Map<string, User>> {
  constructor() {
    super(new Map());
  }

  public dispatch(action: UserAction) {
    const { state, result } = userReducer(this.state, action);
    this.state = state;

    return result;
  }
}

export const userStore = new UserStore();
