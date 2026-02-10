# Centra Project Plan

## Vision

Centra は個人のあらゆるデータを一元管理し、OAuth 2.0 を通じてサードパーティアプリに安全に共有する Personal Data Management Platform & Identity Provider。ユーザーが自分のデータの主権を持ち、必要なときに必要な範囲だけを外部に提供できる世界を実現する。

## Ubiquitous Language

| 用語 | 英語 | 定義 |
|------|------|------|
| **Space (スペース)** | Category | ユーザーが作成する情報のグルーピング単位。「基本情報」「キャリア」「健康」など |
| **Module (モジュール)** | NodeType | Space 内のデータの型定義。「Profile」「Skill」「WorkExperience」など |
| **Item (アイテム)** | Node | Module に基づく個別のデータエントリ。JSONB properties に値を格納 |
| **Tag (タグ)** | Edge.relation_type | Item 間の関係の種類。「related_to」「has_skill」「part_of」など |
| **Link (リンク)** | Edge | 2つの Item をつなぐ関係。source → target + relation_type |

## Data Model Overview

### Tables

```
categories (Space)
  ├── id: UUID (PK)
  ├── user_id: UUID (FK → auth.users)
  ├── slug: TEXT (UNIQUE per user)
  ├── name / name_en: TEXT
  ├── icon, color, description: TEXT
  ├── template_slug: TEXT (preset reference)
  ├── display_order: INTEGER
  └── is_system: BOOLEAN

nodes (Item)
  ├── id: UUID (PK)
  ├── user_id: UUID (FK → auth.users)
  ├── category_id: UUID (FK → categories)
  ├── node_type: TEXT (Module name)
  ├── title: TEXT
  ├── properties: JSONB
  ├── display_order: INTEGER
  └── is_archived: BOOLEAN

edges (Link)
  ├── id: UUID (PK)
  ├── user_id: UUID (FK → auth.users)
  ├── source_id: UUID (FK → nodes)
  ├── target_id: UUID (FK → nodes)
  ├── relation_type: TEXT (Tag)
  ├── properties: JSONB
  └── UNIQUE(source_id, target_id, relation_type)

node_type_schemas (Module definition)
  ├── id: UUID (PK)
  ├── user_id: UUID (nullable = system-wide)
  ├── node_type: TEXT
  ├── display_name / display_name_en: TEXT
  ├── icon: TEXT
  ├── schema: JSONB
  └── is_system: BOOLEAN

sharing_rules (OAuth scope mapping)
  ├── id: UUID (PK)
  ├── user_id: UUID (FK → auth.users)
  ├── node_id / category_id / node_type: optional filters
  ├── property_path: TEXT (JSONB path)
  ├── is_shareable: BOOLEAN
  └── scope: TEXT (OAuth scope name)
```

### TypeScript Types

定義: `src/types/graph.ts`
API: `src/lib/graph.ts`

Built-in Node Types: `Profile`, `Skill`, `WorkExperience`, `Goal`, `Product`, `RoadmapItem`, `KPI`, `HealthRecord`, `LearningItem`

Relation Types: `related_to`, `has_skill`, `part_of`, `requires`, `achieved_by`, `tracks`, `contacts`

## Phase Plan

### Phase 1: Core Data Management (Current)
- Profile Space (基本情報) の完全な CRUD
- Career Space: Skills, WorkExperience ノード
- Goals Space: Goal ノード
- Category (Space) の追加・削除・並び替え
- Node の作成・編集・アーカイブ・削除
- Edge (Link) の作成・削除

### Phase 2: Advanced Features
- ノード間のグラフ可視化
- 検索・フィルタリング
- カスタム NodeType スキーマ (ユーザー定義 Module)
- データのインポート/エクスポート

### Phase 3: Sharing & Integration
- Sharing Rules による細粒度アクセス制御
- OAuth scope と sharing_rules の連携
- サードパーティアプリへのデータ提供 API
- データポータビリティ (JSON-LD / RDF)

## Key Decisions

1. **ユーザー自由作成**: Space (Category) はテンプレートから選択するが、将来的にはユーザーが自由に作成可能
2. **ネットワーク構造**: Node + Edge のグラフモデルで、データ間の関係を柔軟に表現
3. **DDD + PKG**: Domain-Driven Design + Personal Knowledge Graph のハイブリッドアーキテクチャ
4. **JSONB properties**: スキーマレスな properties フィールドで、Module ごとに異なるデータ構造に対応
5. **RLS ベース**: 全テーブルで Row Level Security を適用。user_id ベースの完全な分離
