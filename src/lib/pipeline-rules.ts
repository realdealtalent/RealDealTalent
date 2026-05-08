import { companyStatus } from "@/db/schema";
import type { CompanyStatus } from "@/db/schema";

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Pure validation rules for pipeline transitions — no DB access.
 */
export function validateTransition(
  fromStatus: CompanyStatus,
  toStatus: CompanyStatus,
  opts: { lostReasonSlug?: string; note?: string } = {},
): ValidationResult {
  // Target must be a known status
  if (!companyStatus.includes(toStatus)) {
    return { valid: false, error: `Invalid status: ${toStatus}` };
  }

  // No-op
  if (fromStatus === toStatus) {
    return { valid: false, error: `Company is already in status "${toStatus}"` };
  }

  // Rejection requires a lost reason
  if (toStatus === "rejected" && !opts.lostReasonSlug) {
    return { valid: false, error: "Rejecting a company requires a lost reason" };
  }

  // "other_with_note" requires a note
  if (
    toStatus === "rejected" &&
    opts.lostReasonSlug === "other_with_note" &&
    !opts.note?.trim()
  ) {
    return { valid: false, error: 'Lost reason "other_with_note" requires a note' };
  }

  // Re-activation from rejected only goes to qualified
  if (fromStatus === "rejected" && toStatus !== "qualified") {
    return {
      valid: false,
      error: 'Rejected companies can only be re-activated to "qualified"',
    };
  }

  return { valid: true };
}
