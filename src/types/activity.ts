// ---------------------------------------------------------------------------
// Activity feed — shared between contractor app and client portal.
// Every event in projects/{projectId}/activity/{id} maps to one of these.
// ---------------------------------------------------------------------------

export type ActivityActor = "contractor" | "client" | "system";
export type ActivityVisibility = "all" | "contractor";

// Discriminated union — add new event types here as features grow.
export type ActivityEventType =
  | "message"
  | "file_uploaded"
  | "video_analysed"
  | "quote_sent"
  | "quote_accepted"
  | "quote_rejected";

interface ActivityEventBase {
  id: string;
  actor: ActivityActor;
  authorId: string | null; // null for system events
  authorName: string | null; // null for system events
  visibleTo: ActivityVisibility;
  createdAt: string; // ISO string — normalised from Firestore Timestamp
}

export interface MessageEvent extends ActivityEventBase {
  type: "message";
  text: string;
}

export interface FileUploadedEvent extends ActivityEventBase {
  type: "file_uploaded";
  payload: {
    fileId: string;
    filename: string;
    fileType: "image" | "video" | "document";
  };
}

export interface VideoAnalysedEvent extends ActivityEventBase {
  type: "video_analysed";
  payload: {
    fileId: string;
    filename: string;
    categories: string[];
    summary: string;
  };
}

export interface QuoteSentEvent extends ActivityEventBase {
  type: "quote_sent";
  payload: {
    version: number;
    totalAmount: number;
    currency: string;
  };
}

export interface QuoteAcceptedEvent extends ActivityEventBase {
  type: "quote_accepted";
  payload: { version: number };
}

export interface QuoteRejectedEvent extends ActivityEventBase {
  type: "quote_rejected";
  payload: { version: number; reason?: string };
}

export type ActivityEvent =
  | MessageEvent
  | FileUploadedEvent
  | VideoAnalysedEvent
  | QuoteSentEvent
  | QuoteAcceptedEvent
  | QuoteRejectedEvent;
