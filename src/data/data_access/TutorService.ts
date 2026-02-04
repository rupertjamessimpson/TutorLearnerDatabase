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
import { Tutor } from "../data_objects/Tutor";

/**
 * Firestore collection names (yours are capitalized)
 */
const TUTORS_COL = "Tutors";
const LEARNERS_COL = "Learners";
const MATCHES_COL = "Matches";

/**
 * Helpers / Defaults (keeps UI stable if fields are missing)
 */
const DEFAULT_PREFERENCES: Tutor["preferences"] = {
  conversation: false,
  esl_novice: false,
  esl_beginner: false,
  esl_intermediate: false,
  citizenship: false,
  sped_ela: false,
  basic_math: false,
  hiset_math: false,
  basic_reading: false,
  hiset_reading: false,
  basic_writing: false,
  hiset_writing: false,
};

const DEFAULT_AVAILABILITY: Tutor["availability"] = {
  monday: { start_time: "", end_time: "" },
  tuesday: { start_time: "", end_time: "" },
  wednesday: { start_time: "", end_time: "" },
  thursday: { start_time: "", end_time: "" },
  friday: { start_time: "", end_time: "" },
  saturday: { start_time: "", end_time: "" },
};

function normalizeTutor(id: string, data: DocumentData): Tutor {
  return {
    id,
    first_name: data?.first_name ?? "",
    last_name: data?.last_name ?? "",
    gender: data?.gender ?? "",
    phone: data?.phone ?? "",
    email: data?.email ?? "",
    available: data?.available ?? true,
    match: data?.match ?? "",
    notes: data?.notes ?? "",
    preferences: {
      ...DEFAULT_PREFERENCES,
      ...(data?.preferences ?? {}),
    },
    availability: {
      ...DEFAULT_AVAILABILITY,
      ...(data?.availability ?? {}),
    },
  };
}

/**
 * Finds a match doc for a tutor.
 * Supports both structures:
 * - match.tutor.id == tutorId (embedded object style)
 * - match.tutorId == tutorId (flat id style)
 */
async function findMatchByTutorId(tutorId: string) {
  const matchesRef = collection(db, MATCHES_COL);

  // Try embedded style first: tutor.id
  let q = query(matchesRef, where("tutor.id", "==", tutorId), limit(1));
  let snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0];

  // Try flat style: tutorId
  q = query(matchesRef, where("tutorId", "==", tutorId), limit(1));
  snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0];

  return null;
}

/**
 * Returns all Tutors
 */
export async function fetchTutors(): Promise<Tutor[]> {
  const colRef = collection(db, TUTORS_COL);
  const snap = await getDocs(colRef);

  return snap.docs.map((d) => normalizeTutor(d.id, d.data()));
}

/**
 * Returns the Tutor with the provided ID
 */
export async function fetchTutorById(id: string): Promise<Tutor> {
  const ref = doc(db, TUTORS_COL, id);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error(`Tutor ${id} not found`);
  return normalizeTutor(snap.id, snap.data());
}

/**
 * Creates new tutor with the provided data
 * - Uses auto-generated Firestore doc ID (recommended)
 * - Returns Tutor including id
 */
export async function createTutor(tutorForm: Omit<Tutor, "id">): Promise<Tutor> {
  const colRef = collection(db, TUTORS_COL);
  const docRef = await addDoc(colRef, tutorForm);

  const created = await getDoc(docRef);
  if (!created.exists()) throw new Error("Failed to create tutor");

  return normalizeTutor(created.id, created.data());
}

/**
 * Updates the tutor with the provided ID and any of their matches
 * - Updates Tutors/{id}
 * - If first_name/last_name changed, also updates embedded match.tutor.{first_name,last_name} if your Matches store embedded tutor objects.
 */
export async function updateTutor(
  id: string,
  updated: Partial<Tutor>
): Promise<Tutor> {
  // Never write id into the doc body
  const { id: _ignored, ...updatedDoc } = updated as any;

  const tutorRef = doc(db, TUTORS_COL, id);
  await updateDoc(tutorRef, updatedDoc);

  // If name changed, update any embedded match.tutor name fields (if present)
  if (updated.first_name || updated.last_name) {
    const matchDoc = await findMatchByTutorId(id);

    if (matchDoc) {
      const matchData = matchDoc.data();

      // Embedded style: match.tutor.first_name / match.tutor.last_name
      if (matchData?.tutor?.id === id) {
        const patch: any = {};
        if (updated.first_name) patch["tutor.first_name"] = updated.first_name;
        if (updated.last_name) patch["tutor.last_name"] = updated.last_name;
        if (Object.keys(patch).length) {
          await updateDoc(matchDoc.ref, patch);
        }
      }

      // Flat style doesn't store names, so nothing to update
    }
  }

  return fetchTutorById(id);
}

/**
 * Deletes the tutor with the provided ID
 * Mirrors your example behavior:
 * - Delete Tutors/{id}
 * - If they had a match:
 *    - set matched learner available=true (and optionally clear match field if you use it)
 *    - delete the match doc
 */
export async function deleteTutor(id: string): Promise<void> {
  // Delete tutor doc
  const tutorRef = doc(db, TUTORS_COL, id);
  await deleteDoc(tutorRef);

  // If there is no match, done
  const matchDoc = await findMatchByTutorId(id);
  if (!matchDoc) return;

  const matchData = matchDoc.data();

  // Determine learner id (supports embedded or flat)
  const learnerId: string | undefined =
    matchData?.learner?.id ?? matchData?.learnerId;

  // Free learner
  if (learnerId) {
    const learnerRef = doc(db, LEARNERS_COL, learnerId);
    // Set available=true and clear match if you use match string
    await updateDoc(learnerRef, {
      available: true,
      match: "",
    } as any);
  }

  // Delete match doc
  await deleteDoc(matchDoc.ref);
}

/**
 * Creates a batch of tutors from the provided data
 * - Uses auto-generated IDs (recommended)
 * - Returns created tutors with ids
 */
export async function batchCreateTutors(
  batchTutors: Array<Omit<Tutor, "id">>
): Promise<Tutor[]> {
  const tutorsColRef = collection(db, TUTORS_COL);
  const batch = writeBatch(db);

  const refs = batchTutors.map(() => doc(tutorsColRef)); // auto-id refs
  refs.forEach((ref, i) => batch.set(ref, batchTutors[i]));

  await batch.commit();

  // Read back created docs so caller gets IDs + normalized shape
  const created = await Promise.all(refs.map((ref) => getDoc(ref)));
  return created
    .filter((s) => s.exists())
    .map((s) => normalizeTutor(s.id, s.data()!));
}
