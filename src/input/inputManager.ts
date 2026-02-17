/**
 * Input handling system - manages keyboard, gamepad, and touch input
 */

interface InputState {
  left: boolean;
  right: boolean;
  down: boolean;
  up: boolean;
  rotate: boolean;
  drop: boolean;
  pause: boolean;
}

interface InputManager {
  state: InputState;
  listeners: Map<string, Function[]>;
  update: () => void;
  subscribe: (event: string, callback: Function) => void;
}

/**
 * Create input manager
 */
export function createInputManager(): InputManager {
  const state: InputState = {
    left: false,
    right: false,
    down: false,
    up: false,
    rotate: false,
    drop: false,
    pause: false,
  };

  const listeners = new Map<string, Function[]>();

  /**
   * Handle keyboard events
   */
  const handleKeyDown = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();

    // Player 1 controls (WASD / Arrow keys)
    if (
      key === 'arrowleft' ||
      key === 'a'
    ) {
      state.left = true;
      emit('move-left');
    }
    if (key === 'arrowright' || key === 'd') {
      state.right = true;
      emit('move-right');
    }
    if (key === 'arrowdown' || key === 's') {
      state.down = true;
      emit('soft-drop');
    }
    if (key === 'arrowup' || key === 'w' || key === ' ') {
      state.rotate = true;
      emit('rotate');
    }
    if (key === 'enter') {
      state.drop = true;
      emit('hard-drop');
    }
    if (key === 'escape' || key === 'p') {
      state.pause = true;
      emit('pause');
    }
  };

  const handleKeyUp = (e: KeyboardEvent): void => {
    const key = e.key.toLowerCase();

    if (key === 'arrowleft' || key === 'a') state.left = false;
    if (key === 'arrowright' || key === 'd') state.right = false;
    if (key === 'arrowdown' || key === 's') state.down = false;
    if (key === 'arrowup' || key === 'w' || key === ' ') state.rotate = false;
    if (key === 'enter') state.drop = false;
    if (key === 'escape' || key === 'p') state.pause = false;
  };

  /**
   * Handle gamepad input
   */
  const handleGamepad = (): void => {
    const gamepads = navigator.getGamepads();
    if (!gamepads || gamepads.length === 0) return;

    const gamepad = gamepads[0];
    if (!gamepad) return;

    // D-pad / Analog stick
    if (gamepad.buttons[14]?.pressed || gamepad.axes[0] < -0.5) {
      // Left
      state.left = true;
      emit('move-left');
    }
    if (gamepad.buttons[15]?.pressed || gamepad.axes[0] > 0.5) {
      // Right
      state.right = true;
      emit('move-right');
    }
    if (gamepad.buttons[13]?.pressed || gamepad.axes[1] > 0.5) {
      // Down
      state.down = true;
      emit('soft-drop');
    }

    // Buttons
    if (gamepad.buttons[0]?.pressed || gamepad.buttons[2]?.pressed) {
      // A or X button - rotate
      state.rotate = true;
      emit('rotate');
    }
    if (gamepad.buttons[1]?.pressed || gamepad.buttons[3]?.pressed) {
      // B or Y button - drop
      state.drop = true;
      emit('hard-drop');
    }
    if (gamepad.buttons[9]?.pressed) {
      // Start - pause
      state.pause = true;
      emit('pause');
    }
  };

  /**
   * Emit event to listeners
   */
  const emit = (eventName: string): void => {
    const callbacks = listeners.get(eventName) || [];
    callbacks.forEach((cb) => cb());
  };

  /**
   * Subscribe to input event
   */
  const subscribe = (event: string, callback: Function): (() => void) => {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback as any);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  };

  /**
   * Update input state (call each frame)
   */
  const update = (): void => {
    handleGamepad();
  };

  // Add event listeners
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return {
    state,
    listeners,
    update,
    subscribe,
  };
}

/**
 * Player 1 specific input getter
 */
export function getPlayer1Input(manager: InputManager): {
  moveLeft: boolean;
  moveRight: boolean;
  softDrop: boolean;
  rotate: boolean;
  hardDrop: boolean;
  pause: boolean;
} {
  return {
    moveLeft: manager.state.left,
    moveRight: manager.state.right,
    softDrop: manager.state.down,
    rotate: manager.state.rotate,
    hardDrop: manager.state.drop,
    pause: manager.state.pause,
  };
}
