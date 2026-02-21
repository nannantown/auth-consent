# Design System Reference (Centra Consumer)

## Canonical Source

正典（single source of truth）は ground-ui リポジトリにある:
`/Users/kokinaniwa/projects/ground-ui/.claude/agents/references/design-system.md`

CSS トークンは `@ground/ui` パッケージ (`src/css/tokens.css`) で定義。
Centra は `@ground/ui/css` をインポートし、`globals.css` には Centra 固有のスタイルのみ追加する。

## Centra 固有ルール

- `@ground/ui/css` を `globals.css` でインポート
- `globals.css` に追加するのは Centra アプリ固有のスタイルのみ（レイアウト、ページ固有等）
- コンポーネントは `@ground/ui` から import（Avatar, Button, Modal 等）
- 既存 Centra 固有コンポーネント: `src/components/ui/BackButton.tsx`

## Quick Reference — Dark Theme Tokens

### Backgrounds
```
--bg-primary:   #0a0a0a    Page background
--bg-secondary: #111111    Secondary surfaces
--bg-card:      #141414    Card background
--bg-elevated:  #1a1a1a    Elevated elements
--bg-overlay:   dark 95%   Modal background
--bg-scrim:     black 60%  Backdrop overlay
--bg-surface:   white 5%   Subtle surface tint
```

### Text
```
--text-primary:   #ffffff
--text-secondary: #a0a0a0
--text-muted:     #888888
--text-disabled:  #666666
--text-inverse:   #000000
```

### Borders
```
--border-subtle:  white 12%   Card borders, dividers
--border-default: white 20%   Input borders, secondary btn
--border-strong:  white 35%   Hover state, emphasis
```

### Interactive States
```
--hover-bg:          white 3%    Hover background
--active-bg:         white 6%    Active/pressed background
--selected-bg:       #ffffff     Selected item background
--selected-text:     #000000     Selected item text
--selected-hover-bg: #e0e0e0    Selected + hover
--disabled-opacity:  0.4         Disabled element opacity
--focus-ring:        #a0a0a0    Focus outline color
```

### Semantic Colors
```
--success: #22c55e    --warning: #f59e0b    --error: #ef4444    --info: #3b82f6
--accent:  #0ea5e9
```

Each semantic color has: `-hover`, `-light`, `-bg`, `-bg-strong`, `-border` variants.

### Spacing
```
--space-xs: 4px     --space-sm: 8px      --space-md: 12px
--space-lg: 16px    --space-xl: 24px     --space-2xl: 32px
--space-page: clamp(24px, 5vw, 80px)
--container-max: 640px   --header-height: 56px
```

### Border Radius
```
--radius-sm: 4px    --radius-md: 8px    --radius-lg: 12px    --radius-full: 9999px
```

### Z-Index
```
--z-base: 0    --z-dropdown: 100    --z-sticky: 200
--z-overlay: 9998    --z-modal: 9999    --z-toast: 10000
```

## Component Classes

### Buttons
| Class | Background | Color | Border |
|-------|-----------|-------|--------|
| `.btn-primary` | #fff (selected-bg) | #000 (selected-text) | none |
| `.btn-secondary` | transparent | text-secondary | border-default |
| `.btn-ghost` | transparent | text-muted | none |
| `.btn-danger` | error | #fff | none |

Sizes: `.btn-sm`, `.btn-lg`, `.btn-icon`

### Cards
| Class | Background | Border | Usage |
|-------|-----------|--------|-------|
| `.card` | bg-card | border-subtle | Standard card |
| `.card-elevated` | bg-elevated | border-default | Elevated card |
| `.card-interactive` | bg-card | border-subtle | Clickable |
| `.card-stat` | bg-surface | border-default | Statistics |

### Form Elements
`.input`, `.input-error`, `.textarea`, `.select`, `.label`, `.label-md`

### Badges
`.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info`, `.badge-accent`, `.badge-neutral`

### Other
`.pill-filter` / `.pill-filter-active`, `.toggle-switch`, `.divider`, `.empty-state`, `.skeleton`

### Animations
`.animate-fade-in`, `.animate-scale-in`, `.animate-slide-up`, `.animate-slide-down`, `.stagger-1` ~ `.stagger-6`

## Interactive States (5-State Rule — MUST follow)

### Primary Button (.btn-primary)
| State | Background | Color | Effect |
|-------|-----------|-------|--------|
| Default | #fff | #000 | — |
| Hover | gray-100 | #000 | translateY(-1px) |
| Active | gray-200 | #000 | translateY(0) |
| Disabled | #fff | #000 | opacity: 0.4 |
| Focus | — | — | outline: 2px solid focus-ring, offset: 2px |

### Secondary Button (.btn-secondary)
| State | Background | Color | Border |
|-------|-----------|-------|--------|
| Default | transparent | text-secondary | border-default |
| Hover | hover-bg | text-primary | border-strong |
| Active | active-bg | text-primary | border-strong |
| Disabled | transparent | — | opacity: 0.4 |

### Interactive Card (.card-interactive)
| State | Background | Border |
|-------|-----------|--------|
| Default | bg-card | border-subtle |
| Hover | bg-elevated | border-default |
| Active | active-bg | — |

### Pill Filter (.pill-filter)
| State | Background | Color | Border |
|-------|-----------|-------|--------|
| Default | transparent | text-secondary | border-default |
| Hover | hover-bg | text-primary | border-strong |
| **Selected** | **#fff** | **#000** | **#fff** |
| Selected+Hover | #e0e0e0 | #000 | #e0e0e0 |
| Disabled | transparent | — | opacity: 0.3 |

## Prohibited

- Color emoji in UI (use Lucide icons or SVG)
- Gradients on backgrounds
- Glow / decorative box-shadow effects
- Using primitive tokens (`--p-*`) directly in Centra components
- Active 状態で文字色だけ変更（背景とセットで変更必須）
