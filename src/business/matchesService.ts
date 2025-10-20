import { getMatches } from "../dal/matches";

export const MatchesService = {
  getAllMatches: () => {
    const matches = getMatches();
    return matches;
  }
}