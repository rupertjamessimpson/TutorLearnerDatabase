import Papa from "papaparse";

import { Learner, DayAvailability } from "../../data/data_objects/Learner";

///// Keywords

const headerKeywords = {
  firstName: "first name",
  lastName: "last name",
  phone: "phone",
  email: "email",
  gender: "gender",
  level: "best describes",

  mondayAvailability: "monday availability",
  tuesdayAvailability: "tuesday availability",
  wednesdayAvailability: "wednesday availability",
  thursdayAvailability: "thursday availability",
  fridayAvailability: "friday availability",
  saturdayAvailability: "saturday availability",

  notes: "citizenship test",
  conversationGroup: "conversation group",
};

const levelKeywords = {
  esl_novice: ["do not speak", "no english"],
  esl_beginner: ["a little english", "little english"],
  esl_intermediate: ["practice", "improve", "some english"],
};

const availabilityKeywords = {
  morning: {
    keyword: "morning",
    start_time: "10:00AM",
    end_time: "1:00PM",
  },
  afternoon: {
    keyword: "afternoon",
    start_time: "1:00PM",
    end_time: "3:00PM",
  },
  late: {
    keyword: "late",
    start_time: "3:00PM",
    end_time: "6:00PM",
  },
  night: {
    keyword: "night",
    start_time: "6:00PM",
    end_time: "8:30PM",
  },
};

///// Parsers

function parseLevel(value: string): string {
  const normalized = value.toLowerCase();

  for (const [level, keywords] of Object.entries(levelKeywords)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return level;
    }
  }

  return "";
}

function parseDayAvailability(value: string): DayAvailability {
  const normalized = value.toLowerCase();

  const matches = Object.values(availabilityKeywords).filter((band) =>
    normalized.includes(band.keyword)
  );

  if (matches.length === 0) {
    return {
      start_time: "",
      end_time: "",
    };
  }

  return {
    start_time: matches[0].start_time,
    end_time: matches[matches.length - 1].end_time,
  };
}

export function parseLearnerFromCSV(text: string): Learner[] {
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  console.log("Parsed rows:", result.data);
  console.log("CSV headers:", result.meta.fields);

  return result.data.map((row) => {
    const find = (keyword: string): string =>
      Object.entries(row).find(([header]) =>
        header.toLowerCase().includes(keyword.toLowerCase())
      )?.[1]?.trim() ?? "";

    const learner: Learner = {
      id: "",
      order: 0,
      first_name: find(headerKeywords.firstName),
      last_name: find(headerKeywords.lastName),
      gender: find(headerKeywords.gender),
      phone: find(headerKeywords.phone),
      email: find(headerKeywords.email),
      available: true,
      match: "",
      notes: find(headerKeywords.notes)
      .toLowerCase()
      .includes("yes")
        ? "Preparing for citizenship test."
        : "",
      level: parseLevel(find(headerKeywords.level)),
      class: "",
      availability: {
        monday: parseDayAvailability(
          find(headerKeywords.mondayAvailability)
        ),
        tuesday: parseDayAvailability(
          find(headerKeywords.tuesdayAvailability)
        ),
        wednesday: parseDayAvailability(
          find(headerKeywords.wednesdayAvailability)
        ),
        thursday: parseDayAvailability(
          find(headerKeywords.thursdayAvailability)
        ),
        friday: parseDayAvailability(
          find(headerKeywords.fridayAvailability)
        ),
        saturday: parseDayAvailability(
          find(headerKeywords.saturdayAvailability)
        ),
      },
    };

    return learner;
  });
}