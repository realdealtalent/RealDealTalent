## Commit conventions

When committing work for a tracked issue, include `Closes #<N>` on its own line in the commit body. This links the commit to the issue and triggers the post-push hook to close it and clean up triage labels automatically. See `docs/agents/issue-tracker.md`.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues on `realdealtalent/RealDealTalent`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
