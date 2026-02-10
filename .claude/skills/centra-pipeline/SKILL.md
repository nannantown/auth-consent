---
name: centra-pipeline
description: "Centra 専用マルチエージェントパイプライン。PM → Designer → Developer + Backend → Reviewer の流れでタスクを処理し、品質ゲートを通過するまでループする。Triggers: 'centraパイプライン', 'centra pipeline', 'パイプラインで実装', or when the user describes a Centra feature workflow involving multiple agent roles."
---

# Centra Pipeline Orchestrator

Centra プロジェクト専用のエージェントパイプライン。5つの専門エージェントを自動検出し、要件定義からレビューまでを一貫して実行する。

## Agents (Fixed Configuration)

| Role | Agent File | subagent_type | max_turns |
|------|-----------|---------------|-----------|
| PM | `product-manager.md` | `product-manager` | 30 |
| Designer | `ux-designer.md` | `ux-designer` | 30 |
| Developer | `developer.md` | `developer` | 80 |
| Backend | `backend-engineer.md` | `backend-engineer` | 80 |
| Reviewer | `code-reviewer.md` | `code-reviewer` | 40 |

## Pipeline Flow

```
PM (要件定義) → Designer (UI/UX設計) → Developer + Backend (実装) → Reviewer (レビュー)
  ↑                                                                      |
  |                    ← Developer/Backend (修正) ←──── NG ──────────────┘
  |                                                                      |
  └──────────────── PM (最終確認 GO/NO-GO) ←──────── OK ────────────────┘
```

## Phase 0: 事前確認

1. ユーザーのリクエストが不明確な場合は AskUserQuestion で確認する
2. `.claude/agents/` ディレクトリの全 `.md` ファイルを読み取り、エージェントの存在を確認する
3. `.claude/agents/references/` の参照ファイルを確認する

## Phase 1: PM フェーズ (要件定義)

**目的**: 要件定義、ユーザーストーリー、受け入れ基準の策定

Task ツールで `product-manager` エージェントを起動:

```
あなたは Centra のプロダクトマネージャーです。
以下のタスクについて要件を整理してください:

[ユーザーの元のリクエスト]

参照ファイルを確認してコンテキストを把握した上で、以下を含む要件書を作成してください:
1. 解決する課題
2. ユーザーストーリー
3. 機能要件 (MUST / SHOULD / COULD)
4. 受け入れ基準 (testable)
5. スコープ外
6. i18n 要件 (JA/EN の対訳が必要な箇所)

参照: .claude/agents/references/centra-plan.md
```

## Phase 2: Designer フェーズ (設計)

**目的**: UI/UX フロー、レイアウト、インタラクション仕様の策定

Task ツールで `ux-designer` エージェントを起動:

```
あなたは Centra の UX デザイナーです。
PM が以下の要件を定義しました:

[PM の出力]

参照ファイルを確認した上で、以下を設計してください:
1. ユーザーフロー (画面遷移)
2. 画面の状態一覧 (loading / empty / data / error)
3. レイアウト仕様 (具体的なサイズ・間隔)
4. インタラクション仕様 (5状態: default / hover / active / disabled / focus)
5. i18n テキスト一覧 (JA/EN)

参照: .claude/agents/references/design-system.md
```

## Phase 3: Implementation フェーズ (実装)

### 3.1 DB変更が必要な場合: Backend Engineer

Task ツールで `backend-engineer` エージェントを起動:

```
あなたは Centra のバックエンドエンジニアです。
以下の要件と設計に基づいて、DB スキーマ変更を行ってください:

[PM の要件]
[Designer の設計のうち、データ関連部分]

Supabase Project ID: hukpyzempikhxuuwooka
参照: .claude/agents/references/database-schema.md

必要に応じて:
- apply_migration でマイグレーションを適用
- RLS ポリシーを設定
- TypeScript 型定義 (src/types/graph.ts) を更新
```

### 3.2 Frontend Developer

Task ツールで `developer` エージェントを起動:

```
あなたは Centra のフロントエンド開発者です。
以下の要件と設計仕様に基づいて実装してください:

[PM の要件]
[Designer の設計仕様]
[Backend の変更内容 (あれば)]

実装後、npm run build を実行して通ることを確認してください。

注意:
- 全表示テキストは useI18n() 経由 (translations.ts に追加)
- CSS変数とコンポーネントクラスを使用 (globals.css)
- 既存パターンに従う (graph.ts API, supabase client patterns)
```

**Backend と Developer の実行順序:**
- DB スキーマ変更が必要 → Backend を先に実行 → Developer
- DB 変更不要 → Developer のみ実行

## Phase 4: Reviewer フェーズ (レビュー)

**目的**: コード品質、セキュリティ、デザインシステム準拠のチェック

Task ツールで `code-reviewer` エージェントを起動:

```
あなたは Centra のコードレビュアーです。
最近の変更をレビューしてください。

元の要件:
[PM の要件の要約]

以下の 7 観点でチェック:
1. Security (認証、RLS、XSS、入力検証)
2. Type Safety (any 不使用、型定義活用)
3. Design System (CSS変数、コンポーネントクラス、5状態)
4. i18n (翻訳漏れ、ハードコードテキスト)
5. Architecture (Server/Client分離、パターン一貫性)
6. Performance (不要なuse client、N+1)
7. Code Quality (可読性、DRY、エッジケース)

最終判定を APPROVE または REQUEST CHANGES で出してください。
REQUEST CHANGES の場合は具体的な修正箇所とファイル:行番号を明記してください。
```

## Phase 5: ループ制御

### 判定ルール
- **APPROVE**: 次のフェーズに進む
- **REQUEST CHANGES**: Developer / Backend に戻して修正

### ループ制限
- Reviewer → Developer/Backend 修正ループ: **最大 3 回**
- PM 最終確認 → Developer 修正ループ: **最大 2 回**
- 超過時: ユーザーに判断を仰ぐ (AskUserQuestion)

### 修正指示プロンプト

```
レビューで以下の問題が指摘されました:

[レビュアー / PM の指摘事項]

これらを修正してください。修正後、npm run build を実行して確認してください。
```

## Phase 6: PM 最終確認

**目的**: 実装が要件を満たしているかの検証

Task ツールで `product-manager` エージェントを起動:

```
あなたは Centra の PM です。以下の要件に対して、実装が完了しました。
レビュアーも承認済みです。

元の要件:
[Phase 1 の要件書]

実装されたコードを読み、要件チェックリストの各項目を PASS / FAIL で判定してください。

チェック項目:
- [ ] 機能要件の全 MUST 項目が実装されている
- [ ] ユビキタス言語が正しく使われている
- [ ] i18n (JA/EN) が漏れなく対応されている
- [ ] データモデルの整合性が保たれている
- [ ] 受け入れ基準を満たしている

最終判定を APPROVE または REQUEST CHANGES で出してください。
```

## Phase 7: 完了報告

全フェーズ通過後、以下のサマリーを出力する:

```markdown
## Centra Pipeline 完了

| Role | Result | Loops |
|------|--------|-------|
| PM (要件) | Done | 0 |
| Designer | Done | 0 |
| Backend | Done / Skipped | N |
| Developer | Done | N |
| Reviewer | APPROVE | N |
| PM (最終) | APPROVE | N |

### 変更ファイル一覧
[git diff --name-only の出力]

### 変更サマリー
[各ファイルの変更概要]
```

## Execution Notes

- 各エージェントの `subagent_type` は上記テーブルの値をそのまま使う
- 前のフェーズの出力を次のフェーズのプロンプトに必ず含める (コンテキスト引き継ぎ)
- Developer / Backend には `max_turns: 80` を設定
- Reviewer には `max_turns: 40` を設定
- PM / Designer には `max_turns: 30` を設定
- 参照ファイルのパスは `.claude/agents/references/` 配下で固定
- ユーザーのリクエストが不明確な場合は AskUserQuestion で確認してからパイプライン開始
