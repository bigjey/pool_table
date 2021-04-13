/* https://www.jeffreythompson.org/collision-detection/ */

export function circleRect(
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  // temporary variables to set edges for testing
  let testX = cx;
  let testY = cy;

  // which edge is closest?
  if (cx < rx) testX = rx;
  // test left edge
  else if (cx > rx + rw) testX = rx + rw; // right edge
  if (cy < ry) testY = ry;
  // top edge
  else if (cy > ry + rh) testY = ry + rh; // bottom edge

  // get distance from closest edges
  let distX = cx - testX;
  let distY = cy - testY;
  let distance = Math.sqrt(distX * distX + distY * distY);

  // if the distance is less than the radius, collision!
  if (distance <= radius) {
    return true;
  }
  return false;
}

export function lineCircle(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx: number,
  cy: number,
  r: number
): boolean {
  // is either end INSIDE the circle?
  // if so, return true immediately
  const inside1 = pointCircle(x1, y1, cx, cy, r);
  const inside2 = pointCircle(x2, y2, cx, cy, r);
  if (inside1 || inside2) return true;

  // get length of the line
  let distX = x1 - x2;
  let distY = y1 - y2;
  const len = Math.sqrt(distX * distX + distY * distY);

  // get dot product of the line and circle
  const dot =
    ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / Math.pow(len, 2);

  // find the closest point on the line
  const closestX = x1 + dot * (x2 - x1);
  const closestY = y1 + dot * (y2 - y1);

  // is this point actually on the line segment?
  // if so keep going, but if not, return false
  const onSegment = linePoint(x1, y1, x2, y2, closestX, closestY);
  if (!onSegment) return false;

  // optionally, draw a circle at the closest
  // point on the line

  // get distance to closest point
  distX = closestX - cx;
  distY = closestY - cy;
  const distance = Math.sqrt(distX * distX + distY * distY);

  if (distance <= r) {
    return true;
  }
  return false;
}

// POINT/CIRCLE
export function pointCircle(
  px: number,
  py: number,
  cx: number,
  cy: number,
  r
): boolean {
  // get distance between the point and circle's center
  // using the Pythagorean Theorem
  const distX = px - cx;
  const distY = py - cy;
  const distance = Math.sqrt(distX * distX + distY * distY);

  // if the distance is less than the circle's
  // radius the point is inside!
  if (distance <= r) {
    return true;
  }
  return false;
}

// LINE/POINT
function linePoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  px: number,
  py: number
): boolean {
  // get distance from the point to the two ends of the line
  const d1 = dist(px, py, x1, y1);
  const d2 = dist(px, py, x2, y2);

  // get the length of the line
  const lineLen = dist(x1, y1, x2, y2);

  // since floats are so minutely accurate, add
  // a little buffer zone that will give collision
  const buffer = 0.1; // higher # = less accurate

  // if the two distances are equal to the line's
  // length, the point is on the line!
  // note we use the buffer here to give a range,
  // rather than one #
  if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
    return true;
  }
  return false;
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

export function pointOfLinesIntersection(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
): { x: number; y: number } | null {
  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return null;
  }

  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  // Lines are parallel
  if (denominator === 0) {
    return null;
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return null;
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1);
  let y = y1 + ua * (y2 - y1);

  return { x, y };
}
