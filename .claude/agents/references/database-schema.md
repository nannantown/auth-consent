# Centra Database Schema Reference

## Supabase Project

- **Project ID**: `hukpyzempikhxuuwooka`
- **URL**: Stored in `NEXT_PUBLIC_SUPABASE_URL` env var
- **MCP Tool Prefix**: `mcp__supabase-auth__`

## Tables

### categories (Space)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  icon TEXT,
  color TEXT,
  description TEXT,
  template_slug TEXT,
  display_order INTEGER DEFAULT 0,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, slug)
);
```

Indexes: `idx_categories_user(user_id)`, `idx_categories_slug(user_id, slug)`

### nodes (Item)

```sql
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL,
  title TEXT,
  properties JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Indexes: `idx_nodes_user(user_id)`, `idx_nodes_category(category_id)`, `idx_nodes_type(node_type)`, `idx_nodes_properties USING GIN (properties)`

### edges (Link)

```sql
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_id, target_id, relation_type)
);
```

Indexes: `idx_edges_source(source_id)`, `idx_edges_target(target_id)`, `idx_edges_type(relation_type)`, `idx_edges_user(user_id)`

### node_type_schemas (Module definition)

```sql
CREATE TABLE node_type_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- NULL = system-wide
  node_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  display_name_en TEXT,
  icon TEXT,
  schema JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  UNIQUE(COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), node_type)
);
```

### sharing_rules (OAuth scope mapping)

```sql
CREATE TABLE sharing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID REFERENCES nodes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  node_type TEXT,
  property_path TEXT,
  is_shareable BOOLEAN DEFAULT false,
  scope TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Index: `idx_sharing_rules_user(user_id)`

## RLS Policies

All tables have RLS enabled with the same pattern:

```sql
-- SELECT / INSERT / UPDATE / DELETE
-- All operations restricted to: auth.uid() = user_id
-- Exception: node_type_schemas SELECT allows user_id IS NULL (system schemas)
```

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| categories | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| nodes | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| edges | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| node_type_schemas | `user_id IS NULL OR auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| sharing_rules | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |

## Triggers

```sql
-- updated_at auto-update on: categories, nodes, sharing_rules
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
```

## Graph Traversal Pattern

### Get related nodes (2-hop)

```sql
-- Get all nodes connected to a given node via edges
SELECT n.*, e.relation_type,
  CASE WHEN e.source_id = $1 THEN 'outgoing' ELSE 'incoming' END as direction
FROM edges e
JOIN nodes n ON n.id = CASE WHEN e.source_id = $1 THEN e.target_id ELSE e.source_id END
WHERE e.source_id = $1 OR e.target_id = $1;
```

### Recursive CTE (multi-hop traversal)

```sql
WITH RECURSIVE graph AS (
  -- Base: direct connections
  SELECT target_id as node_id, 1 as depth
  FROM edges WHERE source_id = $1
  UNION
  SELECT e.target_id, g.depth + 1
  FROM edges e JOIN graph g ON e.source_id = g.node_id
  WHERE g.depth < $max_depth
)
SELECT DISTINCT n.* FROM graph g JOIN nodes n ON n.id = g.node_id;
```

## Supabase MCP Tool Usage

### Querying data

```
Tool: mcp__supabase-auth__execute_sql
Parameters:
  project_id: "hukpyzempikhxuuwooka"
  query: "SELECT * FROM categories WHERE user_id = '...' ORDER BY display_order"
```

### Applying migrations

```
Tool: mcp__supabase-auth__apply_migration
Parameters:
  project_id: "hukpyzempikhxuuwooka"
  name: "descriptive_migration_name"
  statements: ["CREATE TABLE ...", "CREATE INDEX ..."]
```

### Listing tables

```
Tool: mcp__supabase-auth__list_tables
Parameters:
  project_id: "hukpyzempikhxuuwooka"
```

### Checking logs

```
Tool: mcp__supabase-auth__get_logs
Parameters:
  project_id: "hukpyzempikhxuuwooka"
  service: "postgres"
```

## Migration File

Location: `supabase/migrations/20260210_knowledge_graph.sql`
Contains: Full schema creation + RLS policies + triggers + commented migration scripts from legacy tables
