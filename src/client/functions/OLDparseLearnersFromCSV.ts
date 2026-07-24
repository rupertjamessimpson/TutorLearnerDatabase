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

const learnerHeaderKeywords = {
  firstName: ["first name"],
  lastName: ["last name"],
  gender: ["gender"],
  phone: ["phone"],
  email: ["email"],
  help: [ ///////////
    "help",
    "what would you like help with",
    "level",
  ],
  availability: [
    "availability",
    "available",
    "when are you available",
  ],
} as const;

function getFieldByKeywords(
  row: Record<string, string>,
  keywords: readonly string[]
): string {
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

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function normalizeGender(gender: string): string {
  const g = gender.toLowerCase();
  if (g.startsWith("m")) return "male";
  if (g.startsWith("f")) return "female";
  if (g.includes("non")) return "non-binary";
  return gender;
}

function capitalizeWord(word: string): string {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function splitCSVLine(line: string): string[] {
  return line
    .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
    .map((v) => v.replace(/^"|"$/g, "").trim());
}

const timeBands: Record<TimeBandName, { start: number; end: number }> = {
  morning: { start: 10 * 60, end: 13 * 60 }, ////////
  afternoon: { start: 13 * 60, end: 18 * 60 }, //////////
  evening: { start: 18 * 60, end: 20 * 60 }, //////////
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
      ["morning", "afternoon", "evening"] as TimeBandName[] ////////////
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

const helpToLevelMap: Record<string, string> = {
  "learning english": "esl_novice", //////////
  "practicing english": "esl_beginner", ///////////
  "mastering english": "esl_intermediate", ///////////
  "citizenship": "citizenship", ////////////
  "special needs": "sped_ela",
  "basic math": "basic_math",
  "math hiset": "hiset_math",
  "basic reading": "basic_reading",
  "reading hiset": "hiset_reading",
  "basic writing": "basic_writing",
  "writing hiset": "hiset_writing",

  "esl_novice": "esl_novice",
  "esl_beginner": "esl_beginner",
  "esl_intermediate": "esl_intermediate",
  "sped_ela": "sped_ela",
  "hiset_math": "hiset_math",
  "basic_reading": "basic_reading",
  "hiset_reading": "hiset_reading",
  "basic_writing": "basic_writing",
  "hiset_writing": "hiset_writing",
};

function parseLevel(row: Record<string, string>): string {
  const rawHelp =
    (getFieldByKeywords(row, learnerHeaderKeywords.help) || "").toLowerCase();

  if (!rawHelp) return "";

  for (const [keyword, level] of Object.entries(helpToLevelMap)) {
    if (rawHelp.includes(keyword)) {
      return level;
    }
  }

  return rawHelp;
}

export function OLDparseLearnerFromCSV(text: string): Learner[] {
  const [headerLine, ...rows] = text.trim().split(/\r?\n/);
  const headerValues = splitCSVLine(headerLine).map((h) =>
    h.trim().toLowerCase()
  );

  return rows
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const values = splitCSVLine(line);

      const row: Record<string, string> = {};
      headerValues.forEach((header, i) => {
        row[header] = (values[i] ?? "").toString();
      });

      const availabilityText = getFieldByKeywords(
        row,
        learnerHeaderKeywords.availability
      );
      const availability = parseAvailability(availabilityText || "");

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
        id: "",
        order: 0,
        first_name: capitalizeWord(firstNameRaw || ""),
        last_name: capitalizeWord(lastNameRaw || ""),
        gender: normalizeGender(genderRaw || ""),
        phone: normalizePhone(phoneRaw || ""),
        email: (emailRaw || "").toLowerCase(),
        available: true,
        match: "",
        notes: "",
        level: levelRaw, // normalized level string
        class: "",
        availability,
      };

      return learner;
    });
}
