import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../../firebase/firebase";
import { db } from "../../firebase/firebase";

export async function loginWithGoogleAllowlist() {
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  if (!user.email) {
    await signOut(auth);
    throw new Error("No email associated with this account.");
  }

  // 🔍 Check allowlist BEFORE app renders anything
  const allowRef = doc(db, "AllowedUsers", user.email);
  const allowSnap = await getDoc(allowRef);

  if (!allowSnap.exists()) {
    await signOut(auth);
    throw new Error(
      "You are not authorized to access this system. Please contact the administrator."
    );
  }

  // ✅ allowed → just return
  return user;
}
