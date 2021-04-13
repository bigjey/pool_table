import { Vector2 } from "./Vector2";

import ball_8 from "url:./assets/ball_8.png";
import ball_16 from "url:./assets/ball_16.png";
import table from "url:./assets/table.png";
import { circleRect, lineCircle, pointOfLinesIntersection } from "./collisions";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

const W = 1030;
const H = 590;

const BUMPER_SIZE = 75;

const BALL_RADIUS = 14;

const PHYSICS_PRECISION = 10;

const FRICTION = 0.001;

canvas.width = W;
canvas.height = H;

document.body.appendChild(canvas);

canvas.style.width = `515px`;
canvas.style.height = `295px`;

if (!ctx) {
  throw new Error("can't init 2d renderer");
}

const sprites = {
  ball_8: {
    src: ball_8,
    sprite: null,
  },
  ball_16: {
    src: ball_16,
    sprite: null,
  },
  table: {
    src: table,
    sprite: null,
  },
};

const balls: Ball[] = [];
const pockets = [
  { x: 59, y: 59, r: 32 },
  { x: 59, y: H - 59, r: 32 },
  { x: W - 59, y: 59, r: 32 },
  { x: W - 59, y: H - 59, r: 32 },
  { x: W / 2, y: 50, r: 25 },
  { x: W / 2, y: H - 50, r: 25 },
];
const bumpers = [
  [82, 50, 106, 74],
  [106, 74, 475, 74],
  [475, 74, 489, 50],

  [540, 50, 554, 74],
  [554, 74, 922, 74],
  [922, 74, 946, 50],

  [979, 83, 955, 107],
  [955, 107, 955, 482],
  [955, 482, 979, 506],

  [946, 539, 922, 515],
  [922, 515, 554, 515],
  [554, 515, 540, 539],

  [489, 539, 475, 515],
  [475, 515, 106, 515],
  [106, 515, 84, 539],

  [50, 506, 74, 482],
  [74, 482, 74, 108],
  [74, 108, 50, 84],
];

let collision = null;
const update = (deltaTime: number): void => {
  physics: for (let i = 1; i <= PHYSICS_PRECISION; i++) {
    eachball: for (const ball of balls) {
      const delta = ((deltaTime / PHYSICS_PRECISION) * i) / 1000;

      const prevPos = new Vector2(ball.position.x, ball.position.y);

      ball.position.add(Vector2.scale(ball.velocity, delta));

      for (const { x, y, r } of pockets) {
        if (Vector2.distance(ball.position, new Vector2(x, y)) <= r - 8) {
          ball.destroy = true;
          break physics;
        }
      }

      const f = new Vector2();
      const b = [];

      for (const [x1, y1, x2, y2] of bumpers) {
        if (
          lineCircle(
            x1,
            y1,
            x2,
            y2,
            ball.position.x,
            ball.position.y,
            BALL_RADIUS
          )
        ) {
          b.push([x1, y1, x2, y2]);
          // console.log(
          //   "colision!",
          //   lineCircle(x1, y1, x2, y2, prevPos.x, prevPos.y, BALL_RADIUS)
          // );
          // const dx = Math.sign(ball.velocity.x);
          // const dy = Math.sign(ball.velocity.y);

          // const forward = Vector2.add(
          //   ball.position,
          //   Vector2.scale(ball.velocity, 10)
          // );

          // // fix collision error;
          // const p = pointOfLinesIntersection(
          //   x1,
          //   y1,
          //   x2,
          //   y2,
          //   prevPos.x,
          //   prevPos.y,
          //   ball.position.x,
          //   ball.position.y
          // );

          // console.log(p);

          // calculate reflected velocity
          const normal = new Vector2(y2 - y1, -(x2 - x1)).normalize();

          f.add(normal);

          // break;
        }
      }

      if (f.x || f.y) {
        f.normalize();
        const dn = 2 * Vector2.dot(ball.velocity, f);
        const r = Vector2.subtract(ball.velocity, Vector2.scale(f, dn));
        ball.velocity = r;

        while (
          b.some(([x1, y1, x2, y2]) =>
            lineCircle(
              x1,
              y1,
              x2,
              y2,
              ball.position.x,
              ball.position.y,
              BALL_RADIUS
            )
          )
        ) {
          ball.position.add(Vector2.scale(ball.velocity, 0.01));
        }
      }

      for (const otherBall of balls) {
        if (ball === otherBall) continue;

        if (ball.collisionProcessed || otherBall.collisionProcessed) continue;

        if (
          Vector2.distance(ball.position, otherBall.position) <
          BALL_RADIUS * 2
        ) {
          const [x1, y1, x2, y2] = ellasticCollision2(
            ball.position.x,
            ball.position.y,
            ball.velocity.x,
            ball.velocity.y,
            otherBall.position.x,
            otherBall.position.y,
            otherBall.velocity.x,
            otherBall.velocity.y
          );

          ball.velocity = new Vector2(x1, y1);
          otherBall.velocity = new Vector2(x2, y2);

          while (
            Vector2.distance(ball.position, otherBall.position) <
            BALL_RADIUS * 2
          ) {
            ball.position.add(Vector2.scale(ball.velocity, 0.01));
            otherBall.position.add(Vector2.scale(otherBall.velocity, 0.01));
          }

          ball.collisionProcessed = true;
          otherBall.collisionProcessed = true;
        }
      }

      ball.velocity.add(ball.acceleration);

      if (ball.velocity.magnitude() < 0.001) {
        ball.velocity.x = 0;
        ball.velocity.y = 0;
      }
      ball.acceleration = new Vector2();
      ball.acceleration.add(Vector2.scale(ball.velocity, -1 * FRICTION));
    }
  }

  for (const ball of balls) {
    ball.collisionProcessed = false;
    if (ball.destroy) {
      balls.splice(balls.indexOf(ball), 1);
      // if (ball === whiteBall) {
      // } else {
      //   balls.splice(balls.indexOf(ball), 1);
      //   balls.push(
      //     new Ball(
      //       Math.random() * (W - 200) + 100,
      //       Math.random() * (H - 200) + 100,
      //       Math.random() < 0.5 ? "ball_8" : "ball_16"
      //     )
      //   );
      // }
    }
  }

  // console.log(balls[0].velocity);
};

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(sprites.table.sprite, 0, 0, W, H);

  // ctx.fillStyle = "#f00f";
  // for (const [x1, y1, x2, y2] of bumpers) {
  //   ctx.beginPath();
  //   ctx.moveTo(x1, y1);
  //   ctx.lineTo(x2, y2);
  //   ctx.closePath();
  //   ctx.stroke();
  // }

  ctx.strokeStyle = "#fff";
  for (const ball of balls) {
    ctx.drawImage(
      sprites[ball.spriteName].sprite,
      ball.l,
      ball.t,
      BALL_RADIUS * 2,
      BALL_RADIUS * 2
    );
    // ctx.beginPath();
    // ctx.moveTo(ball.position.x, ball.position.y);
    // const forward = Vector2.add(
    //   ball.position,
    //   Vector2.scale(ball.velocity, 50)
    // );
    // ctx.lineTo(forward.x, forward.y);
    // ctx.closePath();
    // ctx.stroke();
  }

  // scope
  if (mouse.pressed) {
    const direction = new Vector2(mouse.x1 - mouse.x2, mouse.y1 - mouse.y2);
    if (direction.magnitude() > 50) {
      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(whiteBall.position.x, whiteBall.position.y);
      ctx.lineTo(
        whiteBall.position.x + (mouse.x1 - mouse.x2),
        whiteBall.position.y + (mouse.y1 - mouse.y2)
      );
      ctx.closePath();
      ctx.stroke();
    }
  }
};

let lastTick = Date.now();
const tick = () => {
  if (collision) {
    // render();
    // const [a, b] = collision;
    // const direction = Vector2.subtract(a.position, b.position);
    // const aForward = Vector2.add(a.position, a.velocity);
    // const bForward = Vector2.add(b.position, b.velocity);
    // const aOrtho = new Vector2(direction.y, -direction.x)
    //   .normalize()
    //   .scale(100);
    // const bOrtho = new Vector2(-direction.y, direction.x)
    //   .normalize()
    //   .scale(100);
    // ctx.strokeStyle = "blue";
    // ctx.beginPath();
    // ctx.moveTo(a.position.x, a.position.y);
    // ctx.lineTo(b.position.x, b.position.y);
    // ctx.closePath();
    // ctx.stroke();
    // ctx.strokeStyle = "yellow";
    // ctx.beginPath();
    // ctx.moveTo(a.position.x, a.position.y);
    // ctx.lineTo(aForward.x, aForward.y);
    // ctx.closePath();
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.moveTo(a.position.x, a.position.y);
    // ctx.lineTo(a.position.x + aOrtho.x, a.position.y + aOrtho.y);
    // ctx.closePath();
    // ctx.stroke();
    // ctx.strokeStyle = "red";
    // ctx.beginPath();
    // ctx.moveTo(b.position.x, b.position.y);
    // ctx.lineTo(bForward.x, bForward.y);
    // ctx.closePath();
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.moveTo(b.position.x, b.position.y);
    // ctx.lineTo(b.position.x + bOrtho.x, b.position.y + bOrtho.y);
    // ctx.closePath();
    // ctx.stroke();
    // const [A1, B1] = ellasticCollision(
    //   a.position,
    //   a.velocity,
    //   b.position,
    //   b.velocity
    // );
    // console.log(A1, B1);
  } else {
    requestAnimationFrame(tick);
    const now = Date.now();
    const deltaTime = now - lastTick;
    lastTick = now;

    render();
    update(deltaTime);
  }
};

let whiteBall: Ball;
const init = () => {
  // for (let i = 0; i < 16; i++) {
  //   balls.push(
  //     new Ball(
  //       Math.random() * (W - 200) + 100,
  //       Math.random() * (H - 200) + 100,
  //       Math.random() < 0.5 ? "ball_8" : "ball_16"
  //     )
  //   );
  // }

  balls.push(new Ball(W - 294 - BALL_RADIUS * 2, H / 2, "ball_8"));

  balls.push(new Ball(W - 294, H / 2 - BALL_RADIUS, "ball_8"));
  balls.push(new Ball(W - 294, H / 2 + BALL_RADIUS, "ball_8"));

  balls.push(new Ball(W - 294 + BALL_RADIUS * 2, H / 2, "ball_8"));
  balls.push(
    new Ball(W - 294 + BALL_RADIUS * 2, H / 2 - BALL_RADIUS * 2, "ball_8")
  );
  balls.push(
    new Ball(W - 294 + BALL_RADIUS * 2, H / 2 + BALL_RADIUS * 2, "ball_8")
  );

  balls.push(
    new Ball(W - 294 + BALL_RADIUS * 4, H / 2 - BALL_RADIUS * 1, "ball_8")
  );
  balls.push(
    new Ball(W - 294 + BALL_RADIUS * 4, H / 2 - BALL_RADIUS * 3, "ball_8")
  );
  balls.push(
    new Ball(W - 294 + BALL_RADIUS * 4, H / 2 + BALL_RADIUS * 3, "ball_8")
  );
  balls.push(
    new Ball(W - 294 + BALL_RADIUS * 4, H / 2 + BALL_RADIUS * 1, "ball_8")
  );

  whiteBall = new Ball(294, H / 2, "ball_16");

  balls.push(whiteBall);

  tick();
};

const preload = () => {
  return Promise.all<void>(
    Object.keys(sprites).map((name) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          sprites[name].sprite = img;
          resolve();
        };
        img.onerror = () => {
          reject();
        };
        img.src = sprites[name].src;
      });
    })
  );
};

class Ball {
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  spriteName: string;
  destroy: boolean = false;
  collisionProcessed = false;

  constructor(x, y, spriteName) {
    this.position = new Vector2(x, y);
    this.spriteName = spriteName;
    this.velocity = new Vector2();
    this.acceleration = new Vector2();
  }

  get l() {
    return this.position.x - BALL_RADIUS;
  }
  get r() {
    return this.position.x + BALL_RADIUS;
  }
  get t() {
    return this.position.y - BALL_RADIUS;
  }
  get b() {
    return this.position.y + BALL_RADIUS;
  }
}

preload().then(init);

const ellasticCollision = (
  p1: Vector2,
  v1: Vector2,
  p2: Vector2,
  v2: Vector2
): Vector2[] => {
  const p12 = Vector2.subtract(p1, p2);
  const d = Vector2.multiply(
    Vector2.divide(Vector2.subtract(v1, v2), p12),
    p12
  );
  return [Vector2.subtract(v1, d), Vector2.add(v2, d)];
};

const ellasticCollision2 = (
  x1,
  y1,
  x2,
  y2,
  x3,
  y3,
  x4,
  y4,
  u = (x3 -= x1) * x3 + (y3 -= y1) * y3,
  v = x2 * x3 + y2 * y3 - x4 * x3 - y4 * y3
) => [x2 - (x3 *= v / u), y2 - (v *= y3 / u), x4 + x3, y4 + v];

let mouse = {
  pressed: false,
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
};

document.addEventListener("mousedown", (e) => {
  mouse.pressed = true;
  mouse.x1 = e.pageX;
  mouse.y1 = e.pageY;

  mouse.x2 = e.pageX;
  mouse.y2 = e.pageY;
});

document.addEventListener("touchstart", (e) => {
  mouse.pressed = true;
  mouse.x1 = e.touches[0].pageX;
  mouse.y1 = e.touches[0].pageY;

  mouse.x2 = e.touches[0].pageX;
  mouse.y2 = e.touches[0].pageY;
});

document.addEventListener("mouseup", () => {
  mouse.pressed = false;

  const direction = new Vector2(mouse.x1 - mouse.x2, mouse.y1 - mouse.y2);
  whiteBall.velocity = direction;
  // console.log(direction, direction.magnitude());
});

document.addEventListener("touchend", () => {
  mouse.pressed = false;

  const direction = new Vector2(mouse.x1 - mouse.x2, mouse.y1 - mouse.y2);
  if (direction.magnitude() > 50) {
    whiteBall.velocity = direction;
  }
  // console.log(direction, direction.magnitude());
});

document.addEventListener("mousemove", (e) => {
  mouse.x2 = e.pageX;
  mouse.y2 = e.pageY;
});

document.addEventListener("touchmove", (e) => {
  mouse.x2 = e.touches[0].pageX;
  mouse.y2 = e.touches[0].pageY;
});
