import { getLearners } from "../DAL/learnersDAL";

export const LearnerService = {
  getAllLearners: () => {
    const learners = getLearners();
    return learners;
  }
}