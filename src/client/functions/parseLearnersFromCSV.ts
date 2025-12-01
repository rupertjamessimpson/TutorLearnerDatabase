import { Learner, Availability } from "../../data/data_objects/Learner";

type TimeBandName = "morning" | "afternoon" | "evening";

const availabilityDays: (keyof Availability)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// ---------- header keyword config ----------

const learnerHeaderKeywords = {
  firstName: ["first name"],
  lastName: ["last name"],
  gender: ["gender"],
  phone: ["phone"],
  email: ["email"],
  help: ["help", "what would you like help with"],
  availability: ["availability", "available", "when are you available"],
} as const;

// Look up a value in this row by header substring(s)
function getFieldByKeywords(
  row: Record<string, string>,
  keywords: readonly string[]
): string {
  const headers = Object.keys(row); // already lowercased in our row

  for (const keyword of keywords) {
    const target = keyword.toLowerCase();
    const matchKey = headers.find((h) => h.includes(target));
    if (matchKey) {
      return row[matchKey];
    }
  }

  return "";
}

// ------------------ helpers ------------------

// Removes non-digit characters from phone
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Standardizes gender input
function normalizeGender(gender: string): string {
  const g = gender.toLowerCase();
  if (g.startsWith("m")) return "male";
  if (g.startsWith("f")) return "female";
  if (g.includes("non")) return "non-binary";
  return gender;
}

// Capitalizes first letter of a word
function capitalizeWord(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Uses regex to split a CSV line on commas, respecting quotes
function splitCSVLine(line: string): string[] {
  return line
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((v) => v.replace(/^"|"$/g, "").trim());
}

// Time bands for “morning / afternoon / evening”
const timeBands: Record<TimeBandName, { start: number; end: number }> = {
  morning: { start: 10 * 60, end: 12 * 60 },
  afternoon: { start: 12 * 60, end: 16 * 60 },
  evening: { start: 16 * 60, end: 20 * 60 },
};

function minutesToTimeString(minutes: number): string {
  const hour24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const mm = mins.toString().padStart(2, "0");
  return `${hour12}:${mm}${suffix}`;
}

function parseTimeStringToMinutes(time: string): number | null {
  if (!time) return null;
  const match = time.match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
  if (!match) return null;
  let [, hStr, mStr, suffix] = match;
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const upper = suffix.toUpperCase();
  if (upper === "PM" && h !== 12) h += 12;
  if (upper === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

/**
 * Parse "Monday mornings, Monday afternoons, Tuesday evenings"
 * into an Availability object. If multiple bands for the same day,
 * we merge them into the earliest start and latest end.
 */
function parseAvailability(text: string): Availability {
  const availability: Availability = Object.fromEntries(
    availabilityDays.map((day) => [
      day,
      { start_time: "", end_time: "" },
    ])
  ) as unknown as Availability;

  if (!text) return availability;

  const entries = text
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  for (const entry of entries) {
    const bandName: TimeBandName | undefined = (
      ["morning", "afternoon", "evening"] as TimeBandName[]
    ).find((band) => entry.includes(band));

    if (!bandName) continue;
    const band = timeBands[bandName];

    for (const day of availabilityDays) {
      if (!entry.includes(day)) continue;

      const dayAvail = availability[day];
      const currentStart = parseTimeStringToMinutes(dayAvail.start_time);
      const currentEnd = parseTimeStringToMinutes(dayAvail.end_time);

      const newStart =
        currentStart == null ? band.start : Math.min(currentStart, band.start);
      const newEnd =
        currentEnd == null ? band.end : Math.max(currentEnd, band.end);

      dayAvail.start_time = minutesToTimeString(newStart);
      dayAvail.end_time = minutesToTimeString(newEnd);
    }
  }

  return availability;
}

// ---------- level parsing (from “help” question) ----------

// Map the learner "help" options to the canonical level strings
// used in tutor preferences.
const helpToLevelMap: Record<string, string> = {
  "learning english": "esl_novice",
  "practicing english": "esl_beginner",
  "mastering english": "esl_intermediate",
  "citizenship": "citizenship",
  "special needs": "sped_ela",
  "basic math": "basic_math",
  "math hiset": "hiset_math",
  "basic reading": "basic_reading",
  "reading hiset": "hiset_reading",
  "basic writing": "basic_writing",
  "writing hiset": "hiset_writing",
};

function parseLevel(row: Record<string, string>): string {
  // Whatever text the learner selected for “help”
  const rawHelp =
    (getFieldByKeywords(row, learnerHeaderKeywords.help) || "").toLowerCase();

  if (!rawHelp) return "";

  // In case Google Forms ever lets them pick multiple options
  // (comma-separated), check each mapped keyword with `includes`.
  for (const [keyword, level] of Object.entries(helpToLevelMap)) {
    if (rawHelp.includes(keyword)) {
      return level;
    }
  }

  // Fallback: just return the raw text (so nothing is silently lost)
  return rawHelp;
}

// ---------- core parser ----------

export function parseLearnerFromCSV(text: string): Learner[] {
  // Split into lines, get headers
  const [headerLine, ...rows] = text.trim().split(/\r?\n/);
  const headerValues = splitCSVLine(headerLine).map((h) =>
    h.trim().toLowerCase()
  );

  return rows
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = splitCSVLine(line);

      // Build a "row" dictionary keyed by lowercased header text
      const row: Record<string, string> = {};
      headerValues.forEach((header, i) => {
        row[header] = (values[i] ?? "").toString();
      });

      const availabilityText = getFieldByKeywords(
        row,
        learnerHeaderKeywords.availability
      );
      const availability = parseAvailability(availabilityText || "");

      // Core fields via keyword lookup
      const firstNameRaw = getFieldByKeywords(
        row,
        learnerHeaderKeywords.firstName
      );
      const lastNameRaw = getFieldByKeywords(
        row,
        learnerHeaderKeywords.lastName
      );
      const genderRaw = getFieldByKeywords(row, learnerHeaderKeywords.gender);
      const phoneRaw = getFieldByKeywords(row, learnerHeaderKeywords.phone);
      const emailRaw = getFieldByKeywords(row, learnerHeaderKeywords.email);
      const levelRaw = parseLevel(row);

      const learner: Learner = {
        id: "", // filled in by batch-create service
        first_name: capitalizeWord(firstNameRaw || ""),
        last_name: capitalizeWord(lastNameRaw || ""),
        gender: normalizeGender(genderRaw || ""),
        phone: normalizePhone(phoneRaw || ""),
        email: (emailRaw || "").toLowerCase(),
        available: true,
        level: levelRaw, // normalized level string
        class: "",
        availability,
      };

      return learner;
    });
}
