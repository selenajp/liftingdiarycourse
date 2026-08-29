# Data Mutation Standards

## Database Access via `/data` Helpers

- **All database mutations must live in helper functions inside the `src/data` directory.** Server Actions call these helpers instead of mutating the database directly.
- Helper functions **must** use Drizzle ORM to build and execute inserts, updates, and deletes.
- **Raw SQL is not allowed** — do not use `sql` template escapes, raw query strings, or any driver-level raw SQL execution to bypass Drizzle's query builder.
- Every helper function that mutates user-owned data must scope its Drizzle query with a `where` clause matching the current user's ID (e.g. `eq(table.userId, userId)`), sourced from the authenticated session — never from a client-supplied value.

## Server Actions Only

- **ALL data mutations must be performed via Server Actions.** This is incredibly important and has no exceptions.
- Mutations must **NOT** be performed via Route Handlers (`app/api/**/route.ts`).
- Mutations must **NOT** be performed via Client Components calling the database or an API directly.
- A Server Action's only job is to validate input, call the appropriate `/data` helper, and (if needed) revalidate/redirect — it must never build or run Drizzle queries itself.

## Colocated `actions.ts` Files

- Server Actions **must** live in a file named `actions.ts` colocated with the route/component that uses them (e.g. `app/workouts/[id]/actions.ts`).
- Each `actions.ts` file must start with the `"use server"` directive.
- Do not scatter Server Actions across arbitrary filenames or a single global actions file — colocate them with their feature.

## Typed Parameters — No `FormData`

- Every Server Action **must** declare explicitly typed parameters (plain TypeScript types/interfaces).
- Server Actions must **NOT** accept a `FormData` parameter. Forms must be wired up (e.g. via a client-side handler that calls the action with typed arguments) so the action itself never receives or parses `FormData`.

## Zod Validation

- **Every Server Action must validate all of its arguments with Zod** before doing anything else — no exceptions, even if the parameters are already typed in TypeScript.
- Define a Zod schema for the action's input, parse the incoming arguments with it (e.g. `schema.parse(args)`), and only proceed to call the `/data` helper once validation succeeds.
- If validation fails, the action must not call any `/data` helper — return/throw an appropriate error instead of attempting the mutation.
- TypeScript types alone are not sufficient: types are erased at runtime and do not protect against malformed or malicious input reaching a Server Action, so Zod validation is required in addition to typed parameters.

## User Data Isolation

- **A logged-in user must only ever be able to mutate their own data.** They must never be able to create, update, or delete another user's data.
- Never trust a user ID, resource ID, or other identifier passed from the client as the sole means of authorization. Always scope mutations by the authenticated user's ID from the server-side session in addition to any requested resource ID.
