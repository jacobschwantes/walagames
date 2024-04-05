"use client";
import { useEffect, useMemo, useState } from "react";

type CountdownTimerProps = {
  targetDate: number;
};

function calculateTimeLeft(target: number) {
  const difference = target * 1000 - Date.now();
  let timeLeft;

  if (difference > 0) {
    timeLeft = Math.floor((difference / 1000) % 60);
  }

  return timeLeft;
}

function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  const totalSeconds = useMemo(() => {
    const time = calculateTimeLeft(targetDate);
    return {
      id: Math.floor(Math.random() * 1000),
      seconds: time,
    };
  }, [targetDate]);

  useEffect(() => {
    // Update the time left every second
    setTimeLeft(calculateTimeLeft(targetDate));
  }, [targetDate]);

  useEffect(() => {
    // Update the time left every second

    if (timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft(targetDate));
      }, 1000);

      // Clear timeout if the component is unmounted
      return () => clearTimeout(timer);
    }
  });

  // Helper function to calculate time left until target date

  return (
    <div className="relative w-16 flex justify-center items-center">
      <div className="countdown-timer">
        <div className="countdown-timer__circle">
          <svg>
            <circle className="inactive" r="24" cx="26" cy="26" />
            <circle
              key={totalSeconds.id}
              className="active"
              r="24"
              cx="26"
              cy="26"
              style={{
                animation: `countdown-animation ${totalSeconds.seconds}s linear`,
              }}
            />
          </svg>
        </div>

        <span className="countdown-timer__text">{timeLeft}</span>
      </div>
    </div>
  );
}
export { CountdownTimer };
