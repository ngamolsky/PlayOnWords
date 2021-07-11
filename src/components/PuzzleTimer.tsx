import React, { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";

interface PuzzleTimerProps {
  puzzleStartTime: Date;
}

export const PuzzleTimer: React.FC<PuzzleTimerProps> = ({
  puzzleStartTime,
}) => {
  const [time, setTime] = useState(
    new Date().getTime() - puzzleStartTime.getTime()
  );

  useEffect(() => {
    const timeoutId = setInterval(() => {
      setTime(new Date().getTime() - puzzleStartTime.getTime());
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [puzzleStartTime]);

  const seconds = Math.floor((time / 1000) % 60),
    minutes = Math.floor((time / (1000 * 60)) % 60),
    hours = Math.floor((time / (1000 * 60 * 60)) % 24);

  const dateString = `${("0" + hours.toString()).slice(-2)}:${(
    "0" + minutes.toString()
  ).slice(-2)}:${("0" + seconds.toString()).slice(-2)}`;

  return (
    <Text my="auto" ml={4}>
      {dateString}
    </Text>
  );
};
