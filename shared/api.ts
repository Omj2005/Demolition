/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Announcement related types
 */
export interface Reaction {
  [emoji: string]: string[]; // emoji -> array of user emails who reacted
}

export interface AnnouncementMessage {
  id: string;
  sender: string;
  senderType: "teacher" | "student";
  message: string;
  timestamp: any; // Firestore Timestamp
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  class: number;
  section: string;
  teacherEmail: string;
  teacherName: string;
  createdAt: any; // Firestore Timestamp
  chat: AnnouncementMessage[];
  reactions?: Reaction;
}
