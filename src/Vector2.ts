export class Vector2 {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  static distance(A: Vector2, B: Vector2): number {
    return Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2));
  }

  distance(V: Vector2): number {
    return Math.sqrt(Math.pow(this.x - V.x, 2) + Math.pow(this.y - V.y, 2));
  }

  static distanceSq(A: Vector2, B: Vector2): number {
    return Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2);
  }

  magnitude(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize(): Vector2 {
    let m = this.magnitude();

    this.x /= m;
    this.y /= m;

    return this;
  }

  static add(A: Vector2, B: Vector2): Vector2 {
    return new Vector2(A.x + B.x, A.y + B.y);
  }

  add(V: Vector2): void {
    this.x += V.x;
    this.y += V.y;
  }

  static subtract(A: Vector2, B: Vector2): Vector2 {
    return new Vector2(A.x - B.x, A.y - B.y);
  }

  subtract(V: Vector2): Vector2 {
    return new Vector2(this.x - V.x, this.y - V.y);
  }

  static divide(A: Vector2, B: Vector2): Vector2 {
    return new Vector2(A.x / B.x, A.y / B.y);
  }

  static multiply(A: Vector2, B: Vector2): Vector2 {
    return new Vector2(A.x * B.x, A.y * B.y);
  }

  multiply(V: Vector2): Vector2 {
    return new Vector2(this.x * V.x, this.y * V.y);
  }

  static scale(A: Vector2, value: number): Vector2 {
    return new Vector2(A.x * value, A.y * value);
  }

  scale(value: number): Vector2 {
    return new Vector2(this.x * value, this.y * value);
  }

  static dot(A: Vector2, B: Vector2): number {
    return A.x * B.x + A.y * B.y;
  }

  dot(V: Vector2): number {
    return this.x * V.x + this.y * V.y;
  }
}
