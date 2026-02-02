# Lifecycle Emails Service

Transactional email service that sends lifecycle emails triggered by user events. Resolves recipients via Clerk, deduplicates sends, renders HTML/text templates, and delivers via Postmark.

## API

### `POST /send`

Requires `x-api-key` header.

**Request body:**

```json
{
  "appId": "mcpfactory",
  "eventType": "welcome",
  "clerkUserId": "user_xxx",
  "metadata": { "name": "Alice" }
}
```

| Field            | Required | Description                              |
| ---------------- | -------- | ---------------------------------------- |
| `appId`          | Yes      | App identifier (e.g. `mcpfactory`)       |
| `eventType`      | Yes      | Event type (see below)                   |
| `clerkUserId`    | No       | Clerk user ID to resolve email           |
| `clerkOrgId`     | No       | Clerk org ID to send to all members      |
| `recipientEmail` | No       | Direct email (fallback if no Clerk IDs)  |
| `metadata`       | No       | Template-specific data                   |

One of `clerkUserId`, `clerkOrgId`, or `recipientEmail` is required.

### `GET /health`

Returns `{ "status": "ok" }`.

## Event Types (mcpfactory)

| Event               | Dedup Strategy | Recipient |
| ------------------- | -------------- | --------- |
| `waitlist`          | Once per email | User      |
| `welcome`           | Once per user  | User      |
| `signup_notification` | Once per user | Admin     |
| `signin_notification` | None (repeatable) | Admin |
| `campaign_created`  | None (repeatable) | User   |
| `campaign_stopped`  | None (repeatable) | User   |
| `user_active`       | Daily per user | Admin     |

## Tech Stack

- **Runtime:** Node 20, TypeScript (ESM)
- **Framework:** Express
- **Database:** PostgreSQL via Drizzle ORM
- **Email delivery:** Postmark
- **User resolution:** Clerk
- **Deployment:** Railway (Docker)

## Setup

```bash
cp .env.example .env   # fill in values
npm install
npm run db:push         # push schema to database
npm run dev             # start dev server on PORT
```

## Environment Variables

| Variable | Description |
| -------- | ----------- |
| `LIFECYCLE_EMAILS_SERVICE_DATABASE_URL` | PostgreSQL connection string |
| `LIFECYCLE_EMAILS_SERVICE_API_KEY` | API key for authenticating requests |
| `POSTMARK_SERVICE_URL` | Postmark service endpoint |
| `POSTMARK_SERVICE_API_KEY` | Postmark API key |
| `CLERK_SECRET_KEY` | Clerk secret key for user resolution |
| `PORT` | Server port (default: 3008) |

## Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled server |
| `npm test` | Run tests (Vitest) |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:push` | Push schema directly |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
  index.ts              # Express app entry point
  db/
    index.ts            # Database connection
    schema.ts           # Drizzle schema (email_events table)
  lib/
    clerk.ts            # Clerk user/org email resolution
    postmark.ts         # Postmark email sending
  middleware/
    auth.ts             # API key authentication
  routes/
    health.ts           # Health check endpoint
    send.ts             # POST /send endpoint with dedup logic
  templates/
    index.ts            # Template registry
    mcpfactory/         # MCP Factory app templates
      layout.ts         # Shared HTML layout
      waitlist.ts
      welcome.ts
      signup-notification.ts
      signin-notification.ts
      campaign-created.ts
      campaign-stopped.ts
      user-active.ts
```
