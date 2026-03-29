export class Hud {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'hud';
    this.element.innerHTML = `
      <div class="hud-card hud-state">
        <div class="hud-label">Player State</div>
        <div class="hud-value" data-role="state">idle</div>
      </div>
      <div class="hud-card hud-controls">
        <div class="hud-label">Controls</div>
        <ul class="hud-list">
          <li><strong>WASD</strong> move</li>
          <li><strong>Mouse</strong> orbit camera</li>
          <li><strong>Shift</strong> sprint</li>
          <li><strong>Space</strong> jump</li>
          <li><strong>C</strong> crouch</li>
          <li><strong>E</strong> interact</li>
          <li><strong>RMB</strong> aim revolver</li>
          <li><strong>LMB</strong> fire while moving</li>
        </ul>
      </div>
      <div class="hud-card hud-prompt">
        <div class="hud-value" data-role="prompt">Click to lock mouse</div>
      </div>
      <div class="hud-crosshair" data-role="crosshair" aria-hidden="true">
        <span class="hud-crosshair-line hud-crosshair-line-x"></span>
        <span class="hud-crosshair-line hud-crosshair-line-y"></span>
      </div>
    `;

    this.stateNode = this.element.querySelector('[data-role="state"]');
    this.promptNode = this.element.querySelector('[data-role="prompt"]');
    this.crosshairNode = this.element.querySelector('[data-role="crosshair"]');
  }

  update({ state, interactionText, pointerLocked, aiming }) {
    this.stateNode.textContent = aiming ? `${state} / aim` : state;
    this.promptNode.textContent = interactionText || (pointerLocked ? '' : 'Click to lock mouse');
    this.promptNode.parentElement.style.display = this.promptNode.textContent ? 'block' : 'none';
    this.crosshairNode.style.display = aiming && pointerLocked ? 'block' : 'none';
  }
}
