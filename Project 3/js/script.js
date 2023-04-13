/**
 * Project 3: Playful Interaction.
 * Louis Barbier and Jaden Thompson.
 */

"use strict";

/** Width of the canvas. */
const CANVAS_WIDTH = 1200;

/** Height of the canvas. */
const CANVAS_HEIGHT = 600;

const OBJECTS = {
  "wine glass": {
    color: "#537C78",
    notePattern: [60, 64, 67, 69, 62],
  },
  book: {
    color: "#7BA591",
    notePattern: [76, 83, 76, 80, 83, 76],
  },
  vase: {
    color: "#CC222B",
    notePattern: [62, 69, 62, 66],
  },
  bottle: {
    color: "#F15B4C",
    notePattern: [66, 62, 69],
  },
  scissors: {
    color: "#FAC41B",
    notePattern: [62, 64],
  },
};

/** The webcam feed. */
let video;

let objDetector;
let detections = [];

let players = [];

let volhistory = [];

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
  // Reset the background.
  background(20, 20, 20);

  // Update the player data.
  updatePlayerData();

  let vol = 0;

  // Draw each player.
  players.forEach((player) => {
    player.draw();

    if (player.isActive) {
      vol += player.synth.amp();
    }
  });

  volhistory.push(vol);
  stroke(255);
  noFill();

  translate(width / 2, height / 2);
  beginShape();
  for (var i = 0; i < 360; i++) {
    volhistory[i] = abs(1 - volhistory[i]);
    var r = map(volhistory[i], 0, 1, 1, 100);
    var x = r * cos(i);
    var y = r * sin(i);
    vertex(x, y);
  }
  endShape();

  if (volhistory.length > 360) {
    volhistory.shift();
  }
}

/**
 * Updates the player data.
 */
function updatePlayerData() {
  for (let i = 0; i < players.length; i++) {
    let detectionIndex = detections.findIndex((d) => d.label === players[i].id);
    if (detectionIndex > -1) {
      players[i].increaseLifespan();
      let position = calculateObjectCenter(detections[detectionIndex]);
      players[i].updatePosition(position);
    }
  }
}

function calculateObjectCenter(obj) {
  return remap({
    x: obj.x + obj.width / 2,
    y: obj.y + obj.height / 2,
  });
}

function remap(obj) {
  return {
    x: abs(CANVAS_WIDTH - map(obj.x, 0, video.width, 0, CANVAS_WIDTH)),
    y: map(obj.y, 0, video.height, 0, CANVAS_HEIGHT),
  };
}

/**
 * A class that represents a player.
 */
class Player {
  static size = 10;

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
    }, 0.2);
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
      fill(this.color);
      noStroke();
      circle(this.x, this.y, Player.size);

      if (!this.isActive) {
        this.playSound();
        this.isActive = true;
      }
    }
  }

  increaseLifespan() {
    this.lifespan += 15;
    this.lifespan = constrain(this.lifespan, 0, 60);
  }

  /**
   * Updates the player's position.
   * @param {Object} newPosition The new position of the player.
   */
  updatePosition(newPosition) {
    this.x = lerp(this.x, newPosition.x, 0.1);
    this.y = lerp(this.y, newPosition.y, 0.1);

    let diffX = map(abs(this.x - newPosition.x), 0, 10, 0, 1);
    let diffY = map(abs(this.y - newPosition.y), 0, 10, 0, 1);

    this.synth.amp(random(0 + diffX, 1 - diffY));
  }

  /**
   * Plays the sound.
   */
  playSound() {
    // Check if there is a sound already playing.
    // If so, sync the player's sound to it.
    for (let i = 0; i < players.length; i++) {
      if (players[i].isActive === true) {
        this.sound.syncedStart(players[i].sound);
        return;
      }
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
