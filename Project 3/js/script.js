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
let poseNet;
let poses = [];
let players = [];

function setup() {
  // Create the canvas.
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  // Initialize the video.
  video = createCapture(VIDEO);
  video.size(width, height);

  // Convert the hex colors to p5 colors.
  for (let i = 0; i < COLORS.length; i++) {
    COLORS[i] = color(COLORS[i]);
  }

  // Initialize PoseNet.
  poseNet = ml5.poseNet(
    video,
    {
      architecture: "MobileNetV1",
      detectionType: "multiple",
      flipHorizontal: true,
      inputResolution: 321,
      scoreThreshold: 0.8,
    },
    modelReady
  );

  // Put the results from PoseNet into the poses array.
  poseNet.on("pose", function (results) {
    poses = results;
  });

  // Hide the video element.
  video.hide();
}

function modelReady() {}

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
  // Loop through all the poses detected.
  for (let i = 0; i < poses.length; i++) {
    // Get the pose data for one person.
    let pose = poses[i].pose;

    // Get the left and right shoulder positions.
    let leftShoulder = pose.leftShoulder;
    let rightShoulder = pose.rightShoulder;

    // Calculate the average position between the two shoulders.
    let position = average(leftShoulder, rightShoulder);

    if (players.length < poses.length) {
      let player = new Player(position.x, position.y);
      player.playSound();
      players.push(player);
    } else if (
      players.length > poses.length ||
      players.length > COLORS.length
    ) {
      let player = players.pop();
      player.delete();
    }

    if (leftShoulder.confidence > 0.2 && rightShoulder.confidence > 0.2) {
      for (let i = 0; i < players.length; i++) {
        if (players[i].id === i) {
          players[i].updatePosition(position);
          break;
        }
      }
    }
  }
}

/**
 * Calculates the average position between two points.
 * @param {Object} p1 The first point.
 * @param {Object} p2 The second point.
 * @returns {Object} The average position.
 */
function average(p1, p2) {
  let averageX = (p1.x + p2.x) / 2;
  let averageY = (p1.y + p2.y) / 2;

  return { x: averageX, y: averageY };
}

/**
 * A class that represents a player.
 */
class Player {
  static playerId = 0;

  constructor(x, y) {
    this.id = Player.playerId++;

    this.x = x;
    this.y = y;

    this.width = 20;
    this.height = 20;

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
    if (this.id > 0) {
      this.sound.syncedStart(players[0].sound);
    } else {
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
    Player.playerId--;
  }
}
