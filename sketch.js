function setup() {
  createCanvas(393,852);
  angleMode(DEGREES);
  ghost = new Ghost(width/2, height - 110);
  frameRate(60);
}

function draw() {
  background(15, 23, 36);

  // subtle back gradient
  for (let i = 0; i < height; i++) {
    let t = map(i, 0, height, 0, 1);
    stroke(8 + 40*t, 12 + 45*t, 24 + 40*t);
    line(0, i, width, i);
  }

  // ground
  noStroke();
  fill(20, 28, 42, 150);
  rect(0, height - 80, width, 80); 

  drawSparkles();

  ghost.update();
  ghost.display();

  fill(255, 255, 255, 120);
  noStroke();
  textAlign(RIGHT, TOP);
  textSize(12);
  text("Jumping Ghost — p5.js", width - 12, 12);
}

/* ---------- Ghost class ---------- */
class Ghost {
  constructor(x, baseY) {
    this.x = x;
    this.baseY = baseY;
    this.y = baseY;
    this.vy = 0;
    this.gravity = 0.9;
    this.jumpImpulse = -15;
    this.onGround = true;

    this.w = 140;
    this.h = 120;

    this.scaleX = 1;
    this.scaleY = 1;

    this.autoJumpInterval = 1500;
    this._lastAutoJump = millis();

    this.hoverOffset = 0;
    this.hoverSpeed = random(0.8, 1.3);

    this.eyeOffsetY = -12;
    this.eyeDistance = 26;
    this.eyeRadius = 12;

    this.tailCount = 6;
  }

  update() {
    if (this.onGround) {
      this.hoverOffset = sin(frameCount * this.hoverSpeed * 0.8) * 2;
      this.y = this.baseY + this.hoverOffset;
      this.vy = 0;
    } else {
      this.vy += this.gravity * 0.98;
      this.y += this.vy;
      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.vy = 0;
        this.onGround = true;
      }
    }

    let speedFactor = constrain(map(abs(this.vy), 0, 25, 0, 1), 0, 1);
    if (!this.onGround) {
      this.scaleY = 1 + 0.35 * speedFactor * (this.vy < 0 ? 1 : 0.6);
      this.scaleX = 1 / this.scaleY;
    } else {
      if (frameCount % 8 === 0) {
        this.scaleY = 1 - 0.08 * sin(frameCount * 10);
        this.scaleX = 1 / this.scaleY;
      } else {
        this.scaleY += (1 - this.scaleY) * 0.12;
        this.scaleX += (1 - this.scaleX) * 0.12;
      }
    }

    if (millis() - this._lastAutoJump > this.autoJumpInterval) {
      this._lastAutoJump = millis();
      if (this.onGround) this.jump();
    }
  }

  jump() {
    if (!this.onGround) {
      if (this.vy > -5) {
        this.vy += this.jumpImpulse * 0.5;
      }
      return;
    }
    this.vy = this.jumpImpulse;
    this.onGround = false;
  }

  display() {
    push();
    translate(this.x, this.y);

    let heightFactor = map(this.baseY - this.y, 0, 200, 0, 1);
    heightFactor = constrain(heightFactor, 0, 1);
    let shadowW = this.w * (1.0 + 0.25 * heightFactor);
    let shadowH = 18 * (1 - 0.8 * heightFactor);
    noStroke();
    fill(0, 0, 0, 90 * (1 - heightFactor) + 40);
    ellipse(0, 72, shadowW, shadowH);

    push();
    translate(0, -this.h * 0.25);
    translate(0, this.h * 0.25);
    scale(this.scaleX, this.scaleY);
    translate(0, -this.h * 0.25);

    noStroke();
    fill(255, 255, 255, 240);
    beginShape();
      for (let a = 180; a <= 360; a += 6) {
        let px = (this.w/2) * cos(a);
        let py = (this.h/2) * sin(a) - 10;
        vertex(px, py);
      }
      let tailTopY = this.h/6;
      for (let i = 0; i <= this.tailCount; i++) {
        let t = i / this.tailCount;
        let px = map(t, 0, 1, this.w/2, -this.w/2);
        let wave = sin(t * PI * this.tailCount) * 10;
        vertex(px, tailTopY + 28 + wave);
      }
    endShape(CLOSE);

    fill(245, 245, 255, 200);
    ellipse(0, -6, this.w * 0.9, this.h * 0.75);

    noStroke();
    fill(230, 230, 240, 100);
    ellipse(0, 10, this.w * 0.65, this.h * 0.18);

    let eyeX = -this.eyeDistance;
    let eyeY = this.eyeOffsetY;
    let worldGhostX = this.x;
    let worldGhostY = this.y - 10;
    let mx = (mouseX - worldGhostX) / this.scaleX;
    let my = (mouseY - worldGhostY) / this.scaleY;

    const drawEye = (cx) => {
      fill(255);
      stroke(220);
      strokeWeight(2);
      ellipse(cx, eyeY, this.eyeRadius*2, this.eyeRadius*2.2);

      let maxPupil = this.eyeRadius * 0.6;
      let dx = mx - cx;
      let dy = my - eyeY;
      let d = sqrt(dx*dx + dy*dy);
      let px = cx + constrain(dx, -maxPupil, maxPupil) * 0.45;
      let py = eyeY + constrain(dy, -maxPupil, maxPupil) * 0.45;

      fill(20);
      noStroke();
      ellipse(px, py, this.eyeRadius * 0.9, this.eyeRadius * 0.9);
      fill(255);
      ellipse(px - this.eyeRadius*0.22, py - this.eyeRadius*0.28, this.eyeRadius*0.28, this.eyeRadius*0.28);
    };

    drawEye(-this.eyeDistance);
    drawEye(this.eyeDistance);

    noStroke();
    fill(40, 60, 70, 180);
    ellipse(0, 6, 22, 10);

    pop();
    pop();
  }
}

/* ---------- Decorative sparkles ---------- */
const sparklePositions = [];
function drawSparkles() {
  if (sparklePositions.length === 0) {
    for (let i = 0; i < 12; i++) {
      sparklePositions.push({
        x: random(40, width - 40),
        y: random(40, height - 140),
        size: random(2, 6),
        phase: random(1000)
      });
    }
  }

  noStroke();
  for (let s of sparklePositions) {
    let t = (millis() * 0.002 + s.phase) % TAU;
    let alpha = map(sin(t), -1, 1, 40, 180);
    push();
    translate(s.x, s.y);
    rotate((sin(t*2) * 8));
    fill(255, 240, 255, alpha);
    beginShape();
      vertex(0, -s.size*1.2);
      vertex(s.size*0.35, -s.size*0.35);
      vertex(s.size*1.2, 0);
      vertex(s.size*0.35, s.size*0.35);
      vertex(0, s.size*1.2);
      vertex(-s.size*0.35, s.size*0.35);
      vertex(-s.size*1.2, 0);
      vertex(-s.size*0.35, -s.size*0.35);
    endShape(CLOSE);
    pop();
  }
  let candyCorn;

function preload() {
  // Load your candy corn image
  candyCorn = loadImage('candy corn.png'); // ensure this image is in the same folder as your sketch
}

function setup() {
  createCanvas(393, 852);
  imageMode(CENTER); // centers the image at mouse position
}

function draw() {
  // When mouse is pressed, draw darker candy corns (optional tint effect)
  if (mouseIsPressed === true) {
    tint(0, 150); // adds a dark overlay
  } else {
    noTint(); // restores normal color
  }

  // Draw the candy corn image at mouse position
  image(candyCorn, mouseX, mouseY, 100, 100); // 100x100 replaces the circle size
}

}
