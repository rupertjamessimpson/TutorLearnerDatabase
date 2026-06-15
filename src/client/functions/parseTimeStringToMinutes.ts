function parseTimeStringToMinutes(time: string): number | null {
  if (!time) return null;

  const match = time.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);

  if (!match) return null;

  let [, hStr, mStr, suffix] = match;

  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  suffix = suffix.toUpperCase();

  if (suffix === "PM" && h !== 12)
    h += 12;

  if (suffix === "AM" && h === 12)
    h = 0;

  return h * 60 + m;
}

export default parseTimeStringToMinutes;