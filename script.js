// Core Variables
let assets = [];
let database = {};
let firebase = new Firebase('https://roomonitor-4e09e.firebaseio.com');
let keys = [];

// Other Variables
let rooms = {
  "Chat": {
    "Rects": [
      [255, 0, 190, 95]
    ]
  },
  "Ideate": {
    "Rects": [
      [450, 0, 190, 95]
    ]
  },
  "Make": {
    "Rects": [
      [646, 0, 106, 93],
      [657, 93, 95, 120]
    ]
  },
  "Library": {
    "Rects": [
      [657, 219, 95, 173]
    ]
  },
  "Cafe Corner": {
    "Rects": [
      [660, 402, 91, 105]
    ]
  },
  "Independence": {
    "Rects": [
      [655, 520, 96, 199],
      [649, 576, 6, 143]
    ]
  },
  "Develop": {
    "Rects": [
      [325, 146, 104, 125],
      [276, 271, 153, 50]
    ]
  },
  "Discover": {
    "Rects": [
      [203, 328, 202, 118]
    ]
  },
  "Head Office": {
    "Rects": [
      [203, 452, 82, 67]
    ]
  },
  "Connect": {
    "Rects": [
      [292, 453, 37, 29]
    ]
  },
  "Curate": {
    "Rects": [
      [202, 526, 82, 67]
    ]
  },
  "Communication": {
    "Rects": [
      [327, 588, 34, 47]
    ]
  },
  "Coach": {
    "Rects": [
      [368, 586, 62, 80]
    ]
  },
  "Mentor": {
    "Rects": [
      [437, 586, 61, 80]
    ]
  },
  "Create": {
    "Rects": [
      [505, 586, 73, 61]
    ]
  },
  "Explore": {
    "Rects": [
      [505, 653, 74, 66]
    ]
  },
  "Commons": {
    "Rects": [
      [0, 0, 0, 0]
    ]
  },
};

function preload() {
  assets[0] = loadImage("assets/Floor Plan.jpg");
  assets[1] = loadImage("assets/Floor Plan Simple.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  cursor("crosshair");
  background(255);
  image(assets[1], 0, 0);
  noFill();
  stroke(255, 0, 0);
  strokeWeight(1);
  for (let i = 0; i < Object.keys(rooms).length; i++) {
    let key = Object.keys(rooms)[i];
    for (let j = 0; j < rooms[key].rects.length; j++) {
      let roomRect = rooms[key].rects[j]
      rect(...roomRect);
      text(keys, roomRect[0] + roomRect[2] / 2, roomRect[1] + roomRect[3] / 2);
    }
  }
}

// Realtime database updates
firebase.on('child_added', function (snapshot) {
  database[snapshot.val().id] = json;
});
firebase.on('child_changed', function (snapshot) {
  database[snapshot.val().id] = json;
});
firebase.on('child_removed', function (snapshot) {
  delete data[snapshot.val().id];
});

// Database edit functions
function updateChild(name, json) {
  firebase.ref().child(name).update(json);
}
function addChild(name, json) {
  firebase.ref().child(name).set(json);
}
function removeChild(name) {
  firebase.ref().child(name).remove();
}