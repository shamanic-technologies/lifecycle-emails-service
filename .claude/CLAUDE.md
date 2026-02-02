# Project: Lifecycle Emails Service

## README Update Rule (MANDATORY)

**Every time you make changes to this codebase, you MUST update README.md to reflect those changes before committing.**

This includes but is not limited to:
- Adding/removing/renaming API endpoints -> update the API section
- Adding/removing/modifying event types -> update the Event Types table
- Adding/removing environment variables -> update the Environment Variables table
- Adding/removing npm scripts -> update the Scripts table
- Adding/removing/moving files or directories -> update the Project Structure tree
- Changing the tech stack (new dependencies, new services) -> update the Tech Stack section
- Changing setup steps or deployment config -> update the Setup section

### How to update the README

1. After finishing your code changes, re-read `README.md`
2. Identify which sections are now stale
3. Update only the affected sections (don't rewrite the whole file)
4. Keep the existing format and style consistent
5. Include the README changes in the same commit as the code changes

### README structure reference

The README has these sections in order:
1. Title + one-line description
2. API (endpoints, request/response)
3. Event Types table (event, dedup strategy, recipient)
4. Tech Stack
5. Setup instructions
6. Environment Variables table
7. Scripts table
8. Project Structure tree

## Code Style

- TypeScript strict mode, ESM modules
- Functional patterns over classes
- Simple solutions, no over-engineering
- Express for HTTP, Drizzle for DB, Postmark for email, Clerk for users
