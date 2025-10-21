import data from "./example.json";
import { Tutor } from "../data_objects/Tutor";

export const fetchTutors = async (): Promise<Tutor[]> => {
  return data.Tutors;
};