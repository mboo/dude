export class PlayerStateMachine {
  constructor() {
    this.currentState = 'idle';
  }

  set(nextState) {
    if (this.currentState !== nextState) {
      this.currentState = nextState;
    }
  }
}
