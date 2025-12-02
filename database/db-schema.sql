-- 二手交易平台 数据库 DDL（PostgreSQL 15）
-- 选择 PostgreSQL 的理由：原生 CHECK 约束、JSON/数组类型支持、可靠的并发与事务，适合后续扩展搜索/索引。

-- 可选：CREATE SCHEMA
-- CREATE SCHEMA IF NOT EXISTS marketplace;
-- SET search_path TO marketplace, public;

CREATE TABLE IF NOT EXISTS users (
  user_id        BIGSERIAL PRIMARY KEY,
  username       VARCHAR(50)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  contact_phone  VARCHAR(50),
  contact_email  VARCHAR(100),
  status         VARCHAR(16)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

CREATE TABLE IF NOT EXISTS items (
  item_id     BIGSERIAL PRIMARY KEY,
  seller_id   BIGINT      NOT NULL REFERENCES users(user_id),
  title       VARCHAR(100) NOT NULL,
  desc        TEXT,
  category    VARCHAR(50),
  price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
  condition   VARCHAR(20),
  status      VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','active','off','deleted')),
  images      TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_items_seller   ON items(seller_id);
CREATE INDEX IF NOT EXISTS idx_items_status   ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_created  ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_active_category ON items(category) WHERE status='active';

CREATE TABLE IF NOT EXISTS demands (
  demand_id   BIGSERIAL PRIMARY KEY,
  buyer_id    BIGINT       NOT NULL REFERENCES users(user_id),
  title       VARCHAR(100) NOT NULL,
  desc        TEXT,
  category    VARCHAR(50),
  expected_price NUMERIC(10,2) CHECK (expected_price > 0),
  status      VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','active','off','deleted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_demands_buyer   ON demands(buyer_id);
CREATE INDEX IF NOT EXISTS idx_demands_status  ON demands(status);
CREATE INDEX IF NOT EXISTS idx_demands_created ON demands(created_at DESC);

CREATE TABLE IF NOT EXISTS offers (
  offer_id     BIGSERIAL PRIMARY KEY,
  target_type  VARCHAR(10) NOT NULL CHECK (target_type IN ('item','demand')),
  target_id    BIGINT      NOT NULL,
  offerer_id   BIGINT      NOT NULL REFERENCES users(user_id),
  amount       NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  message      TEXT,
  status       VARCHAR(16) NOT NULL DEFAULT 'created' CHECK (status IN ('created','accepted','rejected','canceled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_offers_target     ON offers(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_offers_offerer    ON offers(offerer_id);
CREATE INDEX IF NOT EXISTS idx_offers_created_at ON offers(created_at DESC);

CREATE TABLE IF NOT EXISTS comments (
  comment_id  BIGSERIAL PRIMARY KEY,
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('item','demand')),
  target_id   BIGINT      NOT NULL,
  user_id     BIGINT      NOT NULL REFERENCES users(user_id),
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user   ON comments(user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id        BIGSERIAL PRIMARY KEY,
  level         VARCHAR(10) NOT NULL,
  actor_user_id BIGINT REFERENCES users(user_id),
  action        VARCHAR(50) NOT NULL,
  entity_type   VARCHAR(20),
  entity_id     BIGINT,
  message       TEXT,
  ip            VARCHAR(45),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);

-- 备注：
-- 1）offers/comments 通过 (target_type, target_id) 关联到 items/demands，外键由应用层校验；
-- 2）删除策略：优先软删（deleted 状态 + deleted_at），避免硬删导致的引用破坏；
-- 3）图片暂存为 items.images 数组；后续如需更细粒度管理，可新增 item_images 表（item_id, url, sort）。
