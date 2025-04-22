"use client";
import { useRef, useState } from "react";
import Chance from "chance";
import styles from "./style.module.css";

const chance = new Chance();

export default function BalloonPumpGame() {
  const containerRef = useRef(null);
  const [score, setScore] = useState(0);
  const [pumpState, setPumpState] = useState(0);
  const [currentBalloon, setCurrentBalloon] = useState(null);
  const [balloons, setBalloons] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const maxBalloons = 20;
  const balloonIdRef = useRef(0);

  const handlePumpClick = () => {
    // Animation trigger for pump and machine
    const pump = document.querySelector(".pump");
    if (pump) {
      pump.classList.add(`${styles.pumpanimate}`);
      setTimeout(() => {
        pump.classList.remove(`${styles.pumpanimate}`);
      }, 400);
    }

    const machine = document.querySelector(".machine");
    if (machine) {
      machine.classList.add(`${styles.machineanimate}`);
      setTimeout(() => {
        machine.classList.remove(`${styles.machineanimate}`);
      }, 400);
    }
    const outlet = document.querySelector(".machine1");
    if (outlet) {
      outlet.classList.add(`${styles.machineanimate}`);
      setTimeout(() => {
        outlet.classList.remove(`${styles.machineanimate}`);
      }, 400);
    }

    if (pumpState === 0) {
      if (balloons.length >= maxBalloons) return;
      const id = `balloon-${balloonIdRef.current++}`;
      const letter = `Symbol ${chance.integer({ min: 1, max: 26 })}`;
      const color = `Symbol ${chance.integer({ min: 111, max: 120 })}`;
      const newBalloon = {
        id,
        letter,
        color,
        size: 0,
        heightBoost: true,
        widthBoost: false,
        bothBoost: false,
        bottom: 290,
        right: 545,
        speed: 1.5 + Math.random() * 1.5,
        horizontal: Math.random() * 1.5 + 0.5, // always a rightward push due to wind
        interval: null,
        released: false,
      };
      setCurrentBalloon(newBalloon);
      setPumpState(1);
    } else if (pumpState === 1 && currentBalloon) {
      const updatedBalloon = { ...currentBalloon };
      updatedBalloon.size += 3.5; // grow height
      updatedBalloon.heightBoost = true;
      updatedBalloon.widthBoost = false;
      updatedBalloon.bothBoost = false;
      setCurrentBalloon(updatedBalloon);
      setPumpState(2);
    } else if (pumpState === 2 && currentBalloon) {
      const updatedBalloon = { ...currentBalloon };
      updatedBalloon.size += 3.5; // grow width
      updatedBalloon.heightBoost = false;
      updatedBalloon.widthBoost = true;
      updatedBalloon.bothBoost = false;
      setCurrentBalloon(updatedBalloon);
      setPumpState(3);
    } else if (pumpState === 3 && currentBalloon) {
      const updatedBalloon = { ...currentBalloon };
      updatedBalloon.size += 4.0; // grow both
      updatedBalloon.heightBoost = true;
      updatedBalloon.widthBoost = true;
      updatedBalloon.bothBoost = true;
      setCurrentBalloon(updatedBalloon);
      setPumpState(4);
    } else if (pumpState === 4 && currentBalloon) {
      const floatBalloon = { ...currentBalloon };
      floatBalloon.released = true;
      floatBalloon.interval = setInterval(
        () => updateFloating(floatBalloon),
        30
      );
      setBalloons((prev) => [...prev, floatBalloon]);

      // Immediately prepare a new balloon
      if (balloons.length < maxBalloons) {
        const id = `balloon-${balloonIdRef.current++}`;
        const letter = `Symbol ${chance.integer({ min: 1, max: 26 })}`;
        const color = `Symbol ${chance.integer({ min: 111, max: 120 })}`;
        const newBalloon = {
          id,
          letter,
          color,
          size: 0,
          heightBoost: true,
          widthBoost: false,
          bothBoost: false,
          bottom: 290,
          right: 545,
          speed: 1.5 + Math.random() * 1.5,
          horizontal: Math.random() * 1.5 + 0.5, // always a rightward push due to wind
          interval: null,
          released: false,
        };
        setCurrentBalloon(newBalloon);
        setPumpState(1);
      } else {
        setCurrentBalloon(null);
        setPumpState(0);
      }
    }
  };

  const updateFloating = (balloon) => {
    if (!balloon.released) return;
    const container = containerRef.current;
    if (!container) return;

    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;

    balloon.bottom += balloon.speed;
    balloon.right += balloon.horizontal;

    // Bounce off bottom and top
    if (balloon.bottom >= containerHeight - 100 || balloon.bottom <= 0) {
      balloon.speed *= -1;
    }

    // Bounce off left and right
    if (balloon.right >= containerWidth - 100 || balloon.right <= 0) {
      balloon.horizontal *= -1;
    }

    setBalloons((prev) => [...prev]);
  };

  const popBalloon = (id, size) => {
    // Removed confettiBursts logic and poppedBalloon lookup
    // Mark balloon as popped for animation, and set isPopping for animation
    setBalloons((prev) =>
      prev.map((b) =>
        b.id === id
          ? (() => {
              if (b.interval) clearInterval(b.interval);
              return { ...b, popped: true, isPopping: true };
            })()
          : b
      )
    );
    setScore((prev) => prev + (size + 1) * 10);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    // Remove balloon after pop animation
    setTimeout(() => {
      setBalloons((prev) => prev.filter((b) => b.id !== id));
    }, 500);
  };

  const renderBalloon = (balloon) => {
    const baseSize = 30;
    const sizeMultiplier = 20;

    let width, height;

    if (balloon.bothBoost) {
      width = baseSize + balloon.size * sizeMultiplier;
      height = width;
    } else {
      const widthBoostAmount = balloon.widthBoost
        ? balloon.size * sizeMultiplier
        : 0;
      const heightBoostAmount = balloon.heightBoost
        ? balloon.size * sizeMultiplier
        : 0;

      width = baseSize + Math.min(widthBoostAmount, 100);
      height = baseSize + Math.max(heightBoostAmount, widthBoostAmount);
    }

    return (
      <div
        key={balloon.id}
        className={`absolute balloon-wrapper ${
          balloon.popped ? styles.pop : ""
        } ${balloon.isPopping ? styles.popping : ""}`}
        style={{
          right: balloon.right,
          bottom: balloon.bottom,
          width: width,
          height: height + 20,
          zIndex: 3,
          transform: "translate(50%, 0)",
          transition: "width 0.3s ease, height 0.3s ease",
        }}
        onClick={() => popBalloon(balloon.id, balloon.size)}
      >
        <img
          src={`/Graphics/${balloon.color}.png`}
          className="absolute w-full h-full object-fill"
          alt="balloon"
        />
        <img
          src={`/Graphics/${balloon.letter}.png`}
          className="absolute top-1/4 left-1/4 w-1/2 h-1/2 object-contain pointer-events-none"
          alt="lavdya"
        />
        {balloon.bothBoost && (
          <img
            src="/Graphics/Symbol 100011.png"
            className="absolute bottom-[-93px] left-1/2 transform -translate-x-1/2 w-46 h-46 object-contain"
            alt="thread"
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-100">
      {/* <h1 className="text-2xl font-bold mb-4 bg-black">Balloon Pump Game</h1> */}
      <div
        ref={containerRef}
        className="relative w-[100vw] h-[100vh] bg-indigo-100 rounded-lg shadow-lg overflow-hidden"
        style={{ backgroundImage: "url('/Graphics/clouds.png')" }}
      >
        <div
          className="absolute right-12 bottom-8 w-[450px] h-[450px] bg-no-repeat bg-contain z-40 machine z-30"
          style={{ backgroundImage: "url('Graphics/Symbol 320003.png')" }}
        />
        <div
          className="absolute right-[360px] bottom-25 w-[250px] h-[250px] bg-no-repeat bg-contain machine1 z-30"
          style={{ backgroundImage: "url('Graphics/Symbol 320002.png')" }}
        />
        <div
          className="absolute right-[30px] bottom-[350px] w-[400px] h-[300px] bg-no-repeat bg-contain z-20 cursor-pointer pump z-2"
          style={{ backgroundImage: "url('/Graphics/Symbol 320001.png')" }}
          onClick={handlePumpClick}
        />

        {currentBalloon && renderBalloon(currentBalloon)}
        {balloons.map(renderBalloon)}
      </div>

      {/* <div className="mt-4 text-lg font-semibold bg-black">Score: {score}</div> */}
    </div>
  );
}
