import data from "./example.json";
import { Tutor } from "../../data_objects/Tutor";

export const exampleFetchTutors = async (): Promise<Tutor[]> => {
  return data.Tutors;
}

export const exampleFetchTutorById = async (id: string): Promise<Tutor> => {
  const tutor = data.Tutors.find((l: Tutor) => l.id === id);
  if (!tutor) {
    throw new Error(`Tutor ${id} not found`);
  }
  return tutor;
};

export const exampleUpdateTutor = async ( id: string, updated: Partial<Tutor>): Promise<Tutor> => {
  const index = data.Tutors.findIndex((l: Tutor) => l.id === id);
  if (index === -1) throw new Error("Tutor not found");
  data.Tutors[index] = { ...data.Tutors[index], ...updated };
  return structuredClone(data.Tutors[index]);
};