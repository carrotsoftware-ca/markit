// ---------------------------------------------------------------------------
// Quote types
// ---------------------------------------------------------------------------

export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "revision_requested";

export interface QuoteLineItem {
  id: string;
  category: string; // e.g. "Kitchen" — pre-filled from AI, editable
  description: string; // contractor fills this in
  quantity: number;
  unitPrice: number; // in cents (to avoid float issues)
  unit: string; // e.g. "hrs", "sqft", "each"
}

export interface Quote {
  id?: string;
  status: QuoteStatus;
  version: number; // increments each time it's sent
  lineItems: QuoteLineItem[];
  currency: string; // "CAD" | "USD" etc.
  notes?: string; // optional contractor note to client
  sentAt?: string; // ISO string
  respondedAt?: string; // ISO string
  createdAt?: string;
  updatedAt?: string;
}

/** Total in cents */
export function calcQuoteTotal(items: QuoteLineItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

/** Format cents as a currency string, e.g. 150000 → "$1,500.00" */
export function formatCurrency(cents: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
