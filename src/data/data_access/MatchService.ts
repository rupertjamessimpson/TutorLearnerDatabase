import {
  collection,
  getDocs,
  doc,
  runTransaction,
  query,
  where,
  limit,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";
import Match from "../data_objects/Match";

const TUTORS_COL = "Tutors";
const LEARNERS_COL = "Learners";
const MATCHES_COL = "Matches";

/**
 * Returns all matches
 */
export async function fetchMatches(): Promise<Match[]> {
  const snap = await getDocs(collection(db, MATCHES_COL));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Match, "id">),
  }));
}

/**
 * Create a new match and update the corresponding Tutor + Learner "match" fields.
 * Uses a transaction for consistency.
 *
 * Mirrors your example:
 * - Creates Matches doc with embedded tutor/learner objects
 * - Sets tutor.match = "Learner First Learner Last"
 * - Sets learner.match = "Tutor First Tutor Last"
 */
export async function createMatch(
  tutor_id: string,
  tutor_first_name: string,
  tutor_last_name: string,
  learner_id: string,
  learner_first_name: string,
  learner_last_name: string
): Promise<Match> {
  const tutorRef = doc(db, TUTORS_COL, tutor_id);
  const learnerRef = doc(db, LEARNERS_COL, learner_id);
  const matchesRef = collection(db, MATCHES_COL);

  const tutorFullName = `${tutor_first_name} ${tutor_last_name}`.trim();
  const learnerFullName = `${learner_first_name} ${learner_last_name}`.trim();

  const createdMatch = await runTransaction(db, async (tx) => {
    // Ensure tutor + learner exist
    const tutorSnap = await tx.get(tutorRef);
    if (!tutorSnap.exists()) throw new Error(`Tutor ${tutor_id} not found`);

    const learnerSnap = await tx.get(learnerRef);
    if (!learnerSnap.exists()) throw new Error(`Learner ${learner_id} not found`);

    // (Optional safety) Prevent double-matching:
    // If you want to allow overwriting matches, remove these checks.
    const tutorMatch = (tutorSnap.data() as any)?.match ?? "";
    const learnerMatch = (learnerSnap.data() as any)?.match ?? "";

    if (tutorMatch) throw new Error(`Tutor ${tutor_id} is already matched`);
    if (learnerMatch) throw new Error(`Learner ${learner_id} is already matched`);

    // Create match doc (auto-id)
    const matchDocRef = doc(matchesRef);

    const matchBody: Omit<Match, "id"> = {
      tutor: {
        id: tutor_id,
        first_name: tutor_first_name,
        last_name: tutor_last_name,
      },
      learner: {
        id: learner_id,
        first_name: learner_first_name,
        last_name: learner_last_name,
      },
    };

    tx.set(matchDocRef, matchBody);

    // Update tutor + learner
    tx.update(tutorRef, {
      match: learnerFullName,
      available: false, // optional but usually desired
    } as any);

    tx.update(learnerRef, {
      match: tutorFullName,
      available: false, // optional but usually desired
    } as any);

    return { id: matchDocRef.id, ...matchBody };
  });

  return createdMatch;
}

/**
 * Deletes the match with the provided ID and clears Tutor/Learner match fields.
 * Uses a transaction to keep things consistent.
 *
 * Mirrors your example:
 * - tutor.match = ""
 * - learner.match = ""
 * - delete match doc
 */
export async function deleteMatch(id: string): Promise<void> {
  const matchRef = doc(db, MATCHES_COL, id);

  await runTransaction(db, async (tx) => {
    const matchSnap = await tx.get(matchRef);
    if (!matchSnap.exists()) throw new Error(`Match ${id} not found`);

    const match = matchSnap.data() as any;

    const tutorId: string | undefined = match?.tutor?.id ?? match?.tutorId;
    const learnerId: string | undefined = match?.learner?.id ?? match?.learnerId;

    if (tutorId) {
      const tutorRef = doc(db, TUTORS_COL, tutorId);
      // Clear match and mark available again
      tx.update(tutorRef, { match: "", available: true } as any);
    }

    if (learnerId) {
      const learnerRef = doc(db, LEARNERS_COL, learnerId);
      tx.update(learnerRef, { match: "", available: true } as any);
    }

    tx.delete(matchRef);
  });
}

/**
 * Convenience: delete match by tutorId (handy for "Unmatch" buttons when you don't know matchId)
 */
export async function deleteMatchByTutorId(tutorId: string): Promise<void> {
  const matchesRef = collection(db, MATCHES_COL);

  // embedded style
  let q = query(matchesRef, where("tutor.id", "==", tutorId), limit(1));
  let snap = await getDocs(q);

  // fallback flat style
  if (snap.empty) {
    q = query(matchesRef, where("tutorId", "==", tutorId), limit(1));
    snap = await getDocs(q);
  }

  if (snap.empty) return;

  await deleteMatch(snap.docs[0].id);
}

/**
 * Convenience: delete match by learnerId
 */
export async function deleteMatchByLearnerId(learnerId: string): Promise<void> {
  const matchesRef = collection(db, MATCHES_COL);

  // embedded style
  let q = query(matchesRef, where("learner.id", "==", learnerId), limit(1));
  let snap = await getDocs(q);

  // fallback flat style
  if (snap.empty) {
    q = query(matchesRef, where("learnerId", "==", learnerId), limit(1));
    snap = await getDocs(q);
  }

  if (snap.empty) return;

  await deleteMatch(snap.docs[0].id);
}
