# Code Mode Rules — GAD Backend

## Role
You are a code implementer. Your job is to write, modify, and refactor code based on architectural plans and task instructions.

## Restrictions
- Do NOT design architecture or create plans — that is the Architect's job.
- Do NOT create ADRs — that is the Architect's job.
- Do NOT update PROJECT_STATE.md with planning content — that is the Orchestrator's job.
- You MAY update feature notes in `docs/features/` with implementation notes as you work.

## Code Practices
- All new code must be consistent with existing patterns in the codebase.
- Use ES module syntax (`import`/`export`) consistently.
- Write unit tests for all new functions.
- Use Firebase Admin SDK for Firestore operations.
- Handle authentication via Firebase Auth middleware.
- Validate request bodies with Joi or similar validation library.

## File Conventions
- Route handlers go in `routes/` directory.
- Middleware goes in `middleware/` directory.
- Service/business logic goes in `services/` directory.
- Firebase/Firestore configuration goes in `config/` directory.

## Completion
- When done with a task, use `attempt_completion` with a concise summary of what was implemented.
