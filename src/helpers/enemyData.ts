import asteroid0 from "../assets/png/asteroid0.png";
import asteroid1 from "../assets/png/asteroid1.png";
import asteroid2 from "../assets/png/asteroid2.png";
import asteroid3 from "../assets/png/asteroid3.png";
import asteroid4 from "../assets/png/asteroid4.png";
import asteroid5 from "../assets/png/asteroid5.png";
import explotion2 from "../assets/png/explotion2.png";
import boss7 from "../assets/png/monster.png";
import ship from "../assets/png/spaceship.png";
import space from "../assets/png/space1-1920.jpg";
import space2 from "../assets/png/galaxy2.jpg";
// sounds
import shoot from "../assets/sounds/shoot.mp3";
import boom from "../assets/sounds/boom.mp3";
import level1 from "../assets/sounds/1level.mp3";
import level2 from "../assets/sounds/2level.mp3";
import enemyShoot from "../assets/sounds/enemyShoot.mp3";
import lose from "../assets/sounds/lose.mp3";
import win from "../assets/sounds/win.mp3";
import swichLevel from "../assets/sounds/swichLevel.mp3";
import { EnemyId } from "../types/types";
import { BaseTexture, Rectangle, Texture } from "pixi.js";

export const asteroidsData: EnemyId[] = [
  { id: 1, x: 470, y: 50, image: asteroid0 },
  { id: 2, x: 570, y: 50, image: asteroid1 },
  { id: 3, x: 670, y: 50, image: asteroid2 },
  { id: 4, x: 570, y: 130, image: asteroid3 },
  { id: 5, x: 670, y: 130, image: asteroid4 },
  { id: 6, x: 770, y: 50, image: asteroid5 },
];

export const bossData: EnemyId[] = [
  { id: 7, x: 650, y: 50, image: boss7, health: 4, maxHealth: 4 },
];

export const IMG = {
  ship,
  space,
  space2,
};

export const mp3 = {
  level1,
  level2,
  shoot,
  enemyShoot,
  lose,
  win,
  boom,
  swichLevel,
};

const texture = BaseTexture.from(explotion2);

// Define rectangular areas for each animation frame in the texture
const frameRectangles = [
  new Rectangle(0, 194, 185, 185),
  new Rectangle(194, 0, 185, 185),
  new Rectangle(0, 0, 187, 187),
  new Rectangle(185, 185, 185, 185),
  new Rectangle(370, 0, 185, 185),
  new Rectangle(370, 185, 185, 185),
  new Rectangle(0, 370, 185, 185),
  new Rectangle(185, 370, 185, 185),
  new Rectangle(370, 370, 185, 185),
];

export const explosion = frameRectangles.map((rect) => new Texture(texture, rect));
