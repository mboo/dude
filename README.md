# dude

A JavaScript 3D third-person prototype centered on a single original western drifter character.

## Features

- Third-person mouse orbit camera
- Smooth `WASD` movement
- `Shift` to sprint
- `Space` to jump
- `C` to crouch
- `E` to interact
- Left and right mouse input hooks for future actions
- Character states: `idle`, `walk`, `run`, `jump`, `crouch`
- Minimal HUD with controls legend and current state
- Simple test level with placeholder interaction props

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the local dev server:

```bash
npm run dev
```

3. Open the local URL printed by Vite in your browser.
4. Click inside the game view to lock the mouse and control the camera.
5. Press `Esc` to release the mouse cursor.

## Project Structure

- `src/main.js`: app entry point
- `src/game/Game.js`: main game loop and system orchestration
- `src/game/core/`: reusable engine-style helpers
- `src/game/entities/`: player and interactable world actors
- `src/game/systems/`: input, camera, state, and interaction systems
- `src/styles.css`: HUD and presentation styles

## Notes

- The drifter is an original procedural character built from simple meshes, designed to capture a rugged frontier tone without copying any existing copyrighted character.
- The code is structured for expansion into NPCs, combat, horse riding, inventory, and mission scripting.
