export class InputManager {
  constructor(domElement) {
    this.domElement = domElement;
    this.keys = new Map();
    this.mouse = {
      deltaX: 0,
      deltaY: 0,
      leftDown: false,
      rightDown: false,
      leftPressed: false,
      rightPressed: false
    };

    this.isPointerLocked = false;
    this.moveVector = { x: 0, y: 0 };

    this.onKeyDown = (event) => this.handleKey(event.code, true);
    this.onKeyUp = (event) => this.handleKey(event.code, false);
    this.onMouseMove = (event) => this.handleMouseMove(event);
    this.onMouseDown = (event) => this.handleMouseDown(event);
    this.onMouseUp = (event) => this.handleMouseUp(event);
    this.onPointerLockChange = () => this.handlePointerLockChange();

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);

    this.domElement.addEventListener('click', () => {
      if (!this.isPointerLocked) {
        this.domElement.requestPointerLock();
      }
    });

    this.domElement.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  handleKey(code, isDown) {
    this.keys.set(code, isDown);
  }

  handleMouseMove(event) {
    if (!this.isPointerLocked) {
      return;
    }

    this.mouse.deltaX += event.movementX;
    this.mouse.deltaY += event.movementY;
  }

  handleMouseDown(event) {
    if (event.button === 0) {
      this.mouse.leftDown = true;
      this.mouse.leftPressed = true;
    }

    if (event.button === 2) {
      this.mouse.rightDown = true;
      this.mouse.rightPressed = true;
    }
  }

  handleMouseUp(event) {
    if (event.button === 0) {
      this.mouse.leftDown = false;
    }

    if (event.button === 2) {
      this.mouse.rightDown = false;
    }
  }

  handlePointerLockChange() {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
    this.domElement.classList.toggle('locked', this.isPointerLocked);
  }

  isDown(code) {
    return this.keys.get(code) === true;
  }

  wasPressed(code) {
    return this.isDown(code);
  }

  getActionSnapshot() {
    const x = Number(this.isDown('KeyD')) - Number(this.isDown('KeyA'));
    const y = Number(this.isDown('KeyS')) - Number(this.isDown('KeyW'));

    this.moveVector.x = x;
    this.moveVector.y = y;

    return {
      moveX: x,
      moveY: y,
      cameraX: Number(this.isDown('ArrowRight')) - Number(this.isDown('ArrowLeft')),
      cameraY: Number(this.isDown('ArrowDown')) - Number(this.isDown('ArrowUp')),
      sprint: this.isDown('ShiftLeft') || this.isDown('ShiftRight'),
      jump: this.isDown('Space'),
      crouch: this.isDown('KeyC'),
      interact: this.isDown('KeyE'),
      leftDown: this.mouse.leftDown,
      rightDown: this.mouse.rightDown,
      leftClick: this.mouse.leftPressed,
      rightClick: this.mouse.rightPressed,
      lookX: this.mouse.deltaX,
      lookY: this.mouse.deltaY
    };
  }

  endFrame() {
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
    this.mouse.leftPressed = false;
    this.mouse.rightPressed = false;
  }
}
