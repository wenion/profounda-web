import type {
  Timestamp,
} from "firebase/firestore";


export type MessageThreadStatus =
  | "open"
  | "closed";

export type MessageSenderRole =
  | "user"
  | "admin";

export type MessageAttachmentType =
  | "image";


export interface MessageAttachment {
  id: string;
  type: MessageAttachmentType;

  url: string;

  fileName?: string;
  mimeType?: string;
  size?: number;

  storageProvider?: string;
  storageKey?: string;
}


export interface MessageThreadDocument {
  userId: string;
  userEmail: string;

  subject?: string;

  status: MessageThreadStatus;

  unreadByUser: number;
  unreadByAdmin: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessageAt: Timestamp;
}


export interface MessageDocument {
  senderId: string;
  senderRole: MessageSenderRole;

  content: string;

  attachments?: MessageAttachment[];

  createdAt: Timestamp;
}


export interface MessageThread
  extends MessageThreadDocument {
  id: string;
}


export interface Message
  extends MessageDocument {
  id: string;
  threadId: string;
}