import data from "./example.json";
import Match from "../data_objects/Match";

export const fetchMatches = async (): Promise<Match[]> => {
  return data.Matches;
}
