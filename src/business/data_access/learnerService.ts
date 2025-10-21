import data from "./example.json";
import { Learner } from "../data_objects/Learner";

export const fetchLearners = async (): Promise<Learner[]> => {
  return data.Learners;
}
