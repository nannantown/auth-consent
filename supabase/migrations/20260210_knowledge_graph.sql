-- ============================================
-- Centra Knowledge Graph Schema Migration
-- From flat structure → Graph-based model
-- ============================================

-- ============================================
-- A. categories (user-created spaces)
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
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

CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_categories_slug ON categories(user_id, slug);

-- ============================================
-- B. nodes (data entries)
-- ============================================

CREATE TABLE IF NOT EXISTS nodes (
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

CREATE INDEX idx_nodes_user ON nodes(user_id);
CREATE INDEX idx_nodes_category ON nodes(category_id);
CREATE INDEX idx_nodes_type ON nodes(node_type);
CREATE INDEX idx_nodes_properties ON nodes USING GIN (properties);

-- ============================================
-- C. edges (relations between nodes)
-- ============================================

CREATE TABLE IF NOT EXISTS edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_id, target_id, relation_type)
);

CREATE INDEX idx_edges_source ON edges(source_id);
CREATE INDEX idx_edges_target ON edges(target_id);
CREATE INDEX idx_edges_type ON edges(relation_type);
CREATE INDEX idx_edges_user ON edges(user_id);

-- ============================================
-- D. node_type_schemas (optional type defs)
-- ============================================

CREATE TABLE IF NOT EXISTS node_type_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  display_name_en TEXT,
  icon TEXT,
  schema JSONB DEFAULT '{}',
  is_system BOOLEAN DEFAULT false,
  UNIQUE(COALESCE(user_id, '00000000-0000-0000-0000-000000000000'::uuid), node_type)
);

-- ============================================
-- E. sharing_rules (OAuth scope mapping)
-- ============================================

CREATE TABLE IF NOT EXISTS sharing_rules (
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

CREATE INDEX idx_sharing_rules_user ON sharing_rules(user_id);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_select ON categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY categories_insert ON categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY categories_update ON categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY categories_delete ON categories FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY nodes_select ON nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY nodes_insert ON nodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY nodes_update ON nodes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY nodes_delete ON nodes FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY edges_select ON edges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY edges_insert ON edges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY edges_update ON edges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY edges_delete ON edges FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE node_type_schemas ENABLE ROW LEVEL SECURITY;
CREATE POLICY schemas_select ON node_type_schemas FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY schemas_insert ON node_type_schemas FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY schemas_update ON node_type_schemas FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY schemas_delete ON node_type_schemas FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE sharing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY sharing_rules_select ON sharing_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY sharing_rules_insert ON sharing_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY sharing_rules_update ON sharing_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY sharing_rules_delete ON sharing_rules FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Updated_at trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER nodes_updated_at BEFORE UPDATE ON nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sharing_rules_updated_at BEFORE UPDATE ON sharing_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Data Migration from existing tables
-- (Run after verifying existing data)
-- ============================================

-- Migration Step 1: user_categories → categories
-- INSERT INTO categories (user_id, slug, name, name_en, icon, color, description, display_order, is_system)
-- SELECT
--   uc.user_id,
--   uc.category_slug,
--   CASE uc.category_slug
--     WHEN 'profile' THEN '基本情報'
--     WHEN 'goals' THEN '目標・ビジョン'
--     WHEN 'career' THEN 'キャリア'
--     WHEN 'health' THEN '健康'
--     WHEN 'finance' THEN 'ファイナンス'
--     WHEN 'learning' THEN '学習'
--     WHEN 'relationships' THEN '人間関係'
--     WHEN 'lifestyle' THEN 'ライフスタイル'
--     WHEN 'housing' THEN '住居・不動産'
--     WHEN 'business' THEN 'ビジネス資産'
--     WHEN 'product' THEN 'プロダクト管理'
--     ELSE uc.category_slug
--   END,
--   CASE uc.category_slug
--     WHEN 'profile' THEN 'Profile'
--     WHEN 'goals' THEN 'Goals & Vision'
--     WHEN 'career' THEN 'Career'
--     WHEN 'health' THEN 'Health'
--     WHEN 'finance' THEN 'Finance'
--     WHEN 'learning' THEN 'Learning'
--     WHEN 'relationships' THEN 'Relationships'
--     WHEN 'lifestyle' THEN 'Lifestyle'
--     WHEN 'housing' THEN 'Housing'
--     WHEN 'business' THEN 'Business Assets'
--     WHEN 'product' THEN 'Product Management'
--     ELSE uc.category_slug
--   END,
--   NULL, NULL, NULL,
--   uc.display_order,
--   CASE WHEN uc.category_slug = 'profile' THEN true ELSE false END
-- FROM user_categories uc
-- WHERE uc.is_enabled = true;

-- Migration Step 2: profiles → nodes (node_type = 'Profile')
-- INSERT INTO nodes (user_id, category_id, node_type, title, properties)
-- SELECT
--   p.user_id,
--   c.id,
--   'Profile',
--   COALESCE(p.last_name, '') || ' ' || COALESCE(p.first_name, ''),
--   jsonb_build_object(
--     'first_name', p.first_name,
--     'last_name', p.last_name,
--     'first_name_kana', p.first_name_kana,
--     'last_name_kana', p.last_name_kana,
--     'phone', p.phone,
--     'postal_code', p.postal_code,
--     'prefecture', p.prefecture,
--     'city', p.city,
--     'address_line1', p.address_line1,
--     'address_line2', p.address_line2,
--     'date_of_birth', p.date_of_birth,
--     'gender', p.gender,
--     'avatar_url', p.avatar_url
--   )
-- FROM profiles p
-- JOIN categories c ON c.user_id = p.user_id AND c.slug = 'profile';

-- Migration Step 3: products → nodes (node_type = 'Product')
-- INSERT INTO nodes (user_id, category_id, node_type, title, properties)
-- SELECT
--   pr.user_id,
--   c.id,
--   'Product',
--   pr.name,
--   jsonb_build_object(
--     'name', pr.name,
--     'description', pr.description,
--     'status', pr.status,
--     'vision', pr.vision,
--     'mission', pr.mission
--   )
-- FROM products pr
-- JOIN categories c ON c.user_id = pr.user_id AND c.slug = 'product';
