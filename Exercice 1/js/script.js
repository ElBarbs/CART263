/**
Exercice 1: Getting Back into Code.
Louis Barbier.

A re-creation of the game Pong, where 2 players bounce a ball back and forth horizontally to score points.
*/

/** The width of the canvas. */
const CANVAS_WIDTH = 750;

/** The height of the canvas. */
const CANVAS_HEIGHT = 500;

/** The amount of points needed to win. */
const MAX_SCORE = 10;

/** An array containing the players. */
let players = [];

/** An object representing the ball. */
let ball = null;

("use strict");

class Ball {
  constructor() {
    /** The X position of the ball. */
    this.x = CANVAS_WIDTH / 2;

    /** The Y position of the ball. */
    this.y = CANVAS_HEIGHT / 2;

    /** The speed of the ball on the X axis. */
    this.speedX = 3;

    /** The speed of the ball on the Y axis. */
    this.speedY = 3;
  }

  /** The size of the ball. */
  static size = 10;

  /** Draws the ball. */
  draw() {
    drawingContext.setLineDash([]);
    noStroke();
    fill("white");
    ellipse(this.x, this.y, Ball.size);
  }

  /** Moves the ball. */
  move() {
    this.x += this.speedX;
    this.y += this.speedY;

    this.checkCollision();
  }

  /**
   * Checks if the ball is colliding with the canvas or the players.
   *
   * If the X coordinate of the ball is out of bounds, the ball is reset and the score is updated.
   *
   * If the Y coordinate of the ball is out of bounds, the Y speed is inverted.
   *
   * If the ball is colliding with a player, the X speed is inverted.
   */
  checkCollision() {
    // Check if the ball is out of bounds.
    if (this.x > CANVAS_WIDTH || this.x < 0) {
      // Determine which player scored.
      var playerWhoScored = this.x > CANVAS_WIDTH ? players[0] : players[1];

      // Update the score.
      playerWhoScored.increaseScore();

      // Reset the ball.
      this.reset();
    }

    // Check if the ball is colliding with the top or bottom of the canvas.
    if (this.y > CANVAS_HEIGHT || this.y < 0) {
      this.speedY *= -1;
    }

    // Check if the ball is colliding with the players.
    for (let player of players) {
      if (
        this.x - Ball.size / 2 < player.x + Player.width &&
        this.x + Ball.size / 2 > player.x &&
        this.y - Ball.size / 2 < player.y + Player.height &&
        this.y + Ball.size / 2 > player.y
      ) {
        this.speedX *= -1;
      }
    }
  }

  /** Resets the ball to the center of the canvas. */
  reset() {
    this.x = CANVAS_WIDTH / 2;
    this.y = CANVAS_HEIGHT / 2;
    this.speedX *= -1;
  }
}

class Player {
  constructor(x, y, upKey, downKey) {
    /** The X position of the player. */
    this.x = x;

    /** The Y position of the player. */
    this.y = y;

    /** The key used to move the player up. */
    this.upKey = upKey;

    /** The key used to move the player down. */
    this.downKey = downKey;

    /** The score of the player. */
    this.score = 0;
  }

  /** The width of a player. */
  static width = 5;

  /** The height of a player. */
  static height = 50;

  /** The speed of a player. */
  static speed = 5;

  /** Draws the player. */
  draw() {
    drawingContext.setLineDash([]);
    noStroke();
    fill("white");
    rect(this.x, this.y, Player.width, Player.height);
  }

  /** Moves the player. */
  move() {
    if (keyIsDown(this.upKey)) {
      this.y -= Player.speed;
    } else if (keyIsDown(this.downKey)) {
      this.y += Player.speed;
    }

    this.checkCollision();
  }

  /** Checks if the player is out of bounds. */
  checkCollision() {
    if (this.y < 0) {
      this.y = 0;
    } else if (this.y + Player.height > CANVAS_HEIGHT) {
      this.y = CANVAS_HEIGHT - Player.height;
    }
  }

  /** Increases the score of the player by 1. */
  increaseScore() {
    this.score++;
  }
}

function setup() {
  // Create the canvas.
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  // Set the colors.
  background("black");

  // Set the text properties.
  textSize(20);
  textAlign(CENTER);

  // Create the players.
  players.push(
    new Player(
      CANVAS_WIDTH * 0.1 - Player.width / 2,
      CANVAS_HEIGHT / 2 - Player.height / 2,
      87,
      83
    )
  );
  players.push(
    new Player(
      CANVAS_WIDTH * 0.9 - Player.width / 2,
      CANVAS_HEIGHT / 2 - Player.height / 2,
      UP_ARROW,
      DOWN_ARROW
    )
  );

  // Create the ball.
  ball = new Ball();
}

function draw() {
  // Reset the background.
  background("black");

  // Draw the center line.
  drawingContext.setLineDash([10, 10]);
  noFill();
  stroke("white");
  line(CANVAS_WIDTH / 2, 5, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 5);

  // Move the players.
  for (let player of players) {
    player.move();
  }

  // Move the ball.
  ball.move();

  // Draw the players and their scores.
  for (let player of players) {
    player.draw();

    // Draw the score.
    text(
      player.score,
      player.x < CANVAS_WIDTH / 2 ? 20 : CANVAS_WIDTH - 20,
      30
    );
  }

  // Draw the ball.
  ball.draw();

  // Check if a player has won.
  for (let player of players) {
    if (player.score >= MAX_SCORE) {
      // Stop the loop.
      noLoop();

      // Reset the background.
      clear();
      background("black");

      // Draw the winner text.
      text(
        player.x < CANVAS_WIDTH / 2 ? "Player 1 wins!" : "Player 2 wins!",
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2 - 20
      );

      // Draw the restart text.
      text("Press R to restart.", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
    }
  }
}

function keyPressed() {
  // If the R key is pressed, restart the game.
  if (keyCode === 82) {
    // Reset the scores.
    for (let player of players) {
      player.score = 0;
    }

    // Reset the ball.
    ball.reset();

    // Restart the loop.
    loop();
  }
}
