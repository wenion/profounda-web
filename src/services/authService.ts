import type { User } from "firebase/auth";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { userService } from "@/services/userService";

export class AuthService {
  async signUpWithEmail(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const credential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

    await updateProfile(
      credential.user,
      {
        displayName: name,
      },
    );

    await userService.ensureUser(
      credential.user,
    );

    return credential.user;
  }

  async signInWithEmail(
    email: string,
    password: string,
  ): Promise<User> {
    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

    await userService.ensureUser(
      credential.user,
    );

    return credential.user;
  }

  async signInWithGoogle(): Promise<User> {
    const provider =
      new GoogleAuthProvider();

    const credential =
      await signInWithPopup(
        auth,
        provider,
      );

    await userService.ensureUser(
      credential.user,
    );

    return credential.user;
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }
}

export const authService =
  new AuthService();