-- V6__add_reviews_table.sql
-- 新增 reviews 表，用于对用户/商品/求购/订单进行评分与评价，区分公开评价与内部备注。
-- 仅新增表与索引，对现有数据兼容。

CREATE TABLE IF NOT EXISTS reviews (
  review_id        BIGSERIAL PRIMARY KEY,
  reviewer_user_id BIGINT       NOT NULL REFERENCES users(user_id),
  target_type      VARCHAR(16)  NOT NULL CHECK (target_type IN ('user','item','demand','order')),
  target_id        BIGINT       NOT NULL,
  rating           SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment          TEXT,
  internal_note    TEXT,
  is_public        BOOLEAN      NOT NULL DEFAULT TRUE,
  status           VARCHAR(16)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden','deleted')),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reviews_target   ON reviews(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_user_id);
