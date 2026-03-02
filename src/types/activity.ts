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
  | "file_deleted"
  | "video_analysed"
  | "quote_sent"
  | "quote_accepted"
  | "quote_rejected"
  | "quote_revision_requested"
  // Portal-specific system events (actor = "client" or "system")
  | "portal_opened"
  | "portal_file_uploaded"
  | "portal_file_deleted";

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

export interface FileDeletedEvent extends ActivityEventBase {
  type: "file_deleted";
  payload: {
    fileId: string;
    filename: string;
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

export interface QuoteRevisionRequestedEvent extends ActivityEventBase {
  type: "quote_revision_requested";
  payload: { version: number; message: string };
}

export interface PortalOpenedEvent extends ActivityEventBase {
  type: "portal_opened";
  payload: {
    platform: "web" | "ios" | "android";
    /** true when this is the client's very first visit (status was "draft") */
    firstVisit: boolean;
  };
}

export interface PortalFileUploadedEvent extends ActivityEventBase {
  type: "portal_file_uploaded";
  payload: {
    fileId: string;
    filename: string;
    fileType: "image" | "video" | "document";
  };
}

export interface PortalFileDeletedEvent extends ActivityEventBase {
  type: "portal_file_deleted";
  payload: {
    fileId: string;
    filename: string;
  };
}

export type ActivityEvent =
  | MessageEvent
  | FileUploadedEvent
  | FileDeletedEvent
  | VideoAnalysedEvent
  | QuoteSentEvent
  | QuoteAcceptedEvent
  | QuoteRejectedEvent
  | QuoteRevisionRequestedEvent
  | PortalOpenedEvent
  | PortalFileUploadedEvent
  | PortalFileDeletedEvent;
