// turkey.js — Gus the turkey: running, jumping, ducking and hiding.
// All physics live here; main.js owns the game loop and collisions.

import { GROUND_Y } from './art.js';

export const TURKEY_X = 280;

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = TURKEY_X;
    this.y = GROUND_Y; // ground contact point
    this.vy = 0;
    this.onGround = true;
    this.ducking = false;
    this.hidden = false; // inside a haystack while ducking
    this.runPhase = 0;
    this.invulnerableUntil = 0;
    this.slowUntil = 0;
  }

  /** Body box for collisions (narrower when ducking). */
  box() {
    if (this.ducking) return { x: this.x - 34, y: this.y - 34, w: 72, h: 34 };
    return { x: this.x - 30, y: this.y - 86, w: 66, h: 86 };
  }

  get invulnerable() {
    return performance.now() < this.invulnerableUntil;
  }

  get slowed() {
    return performance.now() < this.slowUntil;
  }

  jump(sounds) {
    if (!this.onGround) return false;
    this.vy = -1020;
    this.onGround = false;
    this.ducking = false;
    if (sounds) sounds.jump();
    return true;
  }

  setDuck(down, sounds) {
    if (!this.onGround) return;
    if (down && !this.ducking) {
      this.ducking = true;
      if (sounds) sounds.hide();
    } else if (!down) {
      this.ducking = false;
    }
  }

  update(dt, speed) {
    this.runPhase += dt * (speed / 320);
    if (!this.onGround) {
      this.vy += 2600 * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.onGround = true;
      }
    }
    // Hidden only while ducking still inside a haystack (world sets this).
    if (!this.ducking) this.hidden = false;
  }
}
