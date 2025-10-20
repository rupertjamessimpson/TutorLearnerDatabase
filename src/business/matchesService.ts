import { getMatches } from "../dal/matchesDAL";

export const MatchesService = {
  getAllMatches: () => {
    const matches = getMatches();
    return matches;
  }
}