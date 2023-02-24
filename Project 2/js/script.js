/**
 * Project 2: Data Visualization.
 * Using the Canadian Housing Survey 2021.
 * Louis Barbier.
 */

"use strict";

/** The width of the canvas. */
const CANVAS_WIDTH = 1200;

/** The height of the canvas. */
const CANVAS_HEIGHT = 600;

/**
 * The names of the columns in the table.
 * PSTIR_GR: Shelter-cost-to-income ratio, groups.
 * PPROV: Province of residence.
 * PLIS_05: Life satisfaction - current subjective well-being.
 * PHHTTINC: Total income of household.
 * GH_05: General health - self-assessed health.
 * GH_10: General health - self-assessed mental health.
 * LIS_10: Life satisfaction - subjective well-being - last 5 years.
 * PDCT_05: Tenure - owned by a household member.
 * */
const COLUMN_NAMES = [
  "PSTIR_GR",
  "PPROV",
  "PLIS_05",
  "PHHTTINC",
  "GH_05",
  "GH_10",
  "LIS_10",
  "PDCT_05",
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

/** The table containing the raw data. */
let table;

/** The array containing the formatted data. */
let data = [];

function preload() {
  // Load the table.
  table = loadTable("assets/data/CHS2021ECL_PUMF.csv", "csv", "header");
}

/**
 * Setup the canvas.
 */
function setup() {
  // Create the canvas and set the background color.
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  background(20);

  // Set the text properties.
  textSize(15);
  textAlign(CENTER, CENTER);
  textFont("Trebuchet MS");

  // Set the ellipse mode to center to make it easier to position the provinces.
  ellipseMode(CENTER);

  // Remove the stroke for a cleaner look.
  noStroke();

  // Calculate the size of each province.
  let provinceSize = {};
  for (let i = 0; i < table.getRowCount(); i++) {
    let province = table.getString(i, "PPROV");

    if (province in provinceSize) {
      provinceSize[province]++;
    } else {
      provinceSize[province] = 1;
    }
  }

  // Create the provinces.
  for (let [province, size] of Object.entries(provinceSize)) {
    data.push(new Province(province, size));
  }

  // Sort the provinces by size and update their position.
  data.sort((a, b) => a.size - b.size);
  updateProvincesPosition();
}

/**
 * Draw the canvas.
 */
function draw() {
  background(20);
  // Draw the data.
  for (let i = 0; i < data.length; i++) {
    data[i].draw();
  }
}

class Province {
  constructor(provinceCode, size) {
    this.name = PROV_CODES[provinceCode].name;
    this.color = color(PROV_CODES[provinceCode].color);

    // Set the size of the province.
    this.size = int(map(size, 0, 10000, 0, 200));

    // Set the position of the province.
    this.x = 0;
    this.y = height / 2;
  }

  draw() {
    // Write the province name.
    fill(255);
    text(this.name, this.x, this.y - this.size / 2 - 10);

    // Draw a circle based on the province size and color.
    fill(this.color);
    circle(this.x, this.y, this.size);
  }

  toString() {
    return `${this.name} - ${this.size}`;
  }
}

function updateProvincesPosition() {
  // Calculate the space between the provinces.
  let totalSize = data.reduce((acc, cur) => acc + cur.size, 0);
  let spaceBetween = (CANVAS_WIDTH - totalSize) / (data.length + 1);

  // Update the provinces position.
  let x = spaceBetween;
  for (let i = 0; i < data.length; i++) {
    data[i].x = x + data[i].size / 2;
    x += data[i].size + spaceBetween;
  }
}
