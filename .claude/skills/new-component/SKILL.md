---
name: new-component
description: Create a new component following the project's layered architecture
---

## Component layers — where to put things

| Layer        | Path                        | Rule                                                                                                                                                 |
| ------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shadcn-ui/` | `src/components/shadcn-ui/` | Only shadcn-generated primitives. Never hand-edit style here. Add with `pnpm dlx shadcn@latest add <name>`.                                          |
| `ui/`        | `src/components/ui/`        | Custom reusable components built on top of shadcn-ui. Generic, not tied to any page.                                                                 |
| `layout/`    | `src/components/layout/`    | Page-level shells (sidebars, panels, wrappers). Not reused across unrelated pages. Complex layout components use a **folder** structure (see below). |

## Folder structure for layout components

When a layout component is complex enough to have multiple sub-files, use a folder with an `index.tsx` entry point — mirroring `src/components/layout/app-sidebar/`:

```
src/components/layout/my-component/
  index.tsx            ← exports the public component, imports sub-files
  my-component-nav.tsx ← sub-file (exported only if needed by index.tsx)
  my-component-logo.tsx
  user-nav.tsx
```

Rules:

- `index.tsx` is the **only public surface** — consumers import from `@/components/layout/my-component`
- Each sub-file holds one focused concern and is named `<component>-<part>.tsx` in kebab-case
- Sub-files that only serve one parent stay unexported at the module level; `index.tsx` re-exports nothing unless another layer needs it
- Prefer sub-files over a single giant `index.tsx` once the file exceeds ~100 lines or has clearly separable concerns

## Component file conventions

- One component per file, named after the component in PascalCase
- Export as named export (not default)
- Props type defined inline above the component: `type MyComponentProps = { ... }`
- `"use client"` only when the component needs browser APIs or React state/effects

## Sub-components

Split a component into sub-components when a logical section:

- has its own props or derived state
- will later hold logic (event handlers, data fetching, auth checks…)
- is reused inside the same file

### Rules for sub-components

- Define them in the **same file**, above the parent component
- Do **not** export them (private to the file) unless explicitly needed elsewhere
- Name them as `<Parent><Part>` — e.g. `UserNavTrigger`, `UserNavMenu`, `UserNavLogout`
- Give them a focused props type — use `Pick<ParentProps, "x" | "y">` to avoid duplicating the full type
- Compose them in the parent via JSX — the parent stays thin

### When to extract to a separate file

Only move a sub-component to its own file if it is:

- reused by a **different** parent component, or
- large enough that the host file exceeds ~150 lines

### Example structure

```tsx
// user-nav.tsx

type UserInfo = { name?: string | null; username?: string | null }

function UserNavTrigger({ name }: Pick<UserInfo, "name">) { ... }   // private
function UserNavMenu({ username }: Pick<UserInfo, "username">) { ... } // private

export function UserNav(props: UserInfo) {                           // public
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><UserNavTrigger {...props} /></DropdownMenuTrigger>
      <UserNavMenu username={props.username} />
    </DropdownMenu>
  )
}
```

## Adding a shadcn primitive

```bash
pnpm dlx shadcn@latest add <component-name>
```

This drops the file into `src/components/shadcn-ui/` automatically per `components.json` aliases.

## Route constants

Never hardcode route strings. Import from `@/lib/constants/routes`:

```ts
import { ROUTES, AUTH_ROUTES } from "@/lib/constants/routes"
```

Add new routes to that file if needed.
