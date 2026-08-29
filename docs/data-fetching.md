# Data Fetching Standards

## Server Components Only

- **ALL data fetching in this app must be done via Server Components.** This is incredibly important and has no exceptions.
- Data must **NOT** be fetched via Route Handlers (`app/api/**/route.ts`).
- Data must **NOT** be fetched via Client Components (no `useEffect` + fetch, no client-side SWR/React Query/etc.).
- Data must **NOT** be fetched via any other mechanism (Server Actions used purely to read data, middleware, edge functions, etc.).
- If a component needs data, it must be a Server Component that calls a data-layer helper function directly.
- Client Components may only receive data as props passed down from a Server Component — they must never fetch it themselves.

## Database Access via `/data` Helpers

- **All database queries must live in helper functions inside the `/data` directory.** Server Components call these helpers instead of querying the database directly.
- Helper functions **must** use Drizzle ORM to build and execute queries.
- **Raw SQL is not allowed** — do not use `sql` template escapes, raw query strings, or any driver-level raw SQL execution to bypass Drizzle's query builder.

## User Data Isolation

- **A logged-in user must only ever be able to access their own data.** They must never be able to read, update, or delete another user's data.
- Every helper function in `/data` that reads or writes user-owned data must scope its Drizzle query with a `where` clause matching the current user's ID (e.g. `eq(table.userId, userId)`), sourced from the authenticated session — never from a client-supplied value.
- Never trust a user ID, resource ID, or other identifier passed from the client as the sole means of authorization. Always filter by the authenticated user's ID from the server-side session in addition to any requested resource ID.
- Do not write helper functions that return data without a user-scoping filter unless the data is explicitly and intentionally global/shared (not user-owned).
