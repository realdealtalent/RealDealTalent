import { validateTransition } from "@/lib/pipeline-rules";

describe("validateTransition", () => {
  // --- Valid transitions ---

  it("allows advancing from prospect to qualified", () => {
    const result = validateTransition("prospect", "qualified");
    expect(result).toEqual({ valid: true });
  });

  it("allows advancing from qualified to outreach", () => {
    const result = validateTransition("qualified", "outreach");
    expect(result).toEqual({ valid: true });
  });

  it("allows jumping from prospect to lead", () => {
    const result = validateTransition("prospect", "lead");
    expect(result).toEqual({ valid: true });
  });

  it("allows advancing from meeting_held to proposal_sent", () => {
    const result = validateTransition("meeting_held", "proposal_sent");
    expect(result).toEqual({ valid: true });
  });

  it("allows advancing from proposal_sent to signed", () => {
    const result = validateTransition("proposal_sent", "signed");
    expect(result).toEqual({ valid: true });
  });

  it("allows moving backward from outreach to qualified", () => {
    const result = validateTransition("outreach", "qualified");
    expect(result).toEqual({ valid: true });
  });

  // --- Same-status transitions ---

  it("rejects transitioning to the same status", () => {
    const result = validateTransition("prospect", "prospect");
    expect(result).toEqual({
      valid: false,
      error: 'Company is already in status "prospect"',
    });
  });

  // --- Rejection rules ---

  it("rejects transition to rejected without a lost reason", () => {
    const result = validateTransition("qualified", "rejected");
    expect(result).toEqual({
      valid: false,
      error: "Rejecting a company requires a lost reason",
    });
  });

  it("allows rejection with a lost reason", () => {
    const result = validateTransition("qualified", "rejected", {
      lostReasonSlug: "no_budget",
    });
    expect(result).toEqual({ valid: true });
  });

  it("rejects other_with_note without a note", () => {
    const result = validateTransition("qualified", "rejected", {
      lostReasonSlug: "other_with_note",
    });
    expect(result).toEqual({
      valid: false,
      error: 'Lost reason "other_with_note" requires a note',
    });
  });

  it("rejects other_with_note with empty/whitespace note", () => {
    const result = validateTransition("qualified", "rejected", {
      lostReasonSlug: "other_with_note",
      note: "   ",
    });
    expect(result).toEqual({
      valid: false,
      error: 'Lost reason "other_with_note" requires a note',
    });
  });

  it("allows other_with_note with a real note", () => {
    const result = validateTransition("qualified", "rejected", {
      lostReasonSlug: "other_with_note",
      note: "They went dark after 3 follow-ups",
    });
    expect(result).toEqual({ valid: true });
  });

  // --- Re-activation rules ---

  it("allows re-activation from rejected to qualified", () => {
    const result = validateTransition("rejected", "qualified");
    expect(result).toEqual({ valid: true });
  });

  it("rejects re-activation from rejected to any status other than qualified", () => {
    const result = validateTransition("rejected", "outreach");
    expect(result).toEqual({
      valid: false,
      error: 'Rejected companies can only be re-activated to "qualified"',
    });
  });

  it("rejects re-activation from rejected to prospect", () => {
    const result = validateTransition("rejected", "prospect");
    expect(result).toEqual({
      valid: false,
      error: 'Rejected companies can only be re-activated to "qualified"',
    });
  });

  it("rejects re-activation from rejected to signed", () => {
    const result = validateTransition("rejected", "signed");
    expect(result).toEqual({
      valid: false,
      error: 'Rejected companies can only be re-activated to "qualified"',
    });
  });
});
