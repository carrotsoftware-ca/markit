import { saveQuote, sendQuote, watchQuote } from "@/src/services/projects";
import { ProjectFile, Quote, QuoteLineItem } from "@/src/types";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Manages quote state for a project.
 *
 * - Subscribes to the live quote doc.
 * - Seeds line items from AI-analysed video categories if the quote is new.
 * - Exposes helpers to add/update/remove line items, save (debounced), and send.
 */
export function useQuote(
  projectId: string,
  files: ProjectFile[],
  authorId: string,
  authorName: string,
) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live subscription
  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    const unsub = watchQuote(projectId, (q) => {
      setQuote(q);
      setIsLoading(false);
    });
    return unsub;
  }, [projectId]);

  // Collect all unique AI categories from analysed video files
  const aiCategories = Array.from(
    new Set(
      files
        .filter((f) => f.type === "video" && f.aiStatus === "analysed" && f.categories?.length)
        .flatMap((f) => f.categories ?? []),
    ),
  );

  /**
   * The "working" line items — if no quote doc exists yet, seed from AI categories.
   */
  const lineItems: QuoteLineItem[] =
    quote?.lineItems ??
    aiCategories.map((cat, i) => ({
      id: `ai_${i}`,
      category: cat,
      description: "",
      quantity: 1,
      unitPrice: 0,
      unit: "each",
    }));

  const currency = quote?.currency ?? "CAD";

  // Debounced save — writes after 800 ms of inactivity
  const debouncedSave = useCallback(
    (updated: Quote) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await saveQuote(projectId, updated);
        } finally {
          setIsSaving(false);
        }
      }, 800);
    },
    [projectId],
  );

  const buildUpdatedQuote = (items: QuoteLineItem[]): Quote => ({
    status: quote?.status ?? "draft",
    version: quote?.version ?? 1,
    lineItems: items,
    currency,
    notes: quote?.notes,
  });

  const updateLineItem = (id: string, patch: Partial<QuoteLineItem>) => {
    const updated = lineItems.map((item) => (item.id === id ? { ...item, ...patch } : item));
    const next = buildUpdatedQuote(updated);
    setQuote((q) => ({ ...(q ?? next), lineItems: updated }));
    debouncedSave(next);
  };

  const addLineItem = () => {
    const newItem: QuoteLineItem = {
      id: `manual_${Date.now()}`,
      category: "General",
      description: "",
      quantity: 1,
      unitPrice: 0,
      unit: "each",
    };
    const updated = [...lineItems, newItem];
    const next = buildUpdatedQuote(updated);
    setQuote((q) => ({ ...(q ?? next), lineItems: updated }));
    debouncedSave(next);
  };

  const removeLineItem = (id: string) => {
    const updated = lineItems.filter((item) => item.id !== id);
    const next = buildUpdatedQuote(updated);
    setQuote((q) => ({ ...(q ?? next), lineItems: updated }));
    debouncedSave(next);
  };

  const updateNotes = (notes: string) => {
    const next = buildUpdatedQuote(lineItems);
    next.notes = notes;
    setQuote((q) => ({ ...(q ?? next), notes }));
    debouncedSave(next);
  };

  const handleSend = async () => {
    const current = buildUpdatedQuote(lineItems);
    setIsSending(true);
    try {
      await sendQuote(projectId, current, authorId, authorName);
    } finally {
      setIsSending(false);
    }
  };

  return {
    quote,
    lineItems,
    currency,
    isLoading,
    isSaving,
    isSending,
    aiCategories,
    updateLineItem,
    addLineItem,
    removeLineItem,
    updateNotes,
    send: handleSend,
  };
}
