/**
 * Project 3: Playful Interaction.
 * Louis Barbier and Jaden ___.
 */

"use strict";

/** Width of the canvas. */
const CANVAS_WIDTH = 1200;

/** Height of the canvas. */
const CANVAS_HEIGHT = 600;

/** MIDI patterns for the players. */
const NOTE_PATTERNS = [
  [60, 64, 67, 69, 62],
  [49, 54, 56],
  [62, 69, 62, 66],
  [76, 83, 76, 80, 83, 76],
  [48, 52, 55, 48, 52],
  [62, 69, 62, 66],
];

/** Color palette for the players. */
const COLORS = [
  "#537C78",
  "#7BA591",
  "#CC222B",
  "#F15B4C",
  "#FAC41B",
  "#FFD45B",
];

let video;
let objDetector;
let detections = [];
let players = [];

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

  // Convert the hex colors to p5 colors.
  for (let i = 0; i < COLORS.length; i++) {
    COLORS[i] = color(COLORS[i]);
  }

  // Hide the video element.
  video.hide();
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

  // Draw each player.
  players.forEach((player) => {
    player.draw();
  });
}

/**
 * Updates the player data.
 */
function updatePlayerData() {
  // Delete the players that are no longer detected.
  while (players.length > detections.length) {
    let player = players.pop();
    player.delete();
  }

  detections.forEach((obj) => {
    let position = calculateObjectCenter(obj);

    // Check if the player already exists and update its position.
    for (let i = 0; i < players.length; i++) {
      if (players[i].id === i) {
        players[i].updatePosition(position);
        break;
      }
    }

    // If the player doesn't exist, create it.
    if (players.length < detections.length) {
      let player = new Player(position.x, position.y);
      player.playSound();
      players.push(player);
    }
  });
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
  static playerId = 0;

  constructor(x, y) {
    // ID of the player.
    this.id = Player.playerId++;

    // Position of the player.
    this.x = x;
    this.y = y;

    // Size of the player.
    this.width = 20;
    this.height = 20;

    // Sound of the player.
    this.synth = new p5.MonoSynth();
    this.sound = new p5.SoundLoop((timeFromNow) => {
      let noteIndex =
        (this.sound.iterations - 1) % NOTE_PATTERNS[this.id].length;
      let note = midiToFreq(NOTE_PATTERNS[this.id][noteIndex]);
      this.synth.play(note, 0.5, timeFromNow);
    }, 0.2);
  }

  /**
   * Draws the player.
   */
  draw() {
    fill(COLORS[this.id]);
    noStroke();
    rect(this.x, this.y, this.width, this.height);
  }

  /**
   * Updates the player's position.
   * @param {Object} newPosition The new position of the player.
   */
  updatePosition(newPosition) {
    this.x = lerp(this.x, newPosition.x, 0.1);
    this.y = lerp(this.y, newPosition.y, 0.1);
  }

  /**
   * Plays the sound.
   */
  playSound() {
    // Start and sync the sound with the one that is already playing.
    if (this.id > 0) {
      this.sound.syncedStart(players[0].sound);
    }
    // Otherwise, just start the sound.
    else {
      this.sound.start();
    }
  }

  /**
   * Stops the sound.
   */
  stopSound() {
    this.sound.stop();
  }

  /**
   * Deletes the player.
   */
  delete() {
    this.stopSound();
    this.synth.dispose();
    Player.playerId--;
  }
}
