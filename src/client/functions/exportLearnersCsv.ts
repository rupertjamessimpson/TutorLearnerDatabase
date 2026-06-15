import { Learner } from "../../data/data_objects/Learner";

import availabilityToString from "./availabilityToString";
import escapeCsv from "./escapeCsv";

const headers = [
  "First Name",
  "Last Name",
  "Gender",
  "Phone",
  "Email",
  "Level",
  "Availability",
];

const exportLearnersCsv = (learners: Learner[]) => {
  const rows = learners.map((learner) => [
    learner.first_name,
    learner.last_name,
    learner.gender,
    learner.phone,
    learner.email,
    learner.level,
    availabilityToString(learner.availability),
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => escapeCsv(String(cell))).join(",")
    )
    .join("\n");

  return csv;
};

export default exportLearnersCsv;