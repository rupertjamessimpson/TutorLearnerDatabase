import { getLearners } from "../dal/learnersDAL";

export const LearnerService = {
  getAllLearners: () => {
    const learners = getLearners();
    return learners;
  }
}