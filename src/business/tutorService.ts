import { getTutors } from "../DAL/tutorsDAL";

export const TutorService = {
  getAllTutors: () => {
    const tutors = getTutors();
    return tutors;
  },
};