#!/bin/bash
set -euo pipefail

# Post-push hook: detect issue references in pushed commits and prompt
# the agent to close/relabel them.
#
# Reads the push command from stdin (Claude Code hook JSON), determines
# what was pushed, extracts "Closes #N" from commit messages, and returns
# additional context telling the agent which issues to close.

read -r hook_json

COMMAND=$(echo "$hook_json" | jq -r '.tool_input.command')

# Determine remote and branch from the push command
REMOTE=$(echo "$COMMAND" | awk '{for(i=1;i<=NF;i++) if($i=="push") {print $(i+1); exit}}')
REMOTE=${REMOTE:-origin}
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")

# Find the range of commits that were just pushed by comparing local HEAD
# with the remote tracking branch BEFORE the push updated it.
# After push, local and remote match, so we look at the reflog to find
# what the remote was before the push.
REMOTE_REF="$REMOTE/$BRANCH"

# Get commits on this branch that were just pushed. Use the reflog of the
# remote tracking ref — the previous position is reflog entry @{1}.
PREV_REMOTE=$(git rev-parse "$REMOTE_REF@{1}" 2>/dev/null || echo "")

if [ -z "$PREV_REMOTE" ]; then
  # First push of this branch — check all commits not on remote main
  RANGE="$REMOTE/main..HEAD"
else
  RANGE="$PREV_REMOTE..HEAD"
fi

# Extract issue numbers from "Closes #N", "Fixes #N", "Resolves #N" in commit messages
ISSUES=$(git log "$RANGE" --format="%B" 2>/dev/null \
  | grep -ioE '(closes|fixes|resolves)\s+#[0-9]+' \
  | grep -oE '#[0-9]+' \
  | sort -u \
  | tr '\n' ' ')

if [ -z "$ISSUES" ]; then
  # No linked issues found
  exit 0
fi

# Build context for the agent
read -r -d '' CONTEXT <<EOF || true
POST-PUSH: The following GitHub issues were referenced with closing keywords in the pushed commits: ${ISSUES}

For each issue above:
1. Close it: gh issue close <N> --comment "Shipped in $(git rev-parse --short HEAD)."
2. Remove its triage state label (ready-for-agent, ready-for-human, needs-triage, or needs-info)
3. Keep category labels (bug, enhancement)

See docs/agents/issue-tracker.md for the full protocol.
EOF

jq -n --arg ctx "$CONTEXT" '{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": $ctx
  }
}'

exit 0
