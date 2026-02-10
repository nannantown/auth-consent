# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Centra is a personal data management platform and OAuth 2.0 identity provider (IdP). Users manage their personal data across categories, and third-party applications can request access via OAuth authorization flows.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run pages:build  # Build for Cloudflare Workers (OpenNextJS)
npm run preview      # Local Cloudflare preview (wrangler dev)
npm run deploy       # Deploy to Cloudflare Workers
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 + custom design system in `globals.css`
- **Database/Auth**: Supabase (PostgreSQL + GoTrue Auth)
- **Deployment**: Cloudflare Workers via OpenNextJS

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/oauth/         # OAuth decision endpoint (approve/deny)
│   ├── auth/callback/     # Email verification & OAuth code exchange
│   ├── oauth/consent/     # OAuth consent screen
│   ├── dashboard/         # Protected user dashboard
│   └── [auth pages]/      # login, signup, forgot-password, reset-password
├── components/            # React components (ui/, categories/, profile/)
├── lib/                   # Utilities & clients
│   ├── supabase.ts        # Browser Supabase client
│   ├── supabase-server.ts # Server Supabase client (SSR)
│   └── i18n/              # Internationalization (JA/EN)
└── types/                 # TypeScript type definitions
```

### OAuth Authorization Flow

1. Client app redirects user to `/oauth/consent?authorization_id={id}`
2. Server fetches authorization details from Supabase GoTrue REST API
3. Unauthenticated users redirect to `/login` with `authorization_id` preserved
4. User approves/denies → POST to `/api/oauth/decision`
5. Decision endpoint calls Supabase OAuth methods, redirects back to client

### Supabase Clients

- **Browser**: `createClient()` from `lib/supabase.ts`
- **Server**: `createServerSupabaseClient()` from `lib/supabase-server.ts`
- Sessions managed via cookies using `@supabase/ssr`

### Internationalization

```tsx
const { t, language, setLanguage } = useI18n()
// Access translations: t.login.title, t.dashboard.welcome
```

Languages: Japanese (ja), English (en). Translations in `lib/i18n/translations.ts`.

## Design System

Dark-first minimal design. CSS variables defined in `globals.css`:

```css
/* Backgrounds: #0a0a0a → #111111 → #141414 → #1a1a1a */
/* Text: #ffffff → #a0a0a0 → #666666 */
/* Borders: rgba(255,255,255, 0.06/0.12/0.20) */
/* Semantic: success #22c55e, warning #f59e0b, error #ef4444, info #3b82f6 */
```

Component classes: `.btn`, `.btn-primary`, `.btn-secondary`, `.card`, `.card-elevated`, `.card-interactive`, `.input`, `.label`

Animation classes: `.animate-fade-in`, `.animate-scale-in`, `.stagger-1` ~ `.stagger-4`

## Environment Variables

Required in Cloudflare Pages settings (see `.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for OAuth authorization lookups)

## Key Patterns

- Protected routes check `supabase.auth.getUser()` and redirect to `/login`
- No Next.js middleware; auth checks are in page components
- Forms are separate client components (e.g., `login-form.tsx`)
- Error states redirect to `/auth/error` with message in search params

## Agents & Pipeline

### Agents (`.claude/agents/`)

5つの専門エージェントでタスクを分業する:

| Agent | File | Role |
|-------|------|------|
| **PM** | `product-manager.md` | 要件定義、受け入れ基準、最終 GO/NO-GO |
| **Designer** | `ux-designer.md` | UI/UX フロー設計、画面仕様書 |
| **Developer** | `developer.md` | フロントエンド実装 (Next.js/React/TS) |
| **Backend** | `backend-engineer.md` | Supabase DB スキーマ、マイグレーション、RLS |
| **Reviewer** | `code-reviewer.md` | セキュリティ、型安全性、デザインシステム準拠 |

### Shared References (`.claude/agents/references/`)

エージェントが参照する共有ナレッジ:
- `centra-plan.md` - ビジョン、ユビキタス言語、データモデル、フェーズ計画
- `design-system.md` - CSS トークン、コンポーネント仕様、5状態ルール
- `database-schema.md` - テーブル定義、RLS、Supabase MCP 使用手順

### Pipeline Skill

`centra-pipeline` スキルで全エージェントを順番に実行:

```
PM → Designer → Developer + Backend → Reviewer → PM (最終確認)
```

使い方: タスクを説明した上で「centra パイプラインで実装して」と指示する

### Agent Teams

Claude Code の実験的機能。複数の Claude Code インスタンスが並列に動作し、互いにメッセージングしながら協働する。既存の centra-pipeline を**置き換えるものではなく、補完する**もの。

#### centra-pipeline との使い分け

| 手法 | 用途 | 特徴 |
|------|------|------|
| **centra-pipeline** | 新機能の実装 | PM→Designer→Developer→Reviewer の品質ゲート付き逐次フロー |
| **Agent Teams** | 並列調査・レビュー・独立モジュール実装 | 複数インスタンスが同時作業、メッセージングで連携 |

#### チームテンプレート例

**並列コードレビュー（3観点）**
```
Create a team of 3 teammates:
1. Security reviewer - check OAuth flow, token handling, and RLS policies
2. Design system reviewer - verify component usage, 5-state rules, dark theme compliance
3. Performance reviewer - analyze bundle size, re-renders, and query efficiency
Each reviewer writes findings, then synthesize into a unified review.
```

**並列調査（バグ・アーキテクチャ）**
```
Create a team of 2 teammates:
1. Investigate the auth callback flow in src/app/auth/callback/
2. Investigate the OAuth consent flow in src/app/oauth/consent/
Share findings and identify the root cause of [issue].
```

**並列実装（Frontend + Backend）**
```
Create a team of 2 teammates:
1. Frontend: implement the UI components in src/components/
2. Backend: create the Supabase migration and RLS policies in supabase/
Coordinate on the data interface before starting implementation.
```

#### 注意事項

- トークン消費が通常の N 倍（N = チームメンバー数）になる
- 同じファイルを複数メンバーが同時編集するとコンフリクトするため、担当ファイルを明確に分ける
- Shift+Up/Down でチームメンバー間を切り替え可能
