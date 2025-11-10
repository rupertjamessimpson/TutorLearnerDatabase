const convertTime = (time?: string) => {
  if (!time) return "";
  if (time.includes("AM") || time.includes("PM")) {
    return time;
  }

  const [hours, minutes] = time.split(":");
  const suffix = +hours >= 12 ? "PM" : "AM";
  const convertedHours = +hours % 12 || 12;
  return `${convertedHours}:${minutes}${suffix}`;
};

export default convertTime;
