import React, { useEffect, useRef, useState } from "react";
import { AnimatedSprite, Container, Graphics, Sprite, Stage, Text } from "@pixi/react";
import { Enemy, EnemyId } from "./types/types";
import { textStyleScore, textStyleStart, textStyleTime, textStyleWin } from "./styles/common";
import { IMG, asteroidsData, bossData, explosion } from "./helpers/enemyData";
import { bulletBulletCollision, bulletEnemyCollision } from "./helpers/collision";
import { Filter, bullet, draws, handlers, main, ship, text } from "./helpers/config";

function App() {
  const [spaceX, setSpaceX] = useState<number>(main.positionSpaceX);
  const [shipX, setShipX] = useState<number>((main.widthCanvas - ship.widthShip) / 2);
  const [enemySize, setEnemySize] = useState<Enemy>(main.enemySize);

  const [isBullet, setIsBullet] = useState(false);
  const [bulletX, setBulletX] = useState<number>(shipX);
  const [bulletY, setBulletY] = useState<number>(bullet.bulletY);
  const [bulletCount, setBulletCount] = useState<number>(bullet.bulletCount);

  const [asteroids, setAsteroids] = useState<EnemyId[]>(asteroidsData);
  const [score, setScore] = useState<number>(0);
  const [limitScore, setLimitScore] = useState<number>(main.limitScore);

  const [time, setTime] = useState(15);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isLose, setIsLose] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isLevelBoss, setIsLevelBoss] = useState(false);
  const [isBulletEnemy, setIsBulletEnemy] = useState(false);
  const [bulletEnemyX, setBulletEnemyX] = useState<number>(bullet.bulletEnemyX);
  const [bulletEnemyY, setBulletEnemyY] = useState<number>(bullet.bulletEnemyY);

  const [isBulletHit, setIsBulletHit] = useState(false);
  const [bulletHitX, setBulletHitX] = useState(-100);
  const [bulletHitY, setBulletHitY] = useState(-100);

  let animationFrameId: number | null = null;
  let bulletAnimationFrameId: number | null = null;
  let bulletEnemyFrameId: number | null = null;

  let direction = 0; // 0 for no movement, -1 for left, 1 for right

  const shipXRef = useRef<number>((main.widthCanvas - ship.widthShip) / 2);
  const bulletYRef = useRef<number>(bullet.bulletY);
  const bulletEnemyYRef = useRef<number>(bullet.bulletEnemyY);
  const isClashRef = useRef<boolean>(false);

  const moveShip = () => {
    shipXRef.current += direction * ship.stepMoveShip;

    setShipX((prev) => prev + direction * ship.stepMoveShip);
    setSpaceX((prev) => prev - direction * main.stepMoveSpace);
    if (!isLevelBoss) {
      setAsteroids((prev) =>
        prev.map((asteroid) => ({
          ...asteroid,
          x: asteroid.x - (direction * main.stepMoveSpace) / 2,
        }))
      );
    }
    animationFrameId = requestAnimationFrame(moveShip);
  };

  const moveBulletEnemy = () => {
    bulletEnemyYRef.current += main.stepMoveBullet;
    setBulletEnemyY(bulletEnemyYRef.current);

    if (bulletEnemyYRef.current < main.heightCanvas) {
      bulletEnemyFrameId = requestAnimationFrame(moveBulletEnemy);
    } else {
      bulletEnemyFrameId && cancelAnimationFrame(bulletEnemyFrameId);
      bulletEnemyFrameId = null;
      setIsBulletEnemy(false);
      setBulletEnemyY(bullet.bulletEnemyY);
      bulletEnemyYRef.current = bullet.bulletEnemyY;
    }
  };

  const moveBullet = () => {
    bulletYRef.current -= main.stepMoveBullet;
    setBulletY(bulletYRef.current);

    let collisionId = bulletEnemyCollision(asteroids, bulletX, bulletYRef.current, isLevelBoss);

    if (collisionId >= 0 && bulletAnimationFrameId) {
      if (!isLevelBoss) {
        setBulletHitX(bulletX);
        setBulletHitY(bulletYRef.current);
        setIsBulletHit(true);

        setTimeout(() => {
          setIsBulletHit(false);
        }, 500);
      }

      if (isLevelBoss && asteroids[0].health && asteroids[0].health > 1) {
        setAsteroids((prev) =>
          prev.map((asteroid) => ({
            ...asteroid,
            health: asteroid.health && !isClashRef.current ? asteroid.health - 1 : asteroid.health,
          }))
        );
      } else {
        const updatedAsteroids = asteroids.filter((asteroid) => asteroid.id !== collisionId);
        setAsteroids(updatedAsteroids);
      }

      setBulletCount((prev) => prev - 1);
      setScore((prev) => prev + 1);
      setIsBullet(false);
      setBulletY(bullet.bulletY);
      cancelAnimationFrame(bulletAnimationFrameId);
    } else if (bulletYRef.current <= 0 && bulletAnimationFrameId) {
      setIsBullet(false);
      setBulletY(bullet.bulletY);
      setBulletCount((prev) => prev - 1);
      cancelAnimationFrame(bulletAnimationFrameId);
    } else {
      bulletAnimationFrameId = requestAnimationFrame(moveBullet);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isGameRunning || bulletCount <= 0) return;

    if (e.key === "ArrowLeft") {
      direction = -1;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(moveShip);
      }
    } else if (e.key === "ArrowRight") {
      direction = 1;
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(moveShip);
      }
    } else if (e.key === " " && !isBullet) {
      isClashRef.current = false;
      setIsBullet(true);
    }
  };

  const handleKeyUp = () => {
    direction = 0;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  };

  const handleStartClick = () => {
    setIsLevelBoss(false);
    setEnemySize(main.enemySize);
    setScore(0);
    setBulletCount(bullet.bulletCount);
    setTime(main.levelTime);
    setShipX((main.widthCanvas - ship.widthShip) / 2);
    setIsLose(false);
    setIsWin(false);
    setAsteroids(asteroidsData);
    setIsGameRunning(true);
  };

  /*Then Enemy shuts bullet */
  useEffect(() => {
    let bulletTopObj = { x: bulletEnemyX, y: bulletEnemyYRef.current, width: 26 };
    let bulletBottomObj = { x: bulletX, y: bulletYRef.current, width: 26 };
    let shipObj = {
      x: shipXRef.current + 30,
      y: main.heightCanvas - (ship.heightShip - bullet.bulletEnemyX),
      width: 50,
    };

    /*Then enemy bullet connect with ship bullet */
    if (isLevelBoss && isBulletEnemy && isBullet) {
      let isContactBullets = bulletBulletCollision(bulletBottomObj, bulletTopObj);
      if (isContactBullets) {
        setBulletHitX(bulletX);
        setBulletHitY(bulletYRef.current);
        setIsBulletHit(true);
        setTimeout(() => {
          setIsBulletHit(false);
        }, 500);

        isClashRef.current = true;
        setIsBullet(false);
        setIsBulletEnemy(false);
        bulletBottomObj = bullet.initialPosition;
        bulletTopObj = bullet.initialPosition;
      } else {
        isClashRef.current = false;
      }

      /*Then enemy bullet connect winth ship */
    } else if (isLevelBoss && isBulletEnemy && !isClashRef.current) {
      let isHitInShip = bulletBulletCollision(shipObj, bulletTopObj);
      if (isHitInShip) {
        setIsBulletEnemy(false);
        setIsGameRunning(false);
        setIsLose(true);
        shipXRef.current = (main.widthCanvas - ship.widthShip) / 2;
      }
    }
  }, [
    isClashRef.current,
    isLevelBoss,
    isBulletEnemy,
    isBullet,
    bulletX,
    bulletEnemyX,
    bulletYRef.current,
    shipXRef.current,
    bulletEnemyYRef.current,
  ]);

  /*Every 2 seconds shut enemy*/
  useEffect(() => {
    if (isLevelBoss && isGameRunning && asteroids.length) {
      let intervalId = setInterval(() => {
        setBulletEnemyX(asteroids[0].x + enemySize.x / 2);
        setIsBulletEnemy(true);
        isClashRef.current = false;
        moveBulletEnemy();
      }, main.intervalShut);

      return () => clearInterval(intervalId);
    }
  }, [isLevelBoss, asteroids, isGameRunning]);

  /*Every 2.5 seconds enemy change position random*/
  useEffect(() => {
    if (isLevelBoss && isGameRunning && asteroids.length) {
      const intervalId = setInterval(() => {
        setAsteroids((prevAsteroids) =>
          prevAsteroids.map((asteroid) => {
            const newX = Math.floor(Math.random() * (1000 - 200 + 1)) + 200;
            return { ...asteroid, x: newX };
          })
        );
      }, main.intervalPosition);

      return () => clearInterval(intervalId);
    }
  }, [isLevelBoss, asteroids, isGameRunning]);

  /* Active Window event listeners if Game started */
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isGameRunning]);

  /* Change Bullet position by shipX */
  useEffect(() => {
    if (!isBullet) {
      setBulletX(shipX + ship.widthShip / 2);
    }
  }, [shipX, isBullet, ship.widthShip]);

  /* Start animation bullet move up */
  useEffect(() => {
    if (isBullet) {
      bulletYRef.current = bullet.bulletY;
      bulletAnimationFrameId = requestAnimationFrame(moveBullet);
    }
  }, [isBullet]);

  /* Timer */
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameRunning && time > 0) {
      timer = setInterval(() => setTime((prevTime) => prevTime - 1), 1000);
    } else if (time <= 0) {
      setIsGameRunning(false);
      setIsLose(true);
    }
    return () => clearInterval(timer);
  }, [isGameRunning, time, isLose]);

  console.log("Test");

  /* New level || Lose || Win - update states*/
  useEffect(() => {
    if (bulletCount <= 0 || time <= 0) {
      setIsGameRunning(false);
      setIsLose(true);
    } else if (bulletCount && time >= 1 && asteroids.length === 0 && !isLevelBoss) {
      setIsGameRunning(false);
      setIsWin(true);
      /*Pause before new level*/
      setTimeout(() => {
        setIsGameRunning(true);
        setScore(0);
        setLimitScore(4);
        setBulletCount(bullet.bulletCount);
        setTime(main.levelTime);
        setAsteroids(bossData);
        setShipX((main.widthCanvas - ship.widthShip) / 2);
        shipXRef.current = (main.widthCanvas - ship.widthShip) / 2;
        setEnemySize(main.bossSize);
        setIsLevelBoss(true);
        setBulletEnemyX(bossData[0].x);
        setIsLose(false);
        setIsWin(false);
      }, main.timeoutBeforeLevel);
    } else if (isLevelBoss && bulletCount && time >= 1 && asteroids.length === 0) {
      setIsGameRunning(false);
      setIsWin(true);
      if (bulletAnimationFrameId) cancelAnimationFrame(bulletAnimationFrameId);
      if (bulletEnemyFrameId) cancelAnimationFrame(bulletEnemyFrameId);
    }
  }, [
    bulletCount,
    time,
    asteroids,
    main.widthCanvas,
    ship.widthShip,
    isLevelBoss,
    isGameRunning,
    bulletAnimationFrameId,
    bulletEnemyFrameId,
  ]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Stage width={main.widthCanvas} height={main.heightCanvas}>
        {IMG.space && IMG.space2 && (
          <Sprite
            image={isLevelBoss ? IMG.space2 : IMG.space}
            filters={[Filter]}
            x={spaceX}
            y={main.positionSpaceY}
          />
        )}
        <Text
          text={`${text.bullets}: ${bulletCount}/${bullet.bulletCount}`}
          x={20}
          y={20}
          style={textStyleScore}
          visible={isGameRunning}
        />
        <Text
          text={`${isLevelBoss ? text.health : text.score}: ${
            isLevelBoss ? asteroids[0]?.health : score
          }/${limitScore}`}
          x={20}
          y={50}
          style={textStyleScore}
          visible={isGameRunning}
        />

        <Text
          text={text.win}
          x={main.widthCanvas / 2}
          anchor={0.5}
          y={main.heightCanvas / 2}
          style={textStyleWin}
          visible={!isGameRunning && !isLose && isWin}
        />
        <Text
          text={text.boss}
          x={main.widthCanvas / 2}
          y={main.heightCanvas / 2 + 50}
          anchor={0.5}
          style={textStyleStart}
          visible={!isGameRunning && !isLose && isWin && !isLevelBoss}
        />

        <Text
          text={text.start}
          x={main.widthCanvas / 2}
          y={main.heightCanvas / 2}
          anchor={0.5}
          style={textStyleStart}
          interactive
          mouseover={handlers.handleMouseOver}
          mouseout={handlers.handleMouseOut}
          pointerdown={handleStartClick}
          visible={!isGameRunning && !isLose && !isWin}
        />

        <Text
          text={text.lose}
          x={main.widthCanvas / 2}
          y={main.heightCanvas / 2}
          anchor={0.5}
          style={textStyleTime}
          visible={!isGameRunning && isLose}
        />

        <Text
          text={text.again}
          x={main.widthCanvas / 2}
          y={main.heightCanvas / 2 + 50}
          anchor={0.5}
          style={textStyleStart}
          interactive
          mouseover={handlers.handleMouseOver}
          mouseout={handlers.handleMouseOut}
          pointerdown={handleStartClick}
          visible={!isGameRunning && isLose}
        />
        <Text
          text={`${text.time}: ${time}`}
          x={1210}
          y={35}
          anchor={0.5}
          style={textStyleTime}
          visible={isGameRunning}
        />

        {asteroids.map((enemy) => (
          <Container key={enemy.id} visible={isGameRunning}>
            <Sprite
              image={enemy.image}
              width={enemySize.x}
              height={enemySize.y}
              x={enemy.x}
              y={enemy.y}
              visible={isGameRunning}
            />
            <Graphics
              draw={(g) => draws.healthBar(g, enemy.x, enemy.y, enemy.health, enemy.maxHealth)}
              visible={isLevelBoss}
            />
          </Container>
        ))}
        <Sprite
          image={IMG.ship}
          width={ship.widthShip}
          height={ship.heightShip}
          x={shipX}
          y={main.heightCanvas - ship.heightShip}
          visible={isGameRunning}
        />
        <AnimatedSprite
          width={80}
          height={80}
          anchor={0.5}
          textures={explosion}
          loop={false}
          isPlaying={isBulletHit}
          initialFrame={0}
          animationSpeed={0.2}
          x={bulletHitX}
          y={bulletHitY}
          visible={isBulletHit}
        />

        <Graphics
          visible={isBulletEnemy}
          draw={(g) => draws.bulletEnemy(g, bulletEnemyX, bulletEnemyY)}
        />

        <Graphics draw={(g) => draws.bullet(g, bulletX, bulletY)} visible={isBullet} />
      </Stage>
    </div>
  );
}

export default App;
