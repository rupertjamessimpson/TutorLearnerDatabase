import { Tutor, Preferences, Availability } from "../../data/data_objects/Tutor";

type TimeBandName = "morning" | "afternoon" | "evening";

const preferenceKeywords: Record<string, keyof Preferences> = {
  "conversation": "conversation",
  "esl novice": "esl_novice",
  "esl beginner": "esl_beginner",
  "esl intermediate": "esl_intermediate",
  "citizenship": "citizenship",
  "special education ela": "sped_ela",
  "basic math": "basic_math",
  "hiset math": "hiset_math",
  "basic reading": "basic_reading",
  "hiset reading": "hiset_reading",
  "basic writing": "basic_writing",
  "hiset writing": "hiset_writing",
};

const availabilityDays: (keyof Availability)[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// ---------- header keyword config ----------

const tutorHeaderKeywords = {
  firstName: ["first name"],
  lastName: ["last name"],
  gender: ["gender"],
  phone: ["phone"],
  email: ["email"],
  preferences: ["preferences", "preference"],
  conversation: ["teach conversation", "conversation"],
  availability: ["availability", "available", "when are you available"],
} as const;

// Look up a value in this row by header substring(s)
function getFieldByKeywords(row: Record<string, string>, keywords: readonly string[]): string {
  const headers = Object.keys(row);

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

// Removes non-number digits from phone 
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

// Capitalizes first letter
function capitalizeWord(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Uses regex to split and parse by commas
function splitCSVLine(line: string): string[] {
  return line
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((v) => v.replace(/^"|"$/g, "").trim());
}

// Converts time to expected convention
const timeBands: Record<TimeBandName, { start: number; end: number }> = {
  morning: { start: 10 * 60, end: 13 * 60 },   // 10:00 AM - 1:00 PM
  afternoon: { start: 13 * 60, end: 18 * 60 }, // 1:00 PM - 6:00 PM
  evening: { start: 18 * 60, end: 20 * 60 },   // 6:00 PM - 8:00 PM
};

// Converts time numbers to string
function minutesToTimeString(minutes: number): string {
  const hour24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  const mm = mins.toString().padStart(2, "0");
  return `${hour12}:${mm}${suffix}`;
}

// Conversts time string back to minutes
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
    const bandName: TimeBandName | undefined = (["morning", "afternoon", "evening"] as TimeBandName[])
      .find((band) => entry.includes(band));

    if (!bandName) continue;
    const band = timeBands[bandName];

    for (const day of availabilityDays) {
      if (!entry.includes(day)) continue;

      const dayAvail = availability[day];
      const currentStart = parseTimeStringToMinutes(dayAvail.start_time);
      const currentEnd = parseTimeStringToMinutes(dayAvail.end_time);

      const newStart = currentStart == null ? band.start : Math.min(currentStart, band.start);
      const newEnd = currentEnd == null ? band.end : Math.max(currentEnd, band.end);

      dayAvail.start_time = minutesToTimeString(newStart);
      dayAvail.end_time = minutesToTimeString(newEnd);
    }
  }

  return availability;
}

// ---------- preferences parsing ----------

function parsePreferences(row: Record<string, string>): Preferences {
  const prefs: Preferences = Object.fromEntries(
    Object.values(preferenceKeywords).map((key) => [key, false])
  ) as unknown as Preferences;

  // Big multi-select "preferences" column
  const prefText =
    (getFieldByKeywords(row, tutorHeaderKeywords.preferences) || "").toLowerCase();

  // Mark subjects from the big multi-select question
  for (const [keyword, key] of Object.entries(preferenceKeywords)) {
    if (prefText.includes(keyword)) {
      prefs[key] = true;
    }
  }

  // Conversation class overrides if they said "yes"
  const convResponse =
    (getFieldByKeywords(row, tutorHeaderKeywords.conversation) || "").toLowerCase();
  if (convResponse.includes("yes")) {
    prefs.conversation = true;
  }

  return prefs;
}

// ---------- core parser ----------

export function parseTutorsFromCSV(text: string): Tutor[] {
  // 1. Split into lines, get headers
  const [headerLine, ...rows] = text.trim().split(/\r?\n/);
  const headerValues = splitCSVLine(headerLine).map((h) => h.trim().toLowerCase());

  return rows
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const values = splitCSVLine(line);

      // Build a "row" dictionary keyed by lowercased header text
      const row: Record<string, string> = {};
      headerValues.forEach((header, i) => {
        row[header] = (values[i] ?? "").toString();
      });

      // Build preferences + availability via keyword-based header lookup
      const preferences = parsePreferences(row);
      const availabilityText =
        getFieldByKeywords(row, tutorHeaderKeywords.availability);
      const availability = parseAvailability(availabilityText || "");

      // Core fields via keyword lookup
      const firstNameRaw = getFieldByKeywords(row, tutorHeaderKeywords.firstName);
      const lastNameRaw = getFieldByKeywords(row, tutorHeaderKeywords.lastName);
      const genderRaw = getFieldByKeywords(row, tutorHeaderKeywords.gender);
      const phoneRaw = getFieldByKeywords(row, tutorHeaderKeywords.phone);
      const emailRaw = getFieldByKeywords(row, tutorHeaderKeywords.email);

      const tutor: Tutor = {
        id: "",
        first_name: capitalizeWord(firstNameRaw || ""),
        last_name: capitalizeWord(lastNameRaw || ""),
        gender: normalizeGender(genderRaw || ""),
        phone: normalizePhone(phoneRaw || ""),
        email: (emailRaw || "").toLowerCase(),
        available: true,
        match: "",
        notes: "",
        preferences,
        availability,
      };

      return tutor;
    });
}
