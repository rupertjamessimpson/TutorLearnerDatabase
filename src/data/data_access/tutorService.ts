import { collection, doc, getDoc, getDocs, QueryDocumentSnapshot, FirestoreDataConverter, } from "firebase/firestore/lite";
import { db } from "../../firebase";

import { Tutor } from "../data_objects/Tutor";

const tutorConverter: FirestoreDataConverter<Tutor> = {
  toFirestore(tutor: Tutor) {
    const { id, ...data } = tutor;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Tutor {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
    } as Tutor;
  },
};

export const fetchTutors = async (): Promise<Tutor[]> => {
  const tutorsRef = collection(db, "Tutors").withConverter(tutorConverter);
  const querySnapshot = await getDocs(tutorsRef);
  return querySnapshot.docs.map((doc) => doc.data());
};

export const fetchTutorById = async (id: string): Promise<Tutor | null> => {
  try {
    const docRef = doc(db, "Tutors", id).withConverter(tutorConverter);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return null;
    return docSnap.data();
  } catch (error) {
    console.error("Error fetching tutor by ID:", error);
    throw error;
  }
};
