import { collection, getDocs, QueryDocumentSnapshot, FirestoreDataConverter } from "firebase/firestore/lite";
import { db } from "../../firebase";
import Match from "../data_objects/Match";

const matchConverter: FirestoreDataConverter<Match> = {
  toFirestore(match: Match) {
    const { id, ...data } = match;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Match {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
    } as Match;
  },
};

export const fetchMatches = async (): Promise<Match[]> => {
  const matchesRef = collection(db, "Matches").withConverter(matchConverter);
  const querySnapshot = await getDocs(matchesRef);
  return querySnapshot.docs.map((doc) => doc.data());
};
