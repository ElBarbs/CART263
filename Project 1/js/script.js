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
const INTIAL_FLASH_CHANCE = 5e-7;

/**
 * The initial chance of a rain drop being added.
 * This is multiplied by the number of milliseconds that have passed.
 */
const INITIAL_PARTICLE_CHANCE = 5e-5;

/**
 * Defines the speed at which the background gets darker.
 */
const BKG_COLOR_CHANGE_SPEED = 0.01;

/** The cloud that will produce the rain. */
let cloud;

/**
 * The background p5 Color object.
 * This is used so that a new p5 Color object is not created every frame.
 */
let bkgColorObject;

/** The background sound. */
let backgroundSound;

/**
 * Setup the canvas.
 */
function setup() {
  // Create the canvas.
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  // Initialize the rain drop system.
  cloud = new Cloud();

  // Initialize the background color object.
  bkgColorObject = color(BKG_COLOR);

  // Load the background music.
  soundFormats("wav");
  backgroundSound = loadSound("assets/sounds/thunderstorm.wav");

  // Set the frame rate.
  frameRate(120);
}

/**
 * Draw the canvas.
 */
function draw() {
  // Play the background sound if it is loaded and not already playing.
  if (backgroundSound.isLoaded() && !backgroundSound.isPlaying()) {
    backgroundSound.loop();
  }

  // Darken the background.
  darkenBackground();

  // Reset the background.
  background(bkgColorObject);

  // Get the number of milliseconds that have passed.
  // Make sure that the number of milliseconds is not greater than 20000.
  // This is so that the flash chance and particle chance do not get too high.
  let timePassed = millis() > 30000 ? 30000 : millis();

  // Flash the screen white.
  if (random() < INTIAL_FLASH_CHANCE * timePassed) {
    flashScreen();
  }

  // Add a rain drop.
  if (random() < INITIAL_PARTICLE_CHANCE * timePassed) {
    cloud.addRainDrop();
  }

  // Animate the rain drops.
  cloud.rain();
}

/**
 * Starts the background sound when the mouse is pressed.
 * This is necessary because the browser will not play audio unless it is
 * triggered by a user action.
 */
function mousePressed() {
  // Ensure audio is enabled.
  userStartAudio();

  // Loop the background sound.
  if (backgroundSound.isLoaded() && !backgroundSound.isPlaying()) {
    backgroundSound.loop();
  }
}

/**
 * Darken the background.
 */
function darkenBackground() {
  // Darken the background if it is not already black.
  if (bkgColorObject.toString() != "rgba(0,0,0,1)") {
    // Calculate the new value of the red, green, and blue components.
    let newRed = BKG_COLOR[0] - BKG_COLOR_CHANGE_SPEED * millis();
    let newGreen = BKG_COLOR[1] - BKG_COLOR_CHANGE_SPEED * millis();
    let newBlue = BKG_COLOR[2] - BKG_COLOR_CHANGE_SPEED * millis();

    // Set the new values of the red, green, and blue components.
    // Make sure that the values are not negative.
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
 * This class represents a rain drop.
 */
class RainDrop {
  constructor() {
    // The position of the rain drop.
    this.position = createVector(random(0, width), -20);

    // The velocity and acceleration of the rain drop.
    this.velocity = createVector(0, random(-2, 2));
    this.acceleration = createVector(0, 0.05);

    // The lifespan of the rain drop.
    this.lifespan = 475;

    // The length of the rain drop.
    this.length = random(5, 15);

    // The thickness of the rain drop.
    this.strokeWeight = random(1, 2);

    this.droplets = [];
  }

  /**
   * Move the rain drop.
   */
  move() {
    this.update();
    this.display();
  }

  /**
   * Update position and velocity.
   * Decrease the lifespan.
   * Split the rain drop into rain droplets if necessary.
   */
  update() {
    if (this.droplets.length > 0) {
      for (let i = 0; i < this.droplets.length; i++) {
        this.droplets[i].move();
        if (this.droplets[i].lifespan <= 0) {
          this.droplets.splice(i, 1);
        }
      }
    } else {
      // If the rain drop hits the ground, bounce it.
      // Give it a random x velocity.
      if (this.position.y >= CANVAS_HEIGHT) {
        this.lifespan = 0;
        this.split(createVector(random(-0.1, 0.1), this.velocity.y * -0.225));
      }

      // If the rain drop hits the mouse, bounce it.
      // Change its x velocity based on the mouse's x velocity.
      if (
        this.position.y + this.length >= mouseY &&
        this.position.x >= mouseX &&
        this.position.x <= mouseX + 12
      ) {
        this.lifespan = 0;
        this.split(createVector(map(mouseX - pmouseX, -10, 10, 0, 1), -0.225));
      }

      // Update position and velocity.
      this.position.add(this.velocity);
      this.velocity.add(this.acceleration);

      // Decrease the lifespan.
      this.lifespan -= 2;
    }
  }

  /**
   * Display the rain drop.
   */
  display() {
    noFill();
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
   * Split the rain drop into rain droplets.
   * @param {p5.Vector} velocity The velocity of the rain droplets.
   */
  split(velocity) {
    for (let i = 0; i < random(1, 3); i++) {
      let rainDropletPosition = this.position.copy();
      rainDropletPosition.add(
        createVector(random(-1, 1), random(-1, 1) * this.length)
      );
      this.droplets.push(
        new RainDroplet(rainDropletPosition, velocity, this.acceleration)
      );
    }
  }

  /**
   * Is the rain drop dead?
   */
  isDead() {
    return this.lifespan <= 0 && this.droplets.length <= 0;
  }
}

/**
 * This class represents a rain droplet.
 * A rain droplet is created when a rain drop hits the ground or the cursor.
 */
class RainDroplet {
  constructor(position, velocity, acceleration) {
    // The position of the rain droplet.
    this.position = position;

    // The velocity and acceleration of the rain droplet.
    this.velocity = velocity;
    this.acceleration = acceleration;

    // The lifespan of the rain droplet.
    this.lifespan = 100;

    // The size of the rain droplet.
    this.diameter = random(2, 3);
  }

  /**
   * Move the rain droplet.
   */
  move() {
    this.update();
    this.display();
  }

  /**
   * Update position and velocity.
   * Decrease the lifespan.
   */
  update() {
    // Update position and velocity.
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);

    // Decrease the lifespan.
    this.lifespan -= 2;
  }

  /**
   * Display the rain droplet.
   */
  display() {
    noStroke();
    fill(30, this.lifespan);
    ellipse(this.position.x, this.position.y, this.diameter);
  }

  /**
   * Is the rain droplet dead?
   */
  isDead() {
    return this.lifespan <= 0;
  }
}

/**
 * This class represents a cloud that produces rain.
 * It contains all of the rain drops.
 */
class Cloud {
  constructor() {
    this.raindrops = [];
  }

  /**
   * Add a rain drop to the cloud.
   */
  addRainDrop() {
    this.raindrops.push(new RainDrop());
  }

  /**
   * Animate the rain drops.
   */
  rain() {
    for (let i = 0; i < this.raindrops.length; i++) {
      // Get a reference to the current rain drop.
      let currentRaindrop = this.raindrops[i];

      // Move the rain drop.
      currentRaindrop.move();

      // Remove the rain drop if it is dead.
      if (currentRaindrop.isDead()) {
        this.raindrops.splice(i, 1);
      }
    }
  }
}
