import { getMatches } from "../DAL/matchesDAL";

export const MatchesService = {
  getAllMatches: () => {
    const matches = getMatches();
    return matches;
  }
}