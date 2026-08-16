"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "@/lib/firebase";


export type UserRole =
  | "user"
  | "admin";


export interface UserProfile {
  name: string;
  email: string;
  photoURL: string | null;
  plan: string;
  role: UserRole;
}


interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}


const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async currentUser => {
        setLoading(true);
        setUser(currentUser);

        if (!currentUser) {
          setProfile(null);
          setLoading(false);
          return;
        }

        try {
          const snapshot = await getDoc(
            doc(
              db,
              "users",
              currentUser.uid,
            ),
          );

          if (snapshot.exists()) {
            const data = snapshot.data();

            setProfile({
              name: data.name ?? "",
              email: data.email ?? "",
              photoURL:
                data.photoURL ?? null,
              plan: data.plan ?? "free",
              role:
                data.role === "admin"
                  ? "admin"
                  : "user",
            });
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error(
            "Failed to load user profile:",
            error,
          );

          setProfile(null);
        } finally {
          setLoading(false);
        }
      },
    );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider",
    );
  }

  return context;
}