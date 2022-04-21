export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const toXWordDate = (date: Date): string => {
  return `${DAYS[date.getUTCDay()]}, ${
    MONTHS[date.getUTCMonth()]
  } ${date.getUTCDate()}`;
};

export const toXWordTime = (date: Date): string => {
  return `${DAYS[date.getDay()]}, ${
    MONTHS[date.getMonth()]
  } ${date.getDate()} at ${date.getHours()}:${
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  }`;
};

export const calcDiffInSeconds = (dateA: Date, dateB: Date) => {
  return Math.max(
    Math.floor((dateA.getTime() - dateB.getTime()) / 1000 + 1),
    0
  );
};

export const secondsToTimeString = (seconds: number): string => {
  const durationDate = new Date(seconds * 1000);

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

  return hourString == "00"
    ? `${minuteString}:${secondString}`
    : `${hourString}:${minuteString}:${secondString}`;
};
