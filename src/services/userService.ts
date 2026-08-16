import type { User } from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export class UserService {
  async ensureUser(
    user: User,
  ): Promise<void> {
    const userRef =
      doc(db, "users", user.uid);

    const snapshot =
      await getDoc(userRef);

    if (snapshot.exists()) {
      return;
    }

    await setDoc(
      userRef,
      {
        name: user.displayName ?? "",
        email: user.email ?? "",
        photoURL: user.photoURL ?? null,
        plan: "free",
        role: "user",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
    );
  }
}

export const userService =
  new UserService();