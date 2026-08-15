import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const subscriptionService = {
  async isSubscribed(
    uid: string,
  ): Promise<boolean> {
    const snapshot = await getDoc(
      doc(
        db,
        "signalSubscriptions",
        uid,
      ),
    );

    if (!snapshot.exists()) {
      return false;
    }

    return snapshot.data().status === "active";
  },

  async subscribe(
    uid: string,
    email: string,
  ): Promise<void> {
    await setDoc(
      doc(
        db,
        "signalSubscriptions",
        uid,
      ),
      {
        email,
        status: "active",
        subscribedAt: serverTimestamp(),
        unsubscribedAt: null,
      },
      {
        merge: true,
      },
    );
  },

  async unsubscribe(
    uid: string,
  ): Promise<void> {
    await updateDoc(
      doc(
        db,
        "signalSubscriptions",
        uid,
      ),
      {
        status: "inactive",
        unsubscribedAt: serverTimestamp(),
      },
    );
  },
};