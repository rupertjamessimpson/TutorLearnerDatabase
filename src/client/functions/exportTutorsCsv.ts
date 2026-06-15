import { Tutor } from "../../data/data_objects/Tutor";

import availabilityToString from "./availabilityToString";
import escapeCsv from "./escapeCsv";
import preferencesToString from "./preferencesToString";

const headers = [
  "First Name",
  "Last Name",
  "Gender",
  "Phone",
  "Email",
  "Teach Conversation",
  "Preferences",
  "Availability",
];

const exportTutorsCsv = (tutors: Tutor[]) => {
  const rows = tutors.map((tutor) => [
    tutor.first_name,
    tutor.last_name,
    tutor.gender,
    tutor.phone,
    tutor.email,
    tutor.preferences.conversation ? "Yes" : "No",
    preferencesToString(tutor),
    availabilityToString(tutor.availability),
  ]);

  const csv = [headers, ...rows]
  .map((row) =>
    row.map((cell) => escapeCsv(String(cell))).join(",")
  )
  .join("\n");

  return csv;
}

export default exportTutorsCsv;