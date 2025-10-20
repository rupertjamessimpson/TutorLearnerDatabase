import { getTutors } from "../dal/tutorsDAL";

export const TutorService = {
  getAllTutors: () => {
    const tutors = getTutors();
    return tutors;
  },
};