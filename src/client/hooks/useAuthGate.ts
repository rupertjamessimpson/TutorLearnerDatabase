import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export function useAuthGate() {
  const [user, setUser] = useState<User | null>(null);
  const [allowed, setAllowed] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u || !u.email) {
        setUser(null);
        setAllowed(false);
        setLoading(false);
        return;
      }

      const ref = doc(db, "AllowedUsers", u.email.toLowerCase());
      const snap = await getDoc(ref);

      setUser(u);
      setAllowed(snap.exists());
      setLoading(false);
    });

    return unsub;
  }, []);

  return { user, allowed, loading };
}
