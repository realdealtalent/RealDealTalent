import type { CompanyStatus } from "@/db/schema";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/pipeline-vocab";

type PillProps = {
  stage: CompanyStatus;
  className?: string;
};

export function Pill({ stage, className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_COLORS[stage]} ${className}`.trim()}
    >
      {STATUS_LABELS[stage]}
    </span>
  );
}
