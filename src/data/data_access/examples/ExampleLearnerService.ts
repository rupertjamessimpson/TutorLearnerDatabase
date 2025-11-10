import data from "./example.json";
import { Learner } from "../../data_objects/Learner";

// Returns all learners
export const exampleFetchLearners = async (): Promise<Learner[]> => {
  return data.Learners;
}

// Returns the learner with the provided id
export const exampleFetchLearnerById = async (id: string): Promise<Learner> => {
  const learner = data.Learners.find((l: Learner) => l.id === id);
  if (!learner) {
    throw new Error(`Learner ${id} not found`);
  }
  return learner;
};

// Creates new tutor with the provided data
export const exampleCreateLearner = async (learnerForm: Omit<Learner, "id">): Promise<Learner> => {
  const newId = (data.Learners.length + 1).toString();

  const newLearner: Learner = {
    id: newId,
    ...learnerForm
  }

  data.Learners.push(newLearner);
  return structuredClone(newLearner);
}

// Updates the learner with the provided ID
export const exampleUpdateLearner = async ( id: string, updated: Partial<Learner>): Promise<Learner> => {
  const index = data.Learners.findIndex((l: Learner) => l.id === id);
  if (index === -1) throw new Error("Learner not found");

  data.Learners[index] = { ...data.Learners[index], ...updated };
  const updateLearner = (data.Learners[index]);

  if (updated.first_name || updated.last_name) {
    const match = data.Matches.find((m) => m.learner.id === id);
    if (match) {
      if (updated.first_name) match.learner.first_name = updateLearner.first_name;
      if (updated.last_name)  match.learner.last_name  = updateLearner.last_name;
    }
  }

  return updateLearner;
};

// Deletes the learner with the provided ID, any matches they are in,
// and marks their tutor as available
export const exampleDeleteLearner = async (id: string): Promise<void> => {
  const index = data.Learners.findIndex((t: Learner) => t.id === id);
  if (index === -1) throw new Error (`Learner ${id} not found`);
  data.Learners.splice(index, 1);

  const match = data.Matches.find((m) => m.learner.id === id);
  if (!match) return;

  const tutor = data.Tutors.find((t) => t.id === match.tutor.id);
  if (tutor) tutor.available = true;

  const matchIndex = data.Matches.findIndex((m) => m.id === match.id);
  if (matchIndex !== -1) data.Matches.splice(matchIndex, 1);
};

// Adds the learner with the provided ID to the provided class
export const exampleAddLearnerToClass = async (learnerId: string, classId: string): Promise<Learner> => {
  const index = data.Learners.findIndex((l: Learner) => l.id === learnerId);
  if (index === -1) throw new Error (`Learner ${learnerId} not found`);

  data.Learners[index].class = classId;
  return structuredClone(data.Learners[index]);
}

// Removes the learner with the provided ID from class
export const exampleRemoveLearnerFromClass = async (learnerId: string): Promise<Learner> => {
  const index = data.Learners.findIndex((l: Learner) => l.id === learnerId);

  data.Learners[index].class = "";
  return structuredClone(data.Learners[index]);
}