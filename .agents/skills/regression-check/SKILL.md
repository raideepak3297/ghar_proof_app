---
name: regression-check
description: Use after implementation is done, before manual testing. Lists existing React UI behaviors that could break from this diff — affected routes, parent components, shared contexts, responsive breakpoints — and produces a manual test scenarios checklist.
---

# Regression Check

## What to do
1. Analyze git diff.
2. Check impacted routes and components.
3. Check responsive layouts across mobile, tablet, desktop.
4. Verify both Landlord and Tenant role permissions and workflows.
5. Produce manual testing checklist for happy path and error states.
