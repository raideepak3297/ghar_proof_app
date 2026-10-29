---
name: context-save
description: Use to save the current task's working context to docs/workspace/tickets/{ID-OR-SLUG}.md — a shared, in-repo log readable by every dev on the team. Auto-invoked by ticket-kickoff, implement-from-plan, ship-it, and others, or manually by the user. Always appends with author tag and timestamp; never overwrites.
---

# Context Save

## What to do

1. Determine target file: `docs/workspace/tickets/{slug}.md`.
2. Format progress entry with ISO timestamp and author tag:
   ```markdown
   ## Update [YYYY-MM-DD HH:mm] - @author
   - **Status**: in-progress | completed | blocked
   - **Files modified**: ...
   - **Key decisions**: ...
   - **Next steps**: ...
   ```
3. Append entry without deleting previous history.
