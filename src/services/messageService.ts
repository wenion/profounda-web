import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type {
  Message,
  MessageDocument,
  MessageThread,
  MessageThreadDocument,
} from "@/types/message";


const THREADS_COLLECTION = "messageThreads";
const MESSAGES_COLLECTION = "messages";


export const messageService = {
  async createThread(
    userId: string,
    userEmail: string,
    subject?: string,
  ): Promise<string> {
    const threadRef = doc(
      collection(db, THREADS_COLLECTION),
    );

    await setDoc(threadRef, {
      userId,
      userEmail,
      subject,

      status: "open",

      unreadByUser: 0,
      unreadByAdmin: 0,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp(),
    });

    return threadRef.id;
  },


  async sendMessage(
    threadId: string,
    senderId: string,
    senderRole: "user" | "admin",
    content: string,
  ): Promise<string> {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      throw new Error("Message cannot be empty.");
    }

    const threadRef = doc(
      db,
      THREADS_COLLECTION,
      threadId,
    );

    const messageRef = doc(
      collection(
        threadRef,
        MESSAGES_COLLECTION,
      ),
    );

    const batch = writeBatch(db);

    batch.set(messageRef, {
      senderId,
      senderRole,
      content: trimmedContent,

      // Reserved for future upload support.
      attachments: [],

      createdAt: serverTimestamp(),
    });

    if (senderRole === "user") {
      batch.update(threadRef, {
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        unreadByAdmin: increment(1),
      });
    } else {
      batch.update(threadRef, {
        updatedAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        unreadByUser: increment(1),
      });
    }

    await batch.commit();

    return messageRef.id;
  },


  async getUserThreads(
    userId: string,
  ): Promise<MessageThread[]> {
    const threadsRef = collection(
      db,
      THREADS_COLLECTION,
    );

    const threadsQuery = query(
      threadsRef,
      where("userId", "==", userId),
      orderBy("lastMessageAt", "desc"),
    );

    const snapshot =
      await getDocs(threadsQuery);

    return snapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...(
        snapshot.data() as MessageThreadDocument
      ),
    }));
  },


  async getMessages(
    threadId: string,
  ): Promise<Message[]> {
    const messagesRef = collection(
      db,
      THREADS_COLLECTION,
      threadId,
      MESSAGES_COLLECTION,
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc"),
    );

    const snapshot =
      await getDocs(messagesQuery);

    return snapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      threadId,
      ...(
        snapshot.data() as MessageDocument
      ),
    }));
  },

  async getThread(
    threadId: string,
  ): Promise<MessageThread | null> {
    const threadRef = doc(
      db,
      THREADS_COLLECTION,
      threadId,
    );

    const snapshot =
      await getDoc(threadRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(
        snapshot.data() as MessageThreadDocument
      ),
    };
  },

  async getAllThreads(): Promise<MessageThread[]> {
    const threadsRef = collection(
      db,
      THREADS_COLLECTION,
    );

    const threadsQuery = query(
      threadsRef,
      orderBy("lastMessageAt", "desc"),
    );

    const snapshot =
      await getDocs(threadsQuery);

    return snapshot.docs.map((snapshot) => ({
      id: snapshot.id,
      ...(
        snapshot.data() as MessageThreadDocument
      ),
    }));
  },

  async closeThread(
    threadId: string,
  ): Promise<void> {
    const threadRef = doc(
      db,
      THREADS_COLLECTION,
      threadId,
    );

    await updateDoc(threadRef, {
      status: "closed",
      updatedAt: serverTimestamp(),
    });
  },


  async reopenThread(
    threadId: string,
  ): Promise<void> {
    const threadRef = doc(
      db,
      THREADS_COLLECTION,
      threadId,
    );

    await updateDoc(threadRef, {
      status: "open",
      updatedAt: serverTimestamp(),
    });
  },


  async markAsReadByUser(
    threadId: string,
  ): Promise<void> {
    const threadRef = doc(
      db,
      THREADS_COLLECTION,
      threadId,
    );

    await updateDoc(threadRef, {
      unreadByUser: 0,
    });
  },


  async markAsReadByAdmin(
    threadId: string,
  ): Promise<void> {
    const threadRef = doc(
      db,
      THREADS_COLLECTION,
      threadId,
    );

    await updateDoc(threadRef, {
      unreadByAdmin: 0,
    });
  },

  subscribeToMessages(
    threadId: string,
    onUpdate: (messages: Message[]) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    const messagesRef = collection(
      db,
      THREADS_COLLECTION,
      threadId,
      MESSAGES_COLLECTION,
    );

    const messagesQuery = query(
      messagesRef,
      orderBy("createdAt", "asc"),
    );

    return onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messages =
          snapshot.docs.map((snapshot) => ({
            id: snapshot.id,
            threadId,
            ...(
              snapshot.data() as MessageDocument
            ),
          }));

        onUpdate(messages);
      },
      (error) => {
        console.error(
          "Failed to listen to messages:",
          error,
        );

        onError?.(error);
      },
    );
  },
};