import { EventSchemas, Inngest } from "inngest";

// Snapshot of an active meta-industry passed down the event chain so children
// see a consistent operating context even if a row is toggled mid-run.
export type MetaSnapshot = {
  label: string;
  searchTerms: string[] | null;
};

type Events = {
  "prospecting/run.requested": {
    data: {
      parentRunId: string;
      industryIds?: string[];
    };
  };
  "prospecting/industry.requested": {
    data: {
      runId: string;
      parentRunId: string;
      industryId: string;
      metas: MetaSnapshot[];
    };
  };
  "prospecting/conference.requested": {
    data: {
      runId: string;
      industryId: string;
      conferenceUrl: string;
      conferenceName: string;
      metas: MetaSnapshot[];
    };
  };
};

export const inngest = new Inngest({
  id: "realdealtalent",
  schemas: new EventSchemas().fromRecord<Events>(),
});
