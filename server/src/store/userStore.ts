import { Store } from "./store";
import { User } from "../types";

class UserStore extends Store<Map<string, User>> {
  constructor() {
    super(new Map());
  }
}

export const userStore = new UserStore();
