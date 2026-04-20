export class Store<T> {
  protected state: T;

  constructor(state: T) {
    this.state = state;
  }

  public getState() {
    return this.state;
  }
}
