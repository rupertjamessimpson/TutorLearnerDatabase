import data from "./example.json";
import Match from "../../data_objects/Match";

// Returns all matches
export const exampleFetchMatches = async (): Promise<Match[]> => {
  return data.Matches;
}

// Creates a new match
export const exampleCreateMatch = async (
  tutor_id: string,
  tutor_first_name: string,
  tutor_last_name: string,
  learner_id: string,
  learner_first_name: string,
  learner_last_name: string,
): Promise<Match> => {
  const newMatch: Match = {
    id: (data.Matches.length + 1).toString(),
    tutor: {
      id: tutor_id,
      first_name: tutor_first_name,
      last_name: tutor_last_name
    },
    learner: {
      id: learner_id,
      first_name: learner_first_name,
      last_name: learner_last_name,
    },
  };

  data.Matches.push(newMatch);

  const tutor = data.Tutors.find((t) => t.id === tutor_id);
  const learner = data.Learners.find((l) => l.id === learner_id);

  if (tutor) tutor.match = learner_first_name + " " + learner_last_name;
  if (learner) learner.match = tutor_first_name + " " + tutor_last_name;

  return newMatch;
};

// Deletes the match with the provided ID
export const exampleDeleteMatch = async (id: string): Promise<void> => {
  const index = data.Matches.findIndex((m) => m.id === id);
  if (index === -1) throw new Error(`Match ${id} not found`);

  const match = data.Matches[index];

  const tutor = data.Tutors.find((t) => t.id === match.tutor.id);
  const learner = data.Learners.find((l) => l.id === match.learner.id);

  if (tutor) tutor.match = "";
  if (learner) learner.match = "";

  data.Matches.splice(index, 1);
}