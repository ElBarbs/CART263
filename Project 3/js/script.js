/**
 * Project 3: Playful Interaction.
 * Louis Barbier and Jaden Thompson.
 */

"use strict";

/** The width of the canvas. */
const CANVAS_WIDTH = 1200;

/** The height of the canvas. */
const CANVAS_HEIGHT = 600;

/** The configuration for each object. */
const OBJECTS = {
  backpack: {
    color: "#537C78",
    notePattern: [60, 64],
  },
  book: {
    color: "#7BA591",
    notePattern: [80, 83, 76],
  },
  vase: {
    color: "#CC222B",
    notePattern: [67, 69, 62],
  },
  bottle: {
    color: "#F15B4C",
    notePattern: [62, 64],
  },
  "cell phone": {
    color: "#FAC41B",
    notePattern: [76, 83, 76],
  },
};

/** The webcam feed. */
let video;

/** The object detection model. */
let objDetector;

/** The detected objects. */
let detections = [];

/** The players. */
let players = [];

/** The volume history. */
let freqHistory = [];

function preload() {
  // Initialize ObjectDetector using the COCO-SSD model.
  objDetector = ml5.objectDetector("cocossd");
}

function setup() {
  // Create the canvas.
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  // Initialize the video.
  video = createCapture(VIDEO, () => {
    // Start detecting objects when the video is ready.
    objDetector.detect(video, objectDetected);
  });

  // Create the players.
  for (let [key, value] of Object.entries(OBJECTS)) {
    let player = new Player(key, value.color, value.notePattern);
    players.push(player);
  }

  // Hide the video element.
  video.hide();

  // Set the stroke weight.
  strokeWeight(0.1);
}

function objectDetected(err, results) {
  // If there is an error, log it.
  if (err) {
    console.error(err);
  }

  // Store the detections.
  detections = results;

  // Detect again.
  objDetector.detect(video, objectDetected);
}

function draw() {
  // Reset the volume.
  let freq = 0;

  // Reset the background.
  background(20, 20, 20);

  // Update the player data.
  updatePlayerData();

  // For each player...
  players.forEach((player) => {
    // Draw the player.
    player.draw();

    // Calculate the volume of the sound of active players.
    if (player.isActive) {
      freq += player.synth.oscillator.freqNode.value;
    }
  });

  // Add the calculated frequency to the frequency history.
  freqHistory.push(freq);

  // Draw the visual.
  drawVisual();
}

function getActivePlayers() {
  return players.filter((p) => p.isActive);
}
function drawVisual() {
  stroke(255);
  noFill();

  translate(width / 2, height / 2);
  beginShape();
  for (var i = 0; i < 90; i++) {
    freqHistory[i] = abs(1 - freqHistory[i]);
    var r = map(
      freqHistory[i],
      -1000,
      1000,
      1,
      100 + random(0, getActivePlayers().length * 50)
    );
    var x = r * cos(i);
    var y = r * sin(i);
    vertex(x, y);
  }
  endShape();

  if (freqHistory.length > 90) {
    freqHistory.shift();
  }
}

/**
 * Updates the player data.
 */
function updatePlayerData() {
  for (let i = 0; i < players.length; i++) {
    // Check if the object is detected.
    let detectionIndex = detections.findIndex((d) => d.label === players[i].id);
    if (detectionIndex > -1) {
      players[i].increaseLifespan();
      let position = calculateObjectCenter(detections[detectionIndex]);
      players[i].updatePosition(position);
    }
  }
}

/**
 * Calculates the center of an object.
 * @param {Object} obj The object.
 */
function calculateObjectCenter(obj) {
  return remap({
    x: obj.x + obj.width / 2,
    y: obj.y + obj.height / 2,
  });
}

/**
 * Maps a value from one range to another.
 * @param {Object} posObj An object with x and y properties.
 */
function remap(posObj) {
  return {
    x: abs(CANVAS_WIDTH - map(posObj.x, 0, video.width, 0, CANVAS_WIDTH)),
    y: map(posObj.y, 0, video.height, 0, CANVAS_HEIGHT),
  };
}

/**
 * A class that represents a player.
 */
class Player {
  static size = 2;
  static lifespanIncrement = 15;

  constructor(id, hexColor, notePattern) {
    // ID of the player.
    this.id = id;

    // Color of the player.
    this.color = color(hexColor);

    // Note pattern of the player.
    this.notePattern = notePattern;

    // Position of the player.
    this.x = 0;
    this.y = 0;

    // Whether the player is active or not.
    this.isActive = false;

    this.lifespan = 0;

    // Sound of the player.
    this.synth = new p5.MonoSynth();

    this.sound = new p5.SoundLoop((timeFromNow) => {
      let noteIndex = (this.sound.iterations - 1) % this.notePattern.length;
      let note = midiToFreq(this.notePattern[noteIndex]);
      this.synth.play(note, 0.5, timeFromNow);
    }, 0.75);
  }

  /**
   * Draws the player.
   */
  draw() {
    this.lifespan--;

    if (this.lifespan <= 0) {
      this.stopSound();
      this.isActive = false;
    } else {
      // Draw the player.
      fill(this.color);
      noStroke();
      circle(this.x, this.y, Player.size);

      // Set the player active if it is not already.
      if (!this.isActive) {
        this.playSound();
        this.isActive = true;
      }
    }
  }

  /**
   * Increases the lifespan of the player.
   */
  increaseLifespan() {
    this.lifespan += Player.lifespanIncrement;
    this.lifespan = constrain(this.lifespan, 0, 60);
  }

  /**
   * Updates the player's position.
   * @param {Object} newPosition The new position of the player.
   */
  updatePosition(newPosition) {
    // Update the position.
    this.x = lerp(this.x, newPosition.x, 0.1);
    this.y = lerp(this.y, newPosition.y, 0.1);

    // Calculate the difference between the old and new position.
    let diffX = map(abs(this.x - newPosition.x), 0, 10, 0, 1);
    let diffY = map(abs(this.y - newPosition.y), 0, 10, 0, 1);

    // Change the range based on the difference.
    this.synth.amp(random(0 + diffX, 1 - diffY));
  }

  /**
   * Plays the sound.
   */
  playSound() {
    let activePlayers = getActivePlayers();
    if (activePlayers.length > 1) {
      this.sound.syncedStart(activePlayers[0].sound);
      return;
    }

    // Otherwise, start the sound like usual.
    this.sound.start();
  }

  /**
   * Stops the sound.
   */
  stopSound() {
    this.sound.stop();
  }
}
