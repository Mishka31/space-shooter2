export type EnemyId = {
  id: number;
  x: number;
  y: number;
  image: string;
  health?: number;
  maxHealth?: number;
};
export type Enemy = {
  x: number;
  y: number;
};

export type Bullets = {
  x: number;
  y: number;
  width: number;
};
