import data from "./example.json";
import { Learner } from "../../data_objects/Learner";

export const exampleFetchLearners = async (): Promise<Learner[]> => {
  return data.Learners;
}

export const exampleFetchLearnerById = async (id: string): Promise<Learner> => {
  const learner = data.Learners.find((l: Learner) => l.id === id);
  if (!learner) {
    throw new Error(`Learner ${id} not found`);
  }
  return learner;
};

export const exampleUpdateLearner = async ( id: string, updated: Partial<Learner>): Promise<Learner> => {
  const index = data.Learners.findIndex((l: Learner) => l.id === id);
  if (index === -1) throw new Error("Learner not found");
  data.Learners[index] = { ...data.Learners[index], ...updated };
  return structuredClone(data.Learners[index]);
};