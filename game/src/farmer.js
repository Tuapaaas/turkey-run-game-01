// farmer.js — Farmer Bram: he chases, searches and corners.
// He gains ground whenever the turkey stumbles and loses it when the
// turkey hides in a haystack; if he reaches the turkey, dinner is served.

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    // The chase is a gap, not a footrace: the turkey stays near x=280
    // on screen while the world scrolls, so the farmer closes the gap
    // only when the turkey stumbles — a clean run slowly pulls away.
    this.gap = 260; // px between the farmer and the turkey
    this.x = 20;
    this.runPhase = 0;
    this.searchTimer = 0; // >0 while he stops to look around
    this.sprintTimer = 0; // >0 while he sprints after being fooled
    this.searchCooldown = 4;
  }

  /** Distance in px between the farmer and the turkey. */
  gapTo() {
    return this.gap;
  }

  get searching() {
    return this.searchTimer > 0;
  }

  /** The turkey hid: the farmer stops, looks around, then sprints. */
  loseTrail() {
    if (this.searchTimer <= 0 && this.sprintTimer <= 0) {
      this.searchTimer = 1.6;
      this.searchCooldown = 5;
    }
  }

  /** The turkey stumbled into something: the farmer lunges closer. */
  stumble() {
    this.gap -= 110;
  }

  update(dt, turkeyX, opts) {
    this.runPhase += dt;
    this.searchCooldown -= dt;
    if (this.searchTimer > 0) {
      // Stopped to search: the turkey pulls away while he looks around.
      this.searchTimer -= dt;
      this.gap = Math.min(400, this.gap + 50 * dt);
      if (this.searchTimer <= 0) this.sprintTimer = 1.2;
    } else {
      if (this.sprintTimer > 0) {
        this.sprintTimer -= dt;
        this.gap -= 70 * dt;
      } else {
        this.gap += 8 * dt; // a clean run slowly pulls away
      }
      if (opts && opts.slowed) this.gap -= 20 * dt;
    }
    this.gap = Math.max(30, Math.min(400, this.gap));
    this.x = turkeyX - this.gap;
  }
}
