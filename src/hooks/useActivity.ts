import { sendMessage, watchActivity } from "@/src/services/activity";
import { ActivityEvent, ActivityVisibility } from "@/src/types";
import { useEffect, useRef, useState } from "react";

interface UseActivityOptions {
  projectId: string;
  /** "contractor" sees all events. "client" sees only visibleTo:"all" events. */
  visibility: ActivityVisibility;
  /** The sender's Firebase UID — required to send messages. */
  authorId: string;
  /** The sender's display name shown in the feed. */
  authorName: string;
}

interface UseActivityResult {
  events: ActivityEvent[];
  isLoading: boolean;
  /** Send a chat message. Pass visibleTo:"contractor" for internal notes. */
  send: (text: string, visibleTo?: ActivityVisibility) => Promise<void>;
  isSending: boolean;
}

export function useActivity({
  projectId,
  visibility,
  authorId,
  authorName,
}: UseActivityOptions): UseActivityResult {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Track the actor role derived from visibility — contractor can also send
  // internal notes; clients always send as "client".
  const actor = visibility === "contractor" ? "contractor" : "client";

  // Stable ref so the send callback never needs to be recreated
  const actorRef = useRef(actor);
  actorRef.current = actor;

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = watchActivity(projectId, visibility, (incoming) => {
      setEvents(incoming);
      setIsLoading(false);
    });
    return unsubscribe;
  }, [projectId, visibility]);

  const send = async (text: string, visibleTo: ActivityVisibility = "all") => {
    if (!text.trim()) return;
    setIsSending(true);
    try {
      await sendMessage(projectId, text.trim(), actorRef.current, authorId, authorName, visibleTo);
    } finally {
      setIsSending(false);
    }
  };

  return { events, isLoading, send, isSending };
}
