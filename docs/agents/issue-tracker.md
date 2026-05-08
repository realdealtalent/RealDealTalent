# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Linking commits to issues

Every commit that delivers work for a tracked issue **must** include a GitHub closing keyword in the commit body so the issue is linked in the GitHub UI. Use `Closes #<N>` on its own line in the commit body (not just `(#N)` in the title — that's a PR reference, not a closing keyword).

Example:

```
Add status transitions with validation and stage history

Closes #4

Drizzle schema and migration for stage_history and lost_reasons tables...
```

When creating a PR instead of pushing directly, include `Closes #<N>` in the PR body. GitHub auto-closes the issue on merge.

## Closing completed issues

After work for an issue lands on `main` (via push or PR merge):

1. **Close with a comment** referencing the commit or PR: `gh issue close <N> --comment "Shipped in <commit-or-PR-ref>."`
2. **Remove the triage state label** (`ready-for-agent`, `ready-for-human`, `needs-triage`, `needs-info`) — closed issues don't need a triage state.
3. **Keep the category label** (`bug`, `enhancement`) — so closed issue history is filterable.

```bash
gh issue close <N> --comment "Shipped in <ref>."
gh issue edit <N> --remove-label "ready-for-agent"
```

A post-push hook automates this — see the `PostPush: close linked issues` hook in `.claude/settings.local.json`. The hook extracts issue numbers from `Closes #N` lines in pushed commits and prompts the agent to close and relabel them.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.
