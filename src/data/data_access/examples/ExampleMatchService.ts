import data from "./example.json";
import Match from "../../data_objects/Match";

export const exampleFetchMatches = async (): Promise<Match[]> => {
  return data.Matches;
}
