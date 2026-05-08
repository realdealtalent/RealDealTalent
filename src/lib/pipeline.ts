import { db } from "@/db";
import { companies, stageHistory, lostReasons } from "@/db/schema";
import type { CompanyStatus, Company } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validateTransition } from "./pipeline-rules";

export type TransitionOpts = {
  lostReasonSlug?: string;
  note?: string;
  changedBy?: string;
};

export type TransitionResult =
  | { ok: true; company: Company }
  | { ok: false; error: string };

/**
 * Transition a Company to a new pipeline status with validation and audit trail.
 */
export async function transitionStatus(
  companyId: string,
  newStatus: CompanyStatus,
  opts: TransitionOpts = {},
): Promise<TransitionResult> {
  // Fetch the company
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    return { ok: false, error: "Company not found" };
  }

  const fromStatus = company.status as CompanyStatus;

  // Run pure validation rules
  const validation = validateTransition(fromStatus, newStatus, opts);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  // Validate lost reason exists in DB when rejecting
  if (newStatus === "rejected") {
    const [reason] = await db
      .select()
      .from(lostReasons)
      .where(eq(lostReasons.slug, opts.lostReasonSlug!))
      .limit(1);

    if (!reason || !reason.active) {
      return { ok: false, error: `Invalid lost reason: ${opts.lostReasonSlug}` };
    }
  }

  // Build the company update
  const now = new Date();
  const companyUpdate: Record<string, unknown> = {
    status: newStatus,
    statusChangedAt: now,
    updatedAt: now,
  };

  if (newStatus === "rejected") {
    companyUpdate.lostReason = opts.lostReasonSlug!;
    companyUpdate.lostNote = opts.note?.trim() || null;
  } else if (fromStatus === "rejected") {
    companyUpdate.lostReason = null;
    companyUpdate.lostNote = null;
  }

  // Update company and insert stage history in a transaction
  const [updated] = await db.transaction(async (tx) => {
    const [updatedCompany] = await tx
      .update(companies)
      .set(companyUpdate)
      .where(eq(companies.id, companyId))
      .returning();

    await tx.insert(stageHistory).values({
      entityType: "company",
      entityId: companyId,
      fromStage: fromStatus,
      toStage: newStatus,
      changedAt: now,
      changedBy: opts.changedBy ?? null,
      note: opts.note?.trim() || null,
    });

    return [updatedCompany];
  });

  return { ok: true, company: updated };
}
