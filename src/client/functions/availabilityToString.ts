import { Availability } from "../../data/data_objects/Tutor";
import capitalizeName from "./capitalizeName";
import parseTimeStringToMinutes from "./parseTimeStringToMinutes";

function availabilityToString(availability: Availability): string {
  const result: string[] = [];

  for (const [day, times] of Object.entries(availability)) {
    if (!times.start_time || !times.end_time)
      continue;

    const start = parseTimeStringToMinutes(times.start_time);
    const end = parseTimeStringToMinutes(times.end_time);

    if (start === null || end === null)
      continue;

    const dayName = capitalizeName(day);

    // Morning: 10:00AM - 1:00PM
    if (start < 13 * 60 && end > 10 * 60) {
      result.push(`${dayName} mornings`);
    }

    // Afternoon: 1:00PM - 6:00PM
    if (start < 18 * 60 && end > 13 * 60) {
      result.push(`${dayName} afternoons`);
    }

    // Evening: 6:00PM - 8:00PM
    if (start < 20 * 60 && end > 18 * 60) {
      result.push(`${dayName} evenings`);
    }
  }

  return result.join(", ");
}

export default availabilityToString;