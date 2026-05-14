import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const auth = getAuth();

export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};