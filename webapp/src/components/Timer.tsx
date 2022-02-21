import React, { useEffect, useState } from "react";

const calcDiffInSeconds = (dateA: Date, dateB: Date) => {
  return Math.floor((dateA.getTime() - dateB.getTime()) / 1000);
};

const Timer = ({ sessionStartDate }: { sessionStartDate: Date }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [secondsDiff, setSecondsDiff] = useState(
    calcDiffInSeconds(currentDate, sessionStartDate)
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [currentDate]);

  useEffect(() => {
    setSecondsDiff(calcDiffInSeconds(currentDate, sessionStartDate));
  }, [currentDate, sessionStartDate]);


  const durationDate = new Date(secondsDiff * 1000);

  const hh = durationDate.getUTCHours();
  const mm = durationDate.getUTCMinutes();
  const ss = durationDate.getSeconds();

  let hourString = hh.toString();
  if (hh < 10) {
    hourString = "0" + hourString;
  }

  let minuteString = mm.toString();
  if (mm < 10) {
    minuteString = "0" + minuteString;
  }
  let secondString = ss.toString();
  if (ss < 10) {
    secondString = "0" + secondString;
  }

  const timerString =
    hourString == "00"
      ? `${minuteString}:${secondString}`
      : `${hourString}:${minuteString}:${secondString}`;
  return <>{timerString}</>;
};

export default Timer;
