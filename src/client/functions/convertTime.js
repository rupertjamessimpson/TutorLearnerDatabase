const convertTime = (time) => {
  // If time is already in 12-hour format (AM/PM), just return it
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }

  // Otherwise, assume it’s in 24-hour format and convert
  const [hours, minutes] = time.split(':');
  const suffix = +hours >= 12 ? 'PM' : 'AM';
  const convertedHours = +hours % 12 || 12;
  return `${convertedHours}:${minutes}${suffix}`;
};

export default convertTime;