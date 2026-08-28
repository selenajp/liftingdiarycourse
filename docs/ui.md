# UI Coding Standards

## Components

- **Only shadcn/ui components may be used for UI in this project.**
- **Absolutely no custom components are to be created.** Every piece of UI must be built by composing existing shadcn/ui components (`src/components/ui/`).
- Do not write bespoke JSX/CSS to replicate something shadcn already provides. If a needed component doesn't exist yet, add it via the shadcn CLI rather than hand-rolling it.
- Do not create wrapper components around shadcn components purely for styling or convenience — use shadcn components directly.

## Date Formatting

- All dates must be formatted using `date-fns`.
- Dates must use an ordinal day, short lowercase month, and full year, e.g.:
  - `1st sep 2025`
  - `2nd aug 2025`
  - `3rd jan 2026`
  - `4th jun 2024`
- Use `date-fns`'s `format` function with the `do MMM yyyy` pattern, then lowercase the month:

  ```ts
  import { format } from "date-fns";

  const formatted = format(date, "do MMM yyyy").replace(
    /[A-Za-z]+/,
    (month) => month.toLowerCase()
  );
  ```

- Do not hand-roll date formatting logic (manual ordinal suffix calculation, `Intl.DateTimeFormat`, `toLocaleDateString`, etc.) — always go through `date-fns`.
