"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { FormField, Select, Textarea } from "@/components/forms";
import { Modal } from "@/components/modal";

type LostReason = {
  id: string;
  label: string;
  slug: string;
};

type Props = {
  lostReasons: LostReason[];
  onConfirm: (slug: string, note?: string) => void;
  onCancel: () => void;
};

export function RejectModal({ lostReasons, onConfirm, onCancel }: Props) {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [note, setNote] = useState("");
  const requiresNote = selectedSlug === "other_with_note";

  return (
    <Modal title="Reject Company" onClose={onCancel} className="max-w-md">
      <div className="p-6 space-y-4">
        <FormField label="Lost Reason *" htmlFor="lost-reason">
          <Select
            id="lost-reason"
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
          >
            <option value="">Select a reason…</option>
            {lostReasons.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label={`Note ${requiresNote ? "*" : ""}`}
          htmlFor="lost-note"
        >
          <Textarea
            id="lost-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder={requiresNote ? "Required for this reason" : "Optional"}
          />
        </FormField>
      </div>
      <div className="flex justify-end gap-3 px-6 pb-6">
        <Button type="button" onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button
          type="button"
          disabled={!selectedSlug || (requiresNote && !note.trim())}
          onClick={() => onConfirm(selectedSlug, note || undefined)}
          variant="danger"
        >
          Reject
        </Button>
      </div>
    </Modal>
  );
}
