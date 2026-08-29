# Auth Coding Standards

## Clerk Only

- **This app uses Clerk (`@clerk/nextjs`) for all authentication.** Do not introduce another auth library, hand-rolled session/cookie logic, or a competing solution (NextAuth, Lucia, custom JWT, etc.).
- Root layout (`src/app/layout.tsx`) wraps the app in `<ClerkProvider>`. Do not duplicate or nest additional providers.
- Route protection is enforced globally via `clerkMiddleware()` in `src/proxy.ts`. Do not add per-route auth checks in middleware — page/data-layer checks (below) are the enforcement point for individual routes.

## Getting the Current User in Server Components

- Use `auth()` from `@clerk/nextjs/server` in Server Components/pages to get the current session:

  ```ts
  import { auth } from "@clerk/nextjs/server";
  import { redirect } from "next/navigation";

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  ```

- Every page that renders user-owned data must perform this check before fetching or rendering anything. Do not assume middleware alone guarantees `userId` is present in a page component.
- Per [`data-fetching.md`](./data-fetching.md), the resulting `userId` must be passed into `/data` helper functions and used to scope every Drizzle query (e.g. `eq(table.userId, userId)`). Never pass a client-supplied user ID as the source of authorization.

## Sign-in / Sign-up

- Sign-in and sign-up pages live at `src/app/sign-in/[[...sign-in]]/page.tsx` and `src/app/sign-up/[[...sign-up]]/page.tsx`, rendering Clerk's `<SignIn />` and `<SignUp />` components respectively.
- Do not build custom sign-in/sign-up forms. Use Clerk's hosted components (`SignIn`, `SignUp`) rather than calling Clerk's client SDK directly to build bespoke auth UI.
- Redirect URLs are configured via env vars (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`) — do not hardcode `/sign-in` or `/sign-up` paths inside components; unauthenticated redirects (as in the pattern above) are the one exception since they target the same routes those env vars point to.

## Client Components

- Client Components needing auth state (e.g. a user menu) should use Clerk's client hooks/components (`useUser`, `<UserButton />`, etc.) directly — never receive a raw session object as a prop from a Server Component.
- Do not fetch or verify auth state via `useEffect` + a custom API route. Per [`data-fetching.md`](./data-fetching.md), no data fetching happens in Client Components regardless of whether it's auth-related.

## Secrets

- `CLERK_SECRET_KEY` must never be referenced outside server-only code (Server Components, `/data` helpers, `src/proxy.ts`). Never import it into a Client Component or expose it via `NEXT_PUBLIC_*`.
- Only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and the sign-in/sign-up URL env vars are safe for client exposure.
