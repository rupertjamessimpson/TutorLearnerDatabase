// src/components/auth/RequireAuth.tsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth, db } from "../../../firebase/firebase";
import { Navigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

type RequireAuthProps = {
  children: React.ReactElement;
};

export default function RequireAuth({ children }: RequireAuthProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setDenied(false);

      if (!u || !u.email) {
        setUser(null);
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const email = u.email.toLowerCase();
        const allowRef = doc(db, "AllowedUsers", email);
        const allowSnap = await getDoc(allowRef);

        if (!allowSnap.exists()) {
          setDenied(true);
          await signOut(auth); // kick them back out
          setUser(null);
          setAllowed(false);
          setLoading(false);
          return;
        }

        setUser(u);
        setAllowed(true);
        setLoading(false);
      } catch (err) {
        // If rules prevent reading AllowedUsers, treat as denied
        setDenied(true);
        await signOut(auth);
        setUser(null);
        setAllowed(false);
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;

  if (!user || !allowed) {
    // optional message could be passed via location.state
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          denied: denied ? "You are not authorized. Contact the administrator." : "",
        }}
      />
    );
  }

  return children;
}
