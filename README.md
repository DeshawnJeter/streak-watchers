# streak-watchers (Duolingo Badge Equip UI)

A single-file Duolingo-themed app featuring a profile badge system with an interactive equip picker and medal overlay.

## Features

- **Badge Equip Picker**: Click the circular profile avatar to open a picker modal where users can select and equip earned badges.
- **Equipped Badge Medal**: When a badge is equipped, a small circular medal appears at the bottom-right of the profile avatar (visible on Profile banner, Boards "You" row, and player-summary sections).
- **Explicit-Only Equip**: Badges can only be equipped by explicit user action through the picker modal (no automatic equipping).
- **Visual Theme**: Duolingo-inspired color scheme and typography with CSS custom properties for theming flexibility.
- **Responsive Overlay**: Full-screen badge picker overlay with proper z-index management and navigation integration.

## Implementation Details

The app is built as a single HTML file with:
- Vanilla JavaScript state management (no external framework)
- CSS Grid and Flexbox layouts
- Duolingo color palette and typography system
- Reusable avatar components across multiple surfaces
- Badge picker modal with programmatic and click-based dismiss handlers
