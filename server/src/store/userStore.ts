import { Store } from "./store";
import { User, UserAction } from "../types";
import { userReducer, Result } from "../reducers/userReducer";

class UserStore extends Store<Map<string, User>> {
  constructor() {
    super(new Map());
  }

  public dispatch(action: UserAction): Result {
    const { state, result } = userReducer(this.state, action);
    this.state = state;

    return result;
  }
}

export const userStore = new UserStore();
