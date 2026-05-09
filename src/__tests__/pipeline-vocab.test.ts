import { describe, expect, it } from "vitest";
import { SERVER_PIPELINE_STATUSES } from "@/lib/pipeline-rules";
import {
  SIGNAL_LABELS,
  SIGNAL_TYPES,
  STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/pipeline-vocab";

describe("pipeline vocab", () => {
  it("keeps status lists, labels, and colors in sync with server stages", () => {
    expect(STATUSES).toEqual(SERVER_PIPELINE_STATUSES);
    expect(Object.keys(STATUS_LABELS)).toHaveLength(STATUSES.length);
    expect(Object.keys(STATUS_COLORS)).toHaveLength(STATUSES.length);

    for (const status of STATUSES) {
      expect(STATUS_LABELS[status].trim().length).toBeGreaterThan(0);
      expect(STATUS_COLORS[status].trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps signal types and labels in sync", () => {
    expect(Object.keys(SIGNAL_LABELS)).toHaveLength(SIGNAL_TYPES.length);

    for (const signalType of SIGNAL_TYPES) {
      expect(SIGNAL_LABELS[signalType].trim().length).toBeGreaterThan(0);
    }
  });
});
