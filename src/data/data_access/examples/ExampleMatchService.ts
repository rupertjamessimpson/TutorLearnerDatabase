import data from "./example.json";
import Match from "../../data_objects/Match";

export const exampleFetchMatches = async (): Promise<Match[]> => {
  return data.Matches;
}

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

  if (tutor) tutor.available = false;
  if (learner) learner.available = false;

  return newMatch;
};