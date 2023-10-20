import React, { useEffect, useRef, useState } from "react";
import ship from "./assets/spaceship.png";
import space from "./assets/space1-1920.jpg";
import space2 from "./assets/galaxy2.jpg";
import bullet from "./assets/bullet.png";
import { Sprite, Stage, Text } from "@pixi/react";
import { ColorMatrixFilter } from "pixi.js";
import { Asteroid } from "./types/types";
import { textStyleScore, textStyleStart, textStyleTime, textStyleWin } from "./styles/common";
import { checkBulletCollision } from "./helpers/common";
import asteroidsData from "./helpers/asteroidData";

function App() {
  const [widthCanvas, heightCanvas] = [1280, 720];
  const [widthShip, heightShip] = [80, 80];
  const [positionSpaceX, positionSpaceY] = [-400, -200];
  const stepMoveShip = 10;
  const stepMoveSpace = 3;
  const darkFilter = new ColorMatrixFilter();
  darkFilter.brightness(0.5, true);

  const [spaceX, setSpaceX] = useState<number>(positionSpaceX);

  const [shipX, setShipX] = useState<number>((widthCanvas - widthShip) / 2);

  const [isBullet, setIsBullet] = useState(false);
  const [bulletX, setBulletX] = useState<number>(shipX);
  const [bulletY, setBulletY] = useState<number>(650);
  const [bulletCount, setBulletCount] = useState<number>(10);

  const [asteroids, setAsteroids] = useState<Asteroid[]>(asteroidsData);
  const [score, setScore] = useState<number>(0);

  const [time, setTime] = useState(15);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isLose, setIsLose] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isLeveBoss, setIsLeveBoss] = useState(false);

  let animationFrameId: number | null = null;
  let bulletAnimationFrameId: number | null = null;
  let direction = 0; // 0 for no movement, -1 for left, 1 for right

  const moveShip = () => {
    setShipX((prev) => prev + direction * stepMoveShip);
    setSpaceX((prev) => prev - direction * stepMoveSpace);
    setAsteroids((prev) =>
      prev.map((asteroid) => ({
        ...asteroid,
        x: asteroid.x - (direction * stepMoveSpace) / 2,
      }))
    );
    animationFrameId = requestAnimationFrame(moveShip);
  };

  const bulletYRef = useRef<number>(650);

  const moveBullet = () => {
    bulletYRef.current -= stepMoveShip;
    setBulletY(bulletYRef.current);
    const collisionId = checkBulletCollision(asteroids, bulletX, bulletYRef.current);
    if (collisionId >= 0 && bulletAnimationFrameId) {
      const updatedAsteroids = asteroids.filter((asteroid) => asteroid.id !== collisionId);
      setBulletCount((prev) => prev - 1);
      setScore((prev) => prev + 1);
      setAsteroids(updatedAsteroids);
      setIsBullet(false);
      setBulletY(650);
      cancelAnimationFrame(bulletAnimationFrameId);
    } else if (bulletYRef.current <= 0 && bulletAnimationFrameId) {
      setIsBullet(false);
      setBulletY(650);
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
      // setBulletCount((prev) => prev - 1);
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
    setScore(0);
    setBulletCount(10);
    setTime(15);
    setShipX((widthCanvas - widthShip) / 2);
    setIsLose(false);
    setIsWin(false);
    setAsteroids(asteroidsData);
    setIsGameRunning(true);
  };
  // const handleBossClick = () => {
  //   setIsGameRunning(true);
  // };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isGameRunning]);

  useEffect(() => {
    if (!isBullet) {
      setBulletX(shipX + widthShip / 2);
    }
  }, [shipX, isBullet, widthShip]);

  useEffect(() => {
    if (isBullet) {
      bulletYRef.current = 650;
      bulletAnimationFrameId = requestAnimationFrame(moveBullet);
    }
  }, [isBullet]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isGameRunning && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time <= 0) {
      setIsGameRunning(false);
      setIsLose(true);
    }

    return () => {
      clearInterval(timer);
    };
  }, [isGameRunning, time, isLose]);

  useEffect(() => {
    if (bulletCount <= 0 && time <= 0) {
      setIsGameRunning(false);
      setIsLose(true);
    } else if (bulletCount && time >= 1 && asteroids.length === 0) {
      setIsGameRunning(false);
      setIsWin(true);
      /*Pause before new level*/
      setTimeout(() => {
        setIsGameRunning(true);
        setScore(0);
        setBulletCount(10);
        setTime(15);
        setShipX((widthCanvas - widthShip) / 2);
        setAsteroids(asteroidsData);
        setIsLeveBoss(true);
        setIsLose(false);
        setIsWin(false);
      }, 2000);
    }
  }, [bulletCount, time, asteroids, widthCanvas, widthShip, isLeveBoss]);

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Stage width={widthCanvas} height={heightCanvas}>
        {space && space2 && (
          <Sprite
            image={isLeveBoss ? space2 : space}
            filters={[darkFilter]}
            x={spaceX}
            y={positionSpaceY}
          />
        )}
        <Text
          text={`Bullets: ${bulletCount}/10`}
          x={20}
          y={20}
          style={textStyleScore}
          visible={isGameRunning}
        />
        <Text
          text={`Score: ${score}/6`}
          x={20}
          y={50}
          style={textStyleScore}
          visible={isGameRunning}
        />

        <Text
          text={"YOU WIN 🤩"}
          x={widthCanvas / 2}
          anchor={0.5}
          y={heightCanvas / 2}
          style={textStyleWin}
          visible={!isGameRunning && !isLose && isWin}
        />
        <Text
          text={"BOSS FIGHT!"}
          x={widthCanvas / 2}
          y={heightCanvas / 2 + 50}
          anchor={0.5}
          style={textStyleStart}
          visible={!isGameRunning && !isLose && isWin}
          // interactive
          // mouseover={() => {
          //   document.body.style.cursor = "pointer";
          // }}
          // mouseout={() => {
          //   document.body.style.cursor = "default";
          // }}
          // pointerdown={handleBossClick}
        />

        <Text
          text={"START"}
          x={widthCanvas / 2}
          y={heightCanvas / 2}
          anchor={0.5}
          style={textStyleStart}
          interactive
          mouseover={() => {
            document.body.style.cursor = "pointer";
          }}
          mouseout={() => {
            document.body.style.cursor = "default";
          }}
          pointerdown={handleStartClick}
          visible={!isGameRunning && !isLose && !isWin}
        />

        <Text
          text={"YOU LOSE 😕"}
          x={widthCanvas / 2}
          y={heightCanvas / 2}
          anchor={0.5}
          style={textStyleTime}
          visible={!isGameRunning && isLose}
        />

        <Text
          text={"PLAY AGAIN"}
          x={widthCanvas / 2}
          y={heightCanvas / 2 + 50}
          anchor={0.5}
          style={textStyleStart}
          interactive
          mouseover={() => {
            document.body.style.cursor = "pointer";
          }}
          mouseout={() => {
            document.body.style.cursor = "default";
          }}
          pointerdown={handleStartClick}
          visible={!isGameRunning && isLose}
        />
        <Text
          text={`Time: ${time}`}
          x={1210}
          y={35}
          anchor={0.5}
          style={textStyleTime}
          visible={isGameRunning}
        />

        {asteroids.map((asteroid, index) => (
          <Sprite
            key={index}
            image={asteroid.image}
            width={40}
            height={40}
            x={asteroid.x}
            y={asteroid.y}
            visible={isGameRunning}
          />
        ))}
        <Sprite
          image={ship}
          width={widthShip}
          height={heightShip}
          x={shipX}
          y={heightCanvas - heightShip}
          visible={isGameRunning}
        />
        <Sprite
          image={bullet}
          width={20}
          height={20}
          rotation={4.7}
          anchor={0.5}
          y={bulletY}
          x={bulletX}
          visible={isBullet}
        />
      </Stage>
    </div>
  );
}

export default App;
