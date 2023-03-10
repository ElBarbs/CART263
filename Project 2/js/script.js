/**
 * Project 2: Data Visualization.
 * Sad-tistics Canada.
 * Using data from Canadian Housing Survey of 2021.
 * Louis Barbier.
 */

"use strict";

/** The width of the canvas. */
const CANVAS_WIDTH = 1200;

/** The height of the canvas. */
const CANVAS_HEIGHT = 600;

/**
 * The names of the columns in the table.
 * PPROV: Province of residence.
 * PRSPGNDR: Demographic information - gender of reference person.
 * PLIS_05: Life satisfaction - current subjective well-being.
 * GH_10: General health - self-assessed mental health.
 * PNSC_15: Feeling of safety - walking alone in neighbourhood.
 * PEHA_05B: Economic hardship - took on debts or sold assets.
 */
const COLUMN_NAMES = [
  "PPROV",
  "PRSPGNDR",
  "PLIS_05",
  "GH_10",
  "PNSC_15",
  "PEHA_05B",
];

/** The province codes. */
const PROV_CODES = {
  10: { name: "NL", color: ["78", "121", "167"] },
  11: { name: "PE", color: ["242", "142", "43"] },
  12: { name: "NS", color: ["225", "87", "89"] },
  13: { name: "NB", color: ["118", "183", "178"] },
  24: { name: "QC", color: ["89", "161", "78"] },
  35: { name: "ON", color: ["237", "201", "73"] },
  46: { name: "MB", color: ["175", "122", "161"] },
  47: { name: "SK", color: ["255", "157", "167"] },
  48: { name: "AB", color: ["156", "117", "95"] },
  59: { name: "BC", color: ["186", "176", "172"] },
  95: { name: "NT", color: ["235", "235", "235"] },
};

const DEFAULT_BACKGROUND_COLOR = 20;

const SHAPE_TYPES = ["triangle", "square"];

const SHAPE_SIZE = 10;

const SPACE_BETWEEN_SHAPES = 10;

const PROPERTIES = {
  lifeDiscontent: "feel very dissatisfied with their life as a whole right now",
  notWalkingAlone: "do not walk alone in their area after dark",
  poorMentalHealth: "have poor self-assessed mental health",
  tookOnDebtsOrSoldAssets:
    "have took on debt or sold an asset to pay for day-to-day expenses",
};

/** The table containing the raw data. */
let table;

/** The array containing the data for each province. */
let provinces = [];

/** The selected province. */
let selectedProvince;

/** The selected property. */
let selectedProperty;

/** The array containing the shapes to display. */
let displayedShapes = [];

/** The background color. */
let backgroundColor;

/** The left and right chevron logos. */
let logoLeftChevron, logoRightChevron;

function preload() {
  // Load the table.
  table = loadTable("assets/data/CHS2021ECL_PUMF.csv", "csv", "header");

  // Initialize the background color.
  backgroundColor = color(DEFAULT_BACKGROUND_COLOR);

  // Initialize the selected property.
  selectedProperty = "notWalkingAlone";

  // Load the logos.
  logoLeftChevron = loadImage("assets/images/chevron-left.svg");
  logoRightChevron = loadImage("assets/images/chevron-right.svg");
}

/**
 * Setup the canvas.
 */
function setup() {
  // Create the canvas and set the background color.
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(backgroundColor);

  // Set the text properties.
  textAlign(CENTER, CENTER);
  textFont("Trebuchet MS");

  // Set the ellipse mode to center to make it easier to position the provinces.
  ellipseMode(CENTER);
  rectMode(CENTER);
  imageMode(CENTER);

  // Create the provinces.
  createProvinces();

  // Sort the provinces by size and update their position.
  provinces.sort((a, b) => a.size - b.size);
  updateProvincesPosition();
}

/**
 * Draw the canvas.
 */
function draw() {
  // Set the cursor to the default.
  let over = false;

  // Clear the canvas.
  background(backgroundColor);

  if (selectedProvince == undefined) {
    // Write title.
    fill(235);
    noStroke();
    textSize(25);
    text("Sad-tistics Canada", CANVAS_WIDTH * 0.5, CANVAS_HEIGHT * 0.25);
    textSize(20);
    text(
      "Using data from the Canadian Housing Survey of 2021",
      CANVAS_WIDTH * 0.5,
      CANVAS_HEIGHT * 0.75
    );

    // Draw borders.
    noFill();
    stroke(235);
    strokeWeight(1);
    rect(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH - 25,
      CANVAS_HEIGHT - 25
    );

    // Draw the data.
    for (let i = 0; i < provinces.length; i++) {
      provinces[i].draw();

      if (isCursorOverProvince(provinces[i])) {
        // Set the cursor to the hand.
        over = true;
      }
    }

    // Update the cursor.
    if (over) {
      cursor(HAND);
    } else {
      cursor(ARROW);
    }
  } else {
    // Set the cursor to the hand.
    cursor(ARROW);

    // Write "Press SPACE to reset".
    fill(20);
    noStroke();
    textSize(15);
    text("Press SPACE to go back", CANVAS_WIDTH / 2, 50);
    text("Press LEFT or RIGHT to change sad-tistic", CANVAS_WIDTH / 2, 75);

    // Draw the shapes.
    for (let i = 0; i < displayedShapes.length; i++) {
      displayedShapes[i].draw();
    }

    // Draw left chevron.
    image(logoLeftChevron, 300, CANVAS_HEIGHT - 70, 50, 50);

    // Get the property value.
    let propertyValue = provinces[selectedProvince].selectedPropertyValue;

    // Write the property value.
    fill(20);
    noStroke();
    textSize(30);
    text(`${propertyValue}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 75);
    textSize(15);
    text(
      `${PROPERTIES[selectedProperty]}`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 50
    );

    // Draw right chevron.
    image(logoRightChevron, CANVAS_WIDTH - 300, CANVAS_HEIGHT - 70, 50, 50);
  }
}

function mousePressed() {
  if (selectedProvince == undefined) {
    for (let i = 0; i < provinces.length; i++) {
      // Get the current province.
      let currentProvince = provinces[i];

      // If the cursor is over the province, select it.
      if (isCursorOverProvince(currentProvince)) {
        backgroundColor = color(currentProvince.color);
        selectedProvince = i;

        createShapes();
        break;
      }
    }
  }
}

function keyPressed() {
  // If the SPACE key is pressed, reset the canvas.
  if (keyCode === 32) {
    reset();
  }
  // If the LEFT or RIGHT arrow keys are pressed, change the selected property.
  else if (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW) {
    let index = Object.keys(PROPERTIES).indexOf(selectedProperty);
    if (keyCode == LEFT_ARROW) {
      if (index == 0) {
        index = Object.keys(PROPERTIES).length - 1;
      } else {
        index--;
      }
    } else {
      if (index == Object.keys(PROPERTIES).length - 1) {
        index = 0;
      } else {
        index++;
      }
    }
    selectedProperty = Object.keys(PROPERTIES)[index];

    // Update the shapes.
    createShapes();
  }
}

function createShapes() {
  // Get the current province.
  let currentProvince = provinces[selectedProvince];

  // Check if the number of shapes to display is different from the number of shapes currently displayed.
  displayedShapes.length = 0;

  // Set the position of the first shape.
  let position = {
    x: SPACE_BETWEEN_SHAPES + SHAPE_SIZE,
    y: SPACE_BETWEEN_SHAPES + SHAPE_SIZE + 100,
  };

  // Set the last value to 0.
  let lastValue = 0;

  for (let j = 0; j < currentProvince.selectedPropertyValue; j++) {
    if (displayedShapes.length > 0) {
      let lastShape = displayedShapes[displayedShapes.length - 1];

      // Update the position of the shape.
      position = {
        x: lastShape.x + SPACE_BETWEEN_SHAPES + SHAPE_SIZE,
        y: lastShape.y,
      };

      // Check if the shape is out of bounds so that it can be moved to the next line.
      // Check if the value of the current shape is different from the last one so that it can be moved to the next line.
      if (
        position.x + SHAPE_SIZE > CANVAS_WIDTH - SPACE_BETWEEN_SHAPES ||
        lastValue != currentProvince[selectedProperty][j]
      ) {
        // Skip 2 lines if the shape changes.
        let multiplier =
          lastValue != currentProvince[selectedProperty][j] ? 2 : 1;

        // Update the position of the shape.
        position.x = SPACE_BETWEEN_SHAPES + SHAPE_SIZE;
        position.y += (SPACE_BETWEEN_SHAPES + SHAPE_SIZE) * multiplier;
      }
    }

    // Create the shape and add it to the array.
    displayedShapes.push(
      new Shape(
        SHAPE_TYPES[currentProvince[selectedProperty][j]],
        position.x,
        position.y
      )
    );

    // Set the last value to the current value.
    lastValue = currentProvince[selectedProperty][j];
  }
}

function reset() {
  backgroundColor = color(DEFAULT_BACKGROUND_COLOR);
  selectedProvince = undefined;
}

/**
 * Check if the cursor is over a province.
 * @param {Province} province The province to check.
 * @returns {boolean} True if the cursor is over the province, false otherwise.
 */
function isCursorOverProvince(province) {
  return (
    dist(mouseX, mouseY, province.x, province.y) < Province.CIRCLE_SIZE / 2
  );
}

function createProvinces() {
  // Calculate the size of each province.
  let provinceSize = {};
  for (let i = 0; i < table.getRowCount(); i++) {
    // Get data from the selected columns.
    let province = table.getString(i, "PPROV");
    let gender = table.getString(i, "PRSPGNDR") == "1" ? 0 : 1;
    let lifeDiscontent = table.getString(i, "PLIS_05") == "1" ? 1 : 0;
    let notWalkingAlone = table.getString(i, "PNSC_15") == "4" ? 1 : 0;
    let poorMentalHealth = table.getString(i, "GH_10") == "5" ? 1 : 0;
    let tookOnDebtsOrSoldAssets = int(table.getString(i, "PEHA_05B"));

    // Set the properties of the province.
    // If the province is not in the provinceSize object, add it.
    // If the province is in the provinceSize object, update its properties.
    if (province in provinceSize) {
      provinceSize[province]["size"]++;
      if (notWalkingAlone == 1) {
        if (gender == 0) {
          provinceSize[province]["notWalkingAlone"].unshift(gender);
        } else {
          provinceSize[province]["notWalkingAlone"].push(gender);
        }
      }

      if (lifeDiscontent == 1) {
        if (gender == 0) {
          provinceSize[province]["lifeDiscontent"].unshift(gender);
        } else {
          provinceSize[province]["lifeDiscontent"].push(gender);
        }
      }

      if (poorMentalHealth == 1) {
        if (gender == 0) {
          provinceSize[province]["poorMentalHealth"].unshift(gender);
        } else {
          provinceSize[province]["poorMentalHealth"].push(gender);
        }
      }

      if (tookOnDebtsOrSoldAssets == 1) {
        if (gender == 0) {
          provinceSize[province]["tookOnDebtsOrSoldAssets"].unshift(gender);
        } else {
          provinceSize[province]["tookOnDebtsOrSoldAssets"].push(gender);
        }
      }
    } else {
      provinceSize[province] = {
        size: 1,
        lifeDiscontent: [gender],
        notWalkingAlone: [gender],
        poorMentalHealth: [gender],
        tookOnDebtsOrSoldAssets: [gender],
      };
    }
  }

  // Create the provinces.
  for (let [province, properties] of Object.entries(provinceSize)) {
    provinces.push(new Province(province, properties));
  }
}

/**
 * Represents a province.
 */
class Province {
  static CIRCLE_SIZE = 75;

  /**
   * Create a new province.
   * @param {string} provinceCode The province code.
   * @param {Object} properties The properties of the province.
   */
  constructor(provinceCode, properties) {
    this.name = PROV_CODES[provinceCode].name;
    this.color = color(PROV_CODES[provinceCode].color);

    // Set the properties of the province.
    this.size = int(properties["size"]);
    this.lifeDiscontent = properties["lifeDiscontent"];
    this.notWalkingAlone = properties["notWalkingAlone"];
    this.poorMentalHealth = properties["poorMentalHealth"];
    this.tookOnDebtsOrSoldAssets = properties["tookOnDebtsOrSoldAssets"];

    // Set the position of the province.
    this.x = 0;
    this.y = height / 2;
  }

  draw() {
    // Draw a circle based on the province size and color.
    if (isCursorOverProvince(this)) {
      // Write the province name and size.
      fill(255);
      noStroke();
      textSize(15);
      text(this.name, this.x, this.y - Province.CIRCLE_SIZE / 2 - 20);
      text(this.size, this.x, this.y + Province.CIRCLE_SIZE / 2 + 20);
      textSize(12);
      text("answers", this.x, this.y + Province.CIRCLE_SIZE / 2 + 35);

      // Draw a stroke around the province.
      fill(this.color);
      strokeWeight(2);
      stroke(255);
    } else {
      fill(this.color);
      noStroke();
    }

    circle(this.x, this.y, Province.CIRCLE_SIZE);
  }

  get selectedPropertyValue() {
    return this[selectedProperty].length || this[selectedProperty];
  }

  toString() {
    return `${this.name} - ${this.size}`;
  }
}

function updateProvincesPosition() {
  // Calculate the space between the provinces.
  let totalSize = provinces.reduce((acc, cur) => acc + Province.CIRCLE_SIZE, 0);
  let spaceBetween = (CANVAS_WIDTH - totalSize) / (provinces.length + 1);

  // Update the provinces position.
  let x = spaceBetween;
  for (let i = 0; i < provinces.length; i++) {
    provinces[i].x = x + Province.CIRCLE_SIZE / 2;
    x += Province.CIRCLE_SIZE + spaceBetween;
  }
}

/**
 * Represents a data point.
 */
class Shape {
  /**
   * Create a new shape.
   * @param {string} type The type of the shape.
   * @param {number} x The x position of the shape.
   * @param {number} y The y position of the shape.
   */
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;

    this.size = SHAPE_SIZE;
  }

  /**
   * Draw the shape.
   */
  draw() {
    // Set visual properties.
    fill(20);
    noStroke();

    // Draw the shape based on its type.
    switch (this.type) {
      case "square":
        square(this.x, this.y, this.size);
        break;
      case "triangle":
        let adaptedSize = this.size / 2;
        triangle(
          this.x,
          this.y - adaptedSize,
          this.x - adaptedSize,
          this.y + adaptedSize,
          this.x + adaptedSize,
          this.y + adaptedSize
        );
        break;
    }
  }
}
