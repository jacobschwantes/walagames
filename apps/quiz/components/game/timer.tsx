"use client";
// Based off https://buildui.com/recipes/animated-counter by Sam Selikoff
import { MotionValue, motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function CountdownTimer() {
  let [count, setCount] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => setCount((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return <Counter value={count} />;
}

const fontSize = 24;
const padding = 18;
const height = fontSize + padding;

function Counter({ value }: { value: number }) {
  return (
    <div
      style={{ fontSize }}
      className="flex overflow-hidden rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground px-2 leading-none relative"
    >
      {/* <span className="h-1 w-full absolute top-0 left-0 right-0 bg-black blur z-10"/>
      <span className="h-1 w-full absolute bottom-0 left-0 right-0 bg-black blur z-10"/> */}
      {/* <Digit place={100} value={value} /> */}
      <Digit place={10} value={value} />
      <Digit place={1} value={value} />
    </div>
  );
}

function Digit({ place, value }: { place: number; value: number }) {
  let valueRoundedToPlace = Math.floor(value / place);
  let animatedValue = useSpring(valueRoundedToPlace, {
    mass: 1,
    damping: 25,
    stiffness: 178,
  });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {[...Array(10).keys()].map((i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

function Number({ mv, number }: { mv: MotionValue; number: number }) {
  let y = useTransform(mv, (latest) => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;

    let memo = offset * height;

    if (offset > 5) {
      memo -= 10 * height;
    }

    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}
