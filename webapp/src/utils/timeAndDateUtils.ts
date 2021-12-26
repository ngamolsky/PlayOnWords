const DAYS = [
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
