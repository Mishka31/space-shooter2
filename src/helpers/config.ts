import { ColorMatrixFilter, Graphics } from "pixi.js";

/* Main */
export const main = {
  widthCanvas: 1280,
  heightCanvas: 720,
  brightness: 0.5,
  positionSpaceX: -400,
  positionSpaceY: -200,
  stepMoveSpace: 3,
  stepMoveBullet: 10,
  limitScore: 6,
  enemySize: { x: 40, y: 40 },
  bossSize: { x: 80, y: 80 },
  levelTime: 60,
  timeoutBeforeLevel: 2000,
  timeoutBetweenShoot: 700,
  intervalShoot: 2000,
  intervalPosition: 2500,
};

/* Ship config */
export const ship = {
  widthShip: 80,
  heightShip: 80,
  stepMoveShip: 10,
};

/* Bullet config */
export const bullet = {
  bulletY: 650,
  bulletCount: 10,
  bulletEnemyX: 20,
  bulletEnemyY: 90,
  initialPosition: { x: 0, y: 0, width: 0 },
};

/* Text content */
export const text = {
  bullets: "Bullets",
  health: "Health",
  score: "Score",
  win: "YOU WIN 🤩",
  boss: "BOSS FIGHT!",
  start: "START",
  lose: "YOU LOSE 😕",
  again: "PLAY AGAIN",
  time: "Time",
};

/* Color filter on canvas */
export const Filter = new ColorMatrixFilter();
Filter.brightness(main.brightness, true);

export const handlers = {
  handleMouseOver: () => (document.body.style.cursor = "pointer"),
  handleMouseOut: () => (document.body.style.cursor = "default"),
};

/* Graphics draw sets */
export const draws = {
  bullet: (g: Graphics, x: number, y: number) => {
    g.clear();
    g.beginFill(0xffffff);
    g.moveTo(x, y - 10);
    g.lineTo(x - 5, y + 10);
    g.lineTo(x + 5, y + 10);
    g.lineTo(x, y - 10);
    g.endFill();
  },

  bulletEnemy: (g: Graphics, x: number, y: number) => {
    g.clear();
    g.beginFill(0xff0000);
    g.drawPolygon([
      -14, -14, -8, -20, 0, -14, 8, -20, 14, -14, 12, 0, 10, 10, 0, 14, -10, 10, -12, 0,
    ]);
    g.endFill();
    g.lineStyle(3, 0x8b4513, 1);
    g.drawPolygon([
      -14, -14, -8, -20, 0, -14, 8, -20, 14, -14, 12, 0, 10, 10, 0, 14, -10, 10, -12, 0,
    ]);
    g.x = x;
    g.y = y;
  },

  healthBar: (g: Graphics, x: number, y: number, health?: number, maxHealth?: number) => {
    const healthBarWidth = 80;
    const healthBarHeight = 5;
    let healthBarX = x;
    const healthBarY = y - 20;
    const remainingHealth = health || 0;
    const maxHealthDraw = maxHealth || 0;
    g.clear();
    g.beginFill(0x808080);
    g.drawRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
    g.endFill();
    g.beginFill(0x00ff00);
    let filledWidth = (healthBarWidth * remainingHealth) / maxHealthDraw;
    g.drawRect(healthBarX, healthBarY, filledWidth, healthBarHeight);
    g.endFill();
  },
};
