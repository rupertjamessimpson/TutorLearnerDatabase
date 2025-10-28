import { collection, doc, getDoc, getDocs, QueryDocumentSnapshot, FirestoreDataConverter } from "firebase/firestore/lite";
import { db } from "../../firebase";
import { Learner } from "../data_objects/Learner";

const learnerConverter: FirestoreDataConverter<Learner> = {
  toFirestore(learner: Learner) {
    const { id, ...data } = learner;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Learner {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
    } as Learner;
  },
};

export const fetchLearners = async (): Promise<Learner[]> => {
  const learnersRef = collection(db, "Learners").withConverter(learnerConverter);
  const querySnapshot = await getDocs(learnersRef);
  return querySnapshot.docs.map((doc) => doc.data());
};

export const fetchLearnerById = async (id: string): Promise<Learner | null> => {
  try {
    const docRef = doc(db, "Learners", id).withConverter(learnerConverter);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    return docSnap.data();
  } catch (error) {
    console.error("Error fetching learner by ID:", error);
    throw error;
  }
};