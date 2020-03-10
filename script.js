let assets = []; // Files
let database = {}; // Database in json format
let db = firebase.database(); // Firebase refrence
let keys = []; // Keycodes pressed
let fonts = []; // Fonts loaded
let signedIn = false; // Is user signed in?
let scale = 0; // Scale for the rooms
let palate = {}; // Color palate for website
let mouse = { // Mouse actions
  "pressed": false,
  "held": false,
  "released": false
};
let rooms = []; // Array of Room objects
let markers = []; // Array of Marker objects
let dataFetched = false; // Is firebase data fetched?

// Loading assets and fonts
function preload() {
  assets[0] = loadImage("assets/Floor Plan.jpg");
  assets[1] = loadImage("assets/Floor Plan Simple.jpg");
  assets[2] = loadImage("assets/background.png");
  fonts[0] = loadFont("assets/fonts/Montserrat-BlackItalic.ttf");
  fonts[1] = loadFont("assets/fonts/Montserrat-Light.ttf");
}

function setup() {
  palate = {
    klsYellow: color(201, 221, 59),
    klsBlue: color(92, 203, 224),
    klsPurple: color(118, 145, 204),
    mainColor: color(40),
    subColor: color(200),
    borderColor: color(80)
  }
  // Create a 16 by 9 canvas that is optimally fit to the screen
  createCanvas(Math.floor(Math.min(windowWidth / 16, windowHeight / 9) * 16), Math.floor(Math.min(windowWidth / 16, windowHeight / 9) * 9));
  
  // Set scale so that the rooms will fit the canvas perfectly.
  scale = Math.min(width / 555, height / 720) * 0.8;
}

// Called when the database loads
function databaseLoaded() {
  // Fetch room data and create all room objects
  for (let i = 0; i < Object.keys(database.rooms).length - 1; i++) {
    let key = Object.keys(database.rooms)[i];
    rooms.push(new Room(database.rooms[key].rects, key));
  }
}

// Room class
class Room {
  constructor(rects, name) {
    this.rects = []; // Rects array containing Rectangle objects
    this.max = createVector(0, 0); // Min x and y
    this.min = createVector(Infinity, Infinity); // Max x and y
    this.name = name; // Name of room
    this.center = createVector(0, 0); // Center point of the room
    this.border = 1;
    // Create all Rectangle objects
    for (let i = 0; i < rects.length; i++) {
      // Scale all room dimentions to fit the screen
      rects[i][0] = (rects[i][0] - this.border) * scale + ((width - 555 * scale) / 2);
      rects[i][1] = (rects[i][1] - this.border) * scale + ((height - 720 * scale) / 2);
      rects[i][2] = (rects[i][2] + (this.border * 2)) * scale;
      rects[i][3] = (rects[i][3] + (this.border * 2)) * scale;
      // Create Rectangle object with scaled dimentions
      this.rects[i] = new Rectangle(...rects[i]);
      // Set min and max vectors
      this.max.x = Math.max(this.max.x, this.rects[i].pos.x + this.rects[i].w);
      this.max.y = Math.max(this.max.y, this.rects[i].pos.y + this.rects[i].h);
      this.min.x = Math.min(this.min.x, this.rects[i].pos.x);
      this.min.y = Math.min(this.min.y, this.rects[i].pos.y);
    }
    // Calculate center point based on the min and max dimentions
    this.center.x = (this.max.x - this.min.x) / 2 + this.min.x;
    this.center.y = (this.max.y - this.min.y) / 2 + this.min.y;
    for (let i = 0; i < rects.length; i++) {
      if (this.rects[i].pointOver(this.center.x, this.center.y)) { // If a rectangle is on the center point
        // Change the center x so that the text will fit properly
        this.center.x = this.rects[i].pos.x + this.rects[i].w / 2;
        this.centerRect = i;
        break;
      }
    }
  }

  display() {
    noStroke();
    fill(palate.borderColor);
    for (let i = 0; i < this.rects.length; i++) {
      rect(
        this.rects[i].pos.x - ((5 - this.border * 2) * scale),
        this.rects[i].pos.y - ((5 - this.border * 2) * scale),
        this.rects[i].w + ((5 - this.border * 2) * 2 * scale),
        this.rects[i].h + ((5 - this.border * 2) * 2 * scale));
    }
    for (let i = 0; i < this.rects.length; i++) {
      this.rects[i].display(true, palate.mainColor, false);
    }
    fill(palate.subColor);
    textFont(fonts[0]);
    textAlign(CENTER, CENTER);
    textSize(1);
    textSize(constrain((this.rects[this.centerRect].w / textWidth(this.name.toUpperCase())) / 1.25, 0, 15));
    text(this.name.toUpperCase(), this.center.x, this.center.y);
  }
}

// Rectangle class for the room class
class Rectangle {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
  }

  display(isFilled, fillColor, hasStroke, strokeWidth, strokeColor) {
    if (!isFilled) {
      noFill();
    } else {
      fill(fillColor);
    }
    if (!hasStroke) {
      noStroke();
    } else {
      strokeWeight(strokeWidth);
      stroke(strokeColor);
    }
    rect(this.pos.x, this.pos.y, this.w, this.h);
  }

  pointOver(x2, y2) {
    return x2 >= this.pos.x && y2 >= this.pos.y && x2 <= this.pos.x + this.w && y2 <= this.pos.y + this.h;
  }
}

class Marker {
  constructor(name, x, y) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.z = 0;
    this.r = 25
    this.xOff = 0;
    this.yOff = 0;
    this.dragged = false;
  }

  display() {
    fill(0, 25);
    ellipse(this.x, this.y, this.r * 2 - this.z / 5);
    fill(palate.klsYellow);
    ellipse(this.x - this.z / 3, this.y - this.z, this.r * 2);
    fill(palate.mainColor);
    text(this.name, this.x - this.z / 3, this.y - this.z);
  }

  update() {
    this.z += 0.75;
    this.z += -this.z / 5;
    if (this.pointOver(mouseX, mouseY) && mouse.pressed) {
      this.xOff = this.x - mouseX;
      this.yOff = this.y - mouseY;
      this.dragged = true;
    }

    if (this.dragged) {
      this.x += (this.xOff + mouseX - this.x) / 3;
      this.y += (this.yOff + mouseY - this.y) / 3;
      this.z += 1;
      let json = database.markers[this.name];
      json.x = this.x;
      json.y = this.y;
      json.z = this.z;
      updateChild("markers/" + this.name, json);
    }

    if (this.dragged && mouse.released) {
      this.dragged = false;
    }
  }

  pointOver(x, y) {
    return dist(this.x, this.y, x, y) < this.r;
  }
}
// Display everything
function draw() {
  $(".g-signin2")[0].style.display = "none";

  fill(palate.mainColor.levels[0], palate.mainColor.levels[1], palate.mainColor.levels[2]);
  rect(0, 0, width, height);

  if (!signedIn) {
    $(".g-signin2")[0].style.display = "";
    let button = $(".abcRioButton")[0];
    button.style.transform = `scale(${width / 500})`;
    buttonWidth = parseInt(button.style.width.substring(0, button.style.width.length - 2));
    buttonHeight = parseInt(button.style.height.substring(0, button.style.height.length - 2));
    $(".g-signin2")[0].style.position = `absolute`;
    $(".g-signin2")[0].style.left = `${width / 2 - buttonWidth / 2}px`;
    $(".g-signin2")[0].style.top = `${height / 2 - buttonHeight / 2}px`;
    //$(".g-signin2")[0].style.zIndex = `1`;
    if (mouseX >= width / 2 - width / 5 / 2 && mouseY >= height / 2 - height / 8 / 2 && mouseX <= width / 2 + width / 5 / 2 && mouseY <= height / 2 + height / 8) {
      fill(palate.klsYellow);
      if (mouseIsPressed) {
      }
    }
    noStroke();
    textAlign(CENTER);
    textSize(width / 50);
    textFont(fonts[0]);
    fill(255);
    text("YOU ARE SIGNED OUT.", width / 2, height / 2 - buttonWidth);
    return;
  }

  image(assets[2], 0, 0, width, height);
  if (Object.keys(database).length == 0) {
    fill(255);
    textSize(100);
    textFont(fonts[0]);
    textAlign(CENTER, CENTER);
    text("FETCHING DATA...", width / 2, height / 2);
    return;
  }
  fill(palate.mainColor);
  rectMode(CENTER);
  rect(width / 2, height / 2, 555 * (scale * 1.125), 720 * (scale * 1.125), width / 75);
  rectMode(CORNER);
  
  (width - 555 * (scale * 1.125)) / 2
  rect((height - 720 * (scale * 1.125)) / 2, (height - 720 * (scale * 1.125)) / 2, (width / 2 - (720 * (scale * 1.125) / 2)), 720 * (scale * 1.125), width / 75);
  rect(width / 2 + ((555 * (scale * 1.125)) / 2) + ((height - 720 * (scale * 1.125)) / 2), (height - 720 * (scale * 1.125)) / 2, (width / 2 - (720 * (scale * 1.125) / 2)), 720 * (scale * 1.125), width / 75);

  if (!dataFetched) {
    databaseLoaded();
  }
  dataFetched = true;
  for (let i = 0; i < rooms.length; i++) {
    rooms[i].display();
  }
  for (let i = 0; i < markers.length; i++) {
    markers[i].update();
    markers[i].display();
  }
  mouse.pressed = false;
  mouse.released = false;
}

function mousePressed() {
  mouse.pressed = true;
  mouse.held = true;
}

function mouseReleased() {
  mouse.released = true;
  mouse.held = false;
}

db.ref().on('child_added', function (snapshot) {
  let json = snapshot.val();
  database[json.key] = json;
  if (json.key == "markers") {
    for (let i = 0; i < Object.keys(json).length - 1; i++) {
      let markerJSON = json[Object.keys(json)[i]];
      markers.push(new Marker(markerJSON.name, markerJSON.x, markerJSON.y));
    }
  }
});

db.ref().on('child_changed', function (snapshot) {
  let json = snapshot.val();
  database[json.key] = json;
  if (json.key == "markers") {
    for (let i = 0; i < markers.length - 1; i++) {
      markers[i].x = json[Object.keys(json)[i]].x;
      markers[i].y = json[Object.keys(json)[i]].y;
      markers[i].z = json[Object.keys(json)[i]].z;
    }
  }
});

db.ref().on('child_removed', function (snapshot) {
  let json = snapshot.val();
  delete database[json.key];
});

// Database edit functions
function updateChild(name, json) {
  db.ref().child(name).update(json);
}
function addChild(name, json) {
  db.ref().child(name).set(json);
}
function removeChild(name) {
  db.ref().child(name).remove();
}

function onSignIn(user) {
  console.log(user);
  if (user) {
    signedIn = true;
  }
}