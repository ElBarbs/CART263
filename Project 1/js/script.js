/**
 * Project 1: Particles with Personalities.
 * Getting Caught in a Thunderstorm.
 * Louis Barbier.
 */

"use strict";

/** The width of the canvas. */
const CANVAS_WIDTH = 750;

/** The height of the canvas. */
const CANVAS_HEIGHT = 500;

/**
 * The initial background color.
 */
const BKG_COLOR = [135, 206, 235];

/**
 * The initial chance of the screen flashing white.
 * This is multiplied by the number of milliseconds that have passed.
 */
const INTIAL_FLASH_CHANCE = 0.0000005;

/**
 * The initial chance of a particle being added.
 * This is multiplied by the number of milliseconds that have passed.
 */
const INITIAL_PARTICLE_CHANCE = 0.00005;

/**
 * Defines the speed at which the background gets darker.
 */
const BKG_COLOR_CHANGE_SPEED = 0.01;

/** The particle system. */
let particleSystem;

/**
 * The background p5 Color object.
 * This is used so that a new p5 Color object is not created every frame.
 */
let bkgColorObject;

/**
 * Setup the canvas.
 */
function setup() {
  // Create the canvas.
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  // Initialize the particle system.
  particleSystem = new ParticleSystem();

  // Initialize the background color object.
  bkgColorObject = color(BKG_COLOR);
}

/**
 * Draw the canvas.
 */
function draw() {
  // Darken the background.
  darkenBackground();

  // Reset the background.
  background(bkgColorObject);

  // Flash the screen white.
  if (random() < INTIAL_FLASH_CHANCE * millis()) {
    flashScreen();
  }

  // Add a particle.
  if (random() < INITIAL_PARTICLE_CHANCE * millis()) {
    particleSystem.addParticle();
  }

  // Run the particle system.
  particleSystem.run();
}

function darkenBackground() {
  // Darken the background if it is not already black.
  if (bkgColorObject.toString() != "rgba(0,0,0,1)") {
    // Calculate the new color.
    let newRed = BKG_COLOR[0] - BKG_COLOR_CHANGE_SPEED * millis();
    let newGreen = BKG_COLOR[1] - BKG_COLOR_CHANGE_SPEED * millis();
    let newBlue = BKG_COLOR[2] - BKG_COLOR_CHANGE_SPEED * millis();

    // Make sure the color is not negative and set the color.
    bkgColorObject.setRed(newRed < 0 ? 0 : newRed);
    bkgColorObject.setGreen(newGreen < 0 ? 0 : newGreen);
    bkgColorObject.setBlue(newBlue < 0 ? 0 : newBlue);
  }
}

/**
 * Flash the screen white.
 * This is used to simulate lightning.
 */
function flashScreen() {
  // Create a white screen the size of the canvas.
  let flash = createGraphics(width, height);
  flash.background("white");

  // Draw the white screen.
  image(flash, 0, 0);

  // Remove the white screen.
  flash.remove();
}

/**
 * Particle class.
 */
class Particle {
  constructor() {
    // The position of the particle.
    this.position = createVector(random(0, width), -20);

    // The velocity and acceleration of the particle.
    this.velocity = createVector(0, random(-1, 0));
    this.acceleration = createVector(0, 0.05);

    // The lifespan of the particle.
    this.lifespan = 475;

    // The length of the particle.
    this.length = random(5, 15);

    // The stroke weight of the particle.
    this.strokeWeight = random(1, 2);
  }

  /**
   * Run the particle.
   */
  run() {
    this.update();
    this.display();
  }

  /**
   * Update position and velocity.
   */
  update() {
    // If the particle hits the ground, bounce it.
    if (this.position.y >= CANVAS_HEIGHT) {
      this.velocity.y *= -0.225;
      this.length *= 0.25;
    }

    // Update position and velocity.
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);

    // Decrease the lifespan.
    this.lifespan -= 2;
  }

  /**
   * Display the particle.
   */
  display() {
    strokeWeight(this.strokeWeight);
    stroke(30, this.lifespan);
    line(
      this.position.x,
      this.position.y,
      this.position.x,
      this.position.y + this.length
    );
  }

  /**
   * Is the particle still alive?
   */
  isDead() {
    return this.lifespan < 0;
  }
}

/**
 * Particle system class.
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * Add a particle to the system.
   */
  addParticle() {
    this.particles.push(new Particle());
  }

  /**
   * Move and display all particles.
   */
  run() {
    for (let i = 0; i < this.particles.length; i++) {
      // Get the particle.
      let currentParticle = this.particles[i];

      // Run the particle.
      currentParticle.run();

      // Remove the particle if it is dead.
      if (currentParticle.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }
}
