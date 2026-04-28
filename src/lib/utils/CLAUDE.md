# Utils

## `run.ts` — Run formatting

**IMPORTANT: two formatters exist for pace and duration — pick the right one.**

| Function                                     | Input      | Output format                            | Use for                             |
| -------------------------------------------- | ---------- | ---------------------------------------- | ----------------------------------- |
| `formatRunPace(s/km)`                        | seconds/km | `5'30"`                                  | Display in UI                       |
| `formatPace(s/km)`                           | seconds/km | `5:30`                                   | Charts / compact display            |
| `formatRunDurationDisplay(s)`                | seconds    | `1h02'30"`                               | Full display in UI                  |
| `formatDuration(s)` / `formatRunDuration(s)` | seconds    | `1:02:30`                                | Charts / compact display            |
| `formatRunDistance(m)`                       | **meters** | `"10.50"` (km)                           | Distance from DB (stored in meters) |
| `formatDistanceShort(km)`                    | **km**     | `"10.50"`                                | Distance already in km              |
| `formatRunDateShort(date)`                   | Date       | `"14:32"` / `"14 avr"` / `"14 avr 2024"` | Relative date, locale fr            |
| `formatRunDate(date)`                        | Date       | `"lundi 14 avril 2024"`                  | Full date, locale fr                |

## `date.ts` — Date utilities

- `getPeriodRange(period, daysMap)` — returns `{ currentStart, currentEnd, prevStart, prevEnd }`. Pass `"all"` to get unbounded range (prevStart/prevEnd are null). Used by progress and leaderboard.
- `isNavItemNew(newUntil?)` — returns true if current date is before `newUntil`.

## `route.ts` — Route utilities

- `getRouteType(pathname)` — returns `"public" | "auth" | "onboarding" | "admin" | "protected"`. Used in middleware.
- `isNavActive(pathname, href)` — true if pathname matches href (exact for `/home`, prefix for others).
