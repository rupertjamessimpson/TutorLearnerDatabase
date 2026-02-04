import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  limit,
  DocumentData,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { Learner } from "../data_objects/Learner";

/**
 * Firestore collection names (yours are capitalized)
 */
const LEARNERS_COL = "Learners";
const TUTORS_COL = "Tutors";
const MATCHES_COL = "Matches";

/**
 * Defaults / normalization to keep UI stable if fields are missing
 */
const DEFAULT_AVAILABILITY: Learner["availability"] = {
  monday: { start_time: "", end_time: "" },
  tuesday: { start_time: "", end_time: "" },
  wednesday: { start_time: "", end_time: "" },
  thursday: { start_time: "", end_time: "" },
  friday: { start_time: "", end_time: "" },
  saturday: { start_time: "", end_time: "" },
};

function normalizeLearner(id: string, data: DocumentData): Learner {
  return {
    id,
    first_name: data?.first_name ?? "",
    last_name: data?.last_name ?? "",
    gender: data?.gender ?? "",
    phone: data?.phone ?? "",
    email: data?.email ?? "",
    class: data?.class ?? "",
    level: data?.level ?? "",
    notes: data?.notes ?? "",
    available: data?.available ?? true,
    match: data?.match ?? "",
    availability: {
      ...DEFAULT_AVAILABILITY,
      ...(data?.availability ?? {}),
    },
  };
}

/**
 * Finds a match doc for a learner.
 * Supports both structures:
 * - match.learner.id == learnerId (embedded object style)
 * - match.learnerId == learnerId (flat id style)
 */
async function findMatchByLearnerId(learnerId: string) {
  const matchesRef = collection(db, MATCHES_COL);

  // Embedded style: learner.id
  let q = query(matchesRef, where("learner.id", "==", learnerId), limit(1));
  let snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0];

  // Flat style: learnerId
  q = query(matchesRef, where("learnerId", "==", learnerId), limit(1));
  snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0];

  return null;
}

/**
 * Returns all learners
 */
export async function fetchLearners(): Promise<Learner[]> {
  const colRef = collection(db, LEARNERS_COL);
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => normalizeLearner(d.id, d.data()));
}

/**
 * Returns the learner with the provided id
 */
export async function fetchLearnerById(id: string): Promise<Learner> {
  const ref = doc(db, LEARNERS_COL, id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error(`Learner ${id} not found`);
  return normalizeLearner(snap.id, snap.data());
}

/**
 * Creates new learner with the provided data
 * Uses Firestore auto-generated doc ID
 */
export async function createLearner(
  learnerForm: Omit<Learner, "id">
): Promise<Learner> {
  const colRef = collection(db, LEARNERS_COL);
  const docRef = await addDoc(colRef, learnerForm);

  const created = await getDoc(docRef);
  if (!created.exists()) throw new Error("Failed to create learner");

  return normalizeLearner(created.id, created.data());
}

/**
 * Updates the learner with the provided ID
 * - Updates Learners/{id}
 * - If first_name/last_name changed, updates embedded match.learner.{first_name,last_name} (if present)
 */
export async function updateLearner(
  id: string,
  updated: Partial<Learner>
): Promise<Learner> {
  // Never write id into the doc body
  const { id: _ignored, ...updatedDoc } = updated as any;

  const learnerRef = doc(db, LEARNERS_COL, id);
  await updateDoc(learnerRef, updatedDoc);

  // If name changed, update embedded match learner name fields (if present)
  if (updated.first_name || updated.last_name) {
    const matchDoc = await findMatchByLearnerId(id);

    if (matchDoc) {
      const matchData = matchDoc.data();

      // Embedded style: match.learner.first_name / match.learner.last_name
      if (matchData?.learner?.id === id) {
        const patch: any = {};
        if (updated.first_name) patch["learner.first_name"] = updated.first_name;
        if (updated.last_name) patch["learner.last_name"] = updated.last_name;

        if (Object.keys(patch).length) {
          await updateDoc(matchDoc.ref, patch);
        }
      }
      // Flat style doesn't store names → nothing to update
    }
  }

  return fetchLearnerById(id);
}

/**
 * Deletes the learner with the provided ID, any matches they are in,
 * and marks their tutor as available (mirrors your example)
 */
export async function deleteLearner(id: string): Promise<void> {
  // Delete learner doc
  const learnerRef = doc(db, LEARNERS_COL, id);
  await deleteDoc(learnerRef);

  // Find a match (if any)
  const matchDoc = await findMatchByLearnerId(id);
  if (!matchDoc) return;

  const matchData = matchDoc.data();

  // Determine tutor id (supports embedded or flat)
  const tutorId: string | undefined = matchData?.tutor?.id ?? matchData?.tutorId;

  // Free tutor
  if (tutorId) {
    const tutorRef = doc(db, TUTORS_COL, tutorId);
    await updateDoc(tutorRef, {
      available: true,
      match: "",
    } as any);
  }

  // Delete match doc
  await deleteDoc(matchDoc.ref);
}

/**
 * Adds the learner with the provided ID to the provided class
 */
export async function addLearnerToClass(
  learnerId: string,
  classId: string
): Promise<Learner> {
  const learnerRef = doc(db, LEARNERS_COL, learnerId);
  await updateDoc(learnerRef, { class: classId } as any);
  return fetchLearnerById(learnerId);
}

/**
 * Removes the learner with the provided ID from class
 */
export async function removeLearnerFromClass(
  learnerId: string
): Promise<Learner> {
  const learnerRef = doc(db, LEARNERS_COL, learnerId);
  await updateDoc(learnerRef, { class: "" } as any);
  return fetchLearnerById(learnerId);
}

/**
 * Creates a batch of learners from the provided data
 * Uses Firestore auto-generated IDs
 */
export async function batchCreateLearners(
  batchLearners: Array<Omit<Learner, "id">>
): Promise<Learner[]> {
  const learnersColRef = collection(db, LEARNERS_COL);
  const batch = writeBatch(db);

  const refs = batchLearners.map(() => doc(learnersColRef)); // auto-id refs
  refs.forEach((ref, i) => batch.set(ref, batchLearners[i]));

  await batch.commit();

  const created = await Promise.all(refs.map((ref) => getDoc(ref)));
  return created
    .filter((s) => s.exists())
    .map((s) => normalizeLearner(s.id, s.data()!));
}
