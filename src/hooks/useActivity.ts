import { sendMessage, watchActivity } from "@/src/services/activity";
import { ActivityEvent, ActivityVisibility } from "@/src/types";
import { useEffect, useRef, useState } from "react";

interface UseActivityOptions {
  projectId: string;
  /** "contractor" sees all events. "all" (client/portal) sees only visibleTo:"all" events. */
  visibility: ActivityVisibility;
  authorId: string;
  authorName: string;
}

interface UseActivityResult {
  events: ActivityEvent[];
  isLoading: boolean;
  send: (text: string) => Promise<void>;
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

  const actor = visibility === "contractor" ? "contractor" : "client";
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

  const send = async (text: string) => {
    if (!text.trim()) return;
    setIsSending(true);
    try {
      await sendMessage(projectId, text.trim(), actorRef.current, authorId, authorName, "all");
    } finally {
      setIsSending(false);
    }
  };

  return { events, isLoading, send, isSending };
}
