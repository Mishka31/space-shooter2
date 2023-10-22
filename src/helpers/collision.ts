import { Bullets, EnemyId } from "../types/types";

export function bulletEnemyCollision(
  asteroids: EnemyId[],
  bulletX: number,
  bulletY: number,
  boss: boolean
) {
  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    if (
      bulletX > asteroid.x &&
      bulletX < asteroid.x + (boss ? 80 : 40) &&
      bulletY + 20 > asteroid.y &&
      bulletY < asteroid.y + (boss ? 80 : 40)
    ) {
      return asteroid.id;
    }
  }
  return -1;
}

export function bulletBulletCollision(bottomObj: Bullets, topObj: Bullets) {
  if (
    bottomObj.x + bottomObj.width > topObj.x &&
    bottomObj.x < topObj.x + topObj.width &&
    bottomObj.y + bottomObj.width > topObj.y &&
    bottomObj.y < topObj.y + topObj.width
  ) {
    return true;
  }
  return false;
}
