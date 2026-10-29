---
name: context-load
description: Use at the start of a session — especially when picking up someone else's work or resuming after a break — to load the shared ticket log from docs/workspace/tickets/{ID-OR-SLUG}.md. Reading this file before doing any code exploration saves significant tokens because the prior dev's plan, decisions, and blast-radius analysis are already there.
---

# Context Load

## What to do

1. Ask the user for the ticket ID or slug if not already provided.
2. Read `docs/workspace/tickets/{slug}.md`.
3. Report:
   - Summary of decisions made so far
   - Status of implementation
   - Pending acceptance criteria or open questions
4. Ask how to proceed (resume implementation, write tests, or start pre-commit review).
