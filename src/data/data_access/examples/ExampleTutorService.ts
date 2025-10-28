import data from "./example.json";
import { Tutor } from "../../data_objects/Tutor";

export const exampleFetchTutors = async (): Promise<Tutor[]> => {
  return data.Tutors;
};