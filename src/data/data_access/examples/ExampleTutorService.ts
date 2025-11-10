import data from "./example.json";
import { Tutor } from "../../data_objects/Tutor";

// Returns all Tutors
export const exampleFetchTutors = async (): Promise<Tutor[]> => {
  return data.Tutors;
}

// Returns the Tutor with the provided ID
export const exampleFetchTutorById = async (id: string): Promise<Tutor> => {
  const tutor = data.Tutors.find((l: Tutor) => l.id === id);
  if (!tutor) {
    throw new Error(`Tutor ${id} not found`);
  }
  return tutor;
}

// Creates new tutor with the provided data
export const exampleCreateTutor = async (tutorForm: Omit<Tutor, "id">): Promise<Tutor> => {
  const newId = (data.Tutors.length + 1).toString();

  const newTutor: Tutor = {
    id: newId,
    ...tutorForm
  }

  data.Tutors.push(newTutor);
  return structuredClone(newTutor);
}

// Updates the tutor with the provided ID and any of their matches
export const exampleUpdateTutor = async (id: string, updated: Partial<Tutor>): Promise<Tutor> => {
  const index = data.Tutors.findIndex((t: Tutor) => t.id === id);
  if (index === -1) throw new Error("Tutor not found");

  data.Tutors[index] = { ...data.Tutors[index], ...updated };
  const updatedTutor = structuredClone(data.Tutors[index]);

  if (updated.first_name || updated.last_name) {
    const match = data.Matches.find((m) => m.tutor.id === id);
    if (match) {
      if (updated.first_name) match.tutor.first_name = updatedTutor.first_name;
      if (updated.last_name)  match.tutor.last_name  = updatedTutor.last_name;
    }
  }

  return updatedTutor;
};


// Deletes the tutor with the provided ID
export const exampleDeleteTutor = async (id: string): Promise<void> => {
  const index = data.Tutors.findIndex((t: Tutor) => t.id === id);
  if (index === -1) throw new Error (`Tutor ${id} not found`);
  data.Tutors.splice(index, 1);

  const match = data.Matches.find((m) => m.tutor.id === id);
  if (!match) return;

  const learner = data.Learners.find((t) => t.id === match.learner.id);
  if (learner) learner.available = true;

  const matchIndex = data.Matches.findIndex((m) => m.id === match.id);
  if (matchIndex !== -1) data.Matches.splice(matchIndex, 1);
}