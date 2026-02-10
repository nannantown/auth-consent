# Centra Design System Reference

## Philosophy

- **Minimal** - 不要な要素を排除
- **Dark-first** - ダークテーマをデフォルト
- **High contrast** - 重要な要素は明確に目立たせる
- **Refined** - 繊細なボーダーとシャドウで深みを出す

## Color Tokens (globals.css)

### Backgrounds
```css
--bg-primary: #0a0a0a;        /* メイン背景 */
--bg-secondary: #111111;       /* セクション背景 */
--bg-card: #141414;            /* カード背景 */
--bg-elevated: #1a1a1a;        /* 浮いた要素 */
```

### Text
```css
--text-primary: #ffffff;
--text-secondary: #a0a0a0;
--text-muted: #666666;
```

### Borders
```css
--border-subtle: rgba(255, 255, 255, 0.06);
--border-default: rgba(255, 255, 255, 0.12);
--border-strong: rgba(255, 255, 255, 0.20);
```

### Interactive States
```css
--hover-bg: rgba(255, 255, 255, 0.03);
--active-bg: rgba(255, 255, 255, 0.06);
--selected-bg: #ffffff;
--selected-text: #000000;
```

### Semantic Colors
```css
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

## Spacing & Layout

```css
--space-page: clamp(24px, 5vw, 80px);
--container-max: 640px;
--header-height: 56px;
```

## Border Radius

```css
--radius-sm: 4px;    /* 小要素 */
--radius-md: 8px;    /* カード、ボタン、入力 */
--radius-full: 9999px; /* Pill */
```

## Typography

```css
--font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
--letter-spacing-tight: 0.02em;
--letter-spacing-normal: 0.04em;
--letter-spacing-wide: 0.1em;
```

- Label: 10px, uppercase, letter-spacing: 0.5px, color: text-muted
- Body: 12-13px, weight: 400-500
- Emphasis: 13px, weight: 600

## Transitions

```css
--transition-fast: 150ms ease;   /* 軽いインタラクション */
--transition-base: 200ms ease;   /* ボタン、カード */
--transition-slow: 300ms ease;   /* モーダル、パネル */
```

## Component Classes

### Buttons

| Class | Background | Color | Border |
|-------|-----------|-------|--------|
| `.btn-primary` | #fff (selected-bg) | #000 (selected-text) | none |
| `.btn-secondary` | transparent | text-secondary | border-default |
| `.btn-ghost` | transparent | text-muted | none |
| `.btn-danger` | error | #fff | none |

### Cards

| Class | Background | Border | Usage |
|-------|-----------|--------|-------|
| `.card` | bg-card | border-subtle | 標準カード |
| `.card-elevated` | bg-elevated | border-default | 浮いたカード |
| `.card-interactive` | bg-card | border-subtle | クリッカブル |

### Inputs

`.input` - bg-secondary, border-default, radius-md, 13px

### Labels

`.label` - 10px, uppercase, text-muted, letter-spacing: 0.5px

### Dividers

`.divider` - border-top: 1px solid border-subtle

## Interactive States (5 States - MUST follow)

すべてのインタラクティブ要素は以下の5状態を定義すること:

### Primary Button (.btn-primary)

| State | Background | Color | Effect |
|-------|-----------|-------|--------|
| Default | #fff | #000 | - |
| Hover | #f0f0f0 | #000 | translateY(-1px) |
| Active | #e0e0e0 | #000 | translateY(0) |
| Disabled | #fff | #000 | opacity: 0.4 |
| Focus | - | - | outline: 2px solid text-secondary, offset: 2px |

### Secondary Button (.btn-secondary)

| State | Background | Color | Border |
|-------|-----------|-------|--------|
| Default | transparent | text-secondary | border-default |
| Hover | hover-bg | text-primary | border-strong |
| Active | active-bg | text-primary | border-strong |
| Disabled | transparent | - | opacity: 0.4 |

### Interactive Card (.card-interactive)

| State | Background | Border |
|-------|-----------|--------|
| Default | bg-card | border-subtle |
| Hover | bg-elevated | border-default |
| Active | active-bg | - |

### Tab / Filter (Pill Style)

| State | Background | Color | Border |
|-------|-----------|-------|--------|
| Default | transparent | rgba(255,255,255,0.7) | rgba(255,255,255,0.15) |
| Hover | rgba(255,255,255,0.08) | #fff | rgba(255,255,255,0.25) |
| **Selected** | **#fff** | **#000** | **#fff** |
| Selected+Hover | #e8e8e8 | #000 | #e8e8e8 |
| Disabled | transparent | - | opacity: 0.3 |

## Animations

```css
@keyframes fade-in { from { opacity: 0; translateY(8px) } to { opacity: 1; translateY(0) } }
@keyframes scale-in { from { opacity: 0; scale(0.96) } to { opacity: 1; scale(1) } }
```

- `.animate-fade-in` / `.animate-scale-in`
- `.stagger-1` ~ `.stagger-4` (0.05s increments)

## Prohibited

- Color emoji in UI (use Lucide icons or SVG)
- Gradients (flat colors only)
- Glow / box-shadow effects
- Marketing-style superlatives in copy
