import { Asteroid } from '../types/types';

export function checkBulletCollision(
  asteroids: Asteroid[],
  bulletX: number,
  bulletY: number
) {
  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    if (
      bulletX > asteroid.x &&
      bulletX < asteroid.x + 40 &&
      bulletY + 20 > asteroid.y &&
      bulletY < asteroid.y + 40
    ) {
      return asteroid.id;
    }
  }
  return -1;
}
