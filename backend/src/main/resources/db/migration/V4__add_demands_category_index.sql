-- V4__add_demands_category_index.sql
-- 为求购表的 category 字段增加索引，优化按分类筛选求购信息的查询；仅新增索引，兼容已有数据。

CREATE INDEX IF NOT EXISTS idx_demands_category ON demands(category);
