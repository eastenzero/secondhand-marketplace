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
  role           VARCHAR(20)  NOT NULL DEFAULT 'MEMBER',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

CREATE TABLE IF NOT EXISTS items (
  item_id     BIGSERIAL PRIMARY KEY,
  seller_id   BIGINT      NOT NULL REFERENCES users(user_id),
  title       VARCHAR(100) NOT NULL,
  description TEXT,
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
  description TEXT,
  category    VARCHAR(50),
  expected_price NUMERIC(10,2) CHECK (expected_price > 0),
  status      VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending','active','off','deleted')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_demands_buyer   ON demands(buyer_id);
CREATE INDEX IF NOT EXISTS idx_demands_status  ON demands(status);
CREATE INDEX IF NOT EXISTS idx_demands_category ON demands(category);
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

CREATE TABLE IF NOT EXISTS orders (
  order_id       BIGSERIAL PRIMARY KEY,
  buyer_id       BIGINT       NOT NULL REFERENCES users(user_id),
  seller_id      BIGINT       NOT NULL REFERENCES users(user_id),
  offer_id       BIGINT       REFERENCES offers(offer_id),
  total_amount   NUMERIC(10,2) NOT NULL CHECK (total_amount > 0),
  status         VARCHAR(16)   NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','canceled','completed')),
  shipping_name   VARCHAR(100) NOT NULL,
  shipping_phone  VARCHAR(50)  NOT NULL,
  shipping_address TEXT        NOT NULL,
  payment_method  VARCHAR(32),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_orders_buyer   ON orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller  ON orders(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status  ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_offer   ON orders(offer_id);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id BIGSERIAL PRIMARY KEY,
  order_id      BIGINT      NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  target_type   VARCHAR(10) NOT NULL CHECK (target_type IN ('item','demand')),
  target_id     BIGINT      NOT NULL,
  quantity      INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price         NUMERIC(10,2) NOT NULL CHECK (price > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_target ON order_items(target_type, target_id);

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

CREATE TABLE IF NOT EXISTS threads (
  thread_id         BIGSERIAL PRIMARY KEY,
  target_type       VARCHAR(16)  NOT NULL CHECK (target_type IN ('item','demand','order','system')),
  target_id         BIGINT,
  created_by_user_id BIGINT      NOT NULL REFERENCES users(user_id),
  status            VARCHAR(16)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','muted','closed')),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_threads_target ON threads(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_creator ON threads(created_by_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  message_id        BIGSERIAL PRIMARY KEY,
  thread_id         BIGINT      NOT NULL REFERENCES threads(thread_id) ON DELETE CASCADE,
  sender_user_id    BIGINT      NOT NULL REFERENCES users(user_id),
  recipient_user_id BIGINT      NOT NULL REFERENCES users(user_id),
  content           TEXT        NOT NULL,
  is_read           BOOLEAN     NOT NULL DEFAULT FALSE,
  read_at           TIMESTAMPTZ,
  status            VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active','recalled','deleted')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_unread ON messages(recipient_user_id) WHERE is_read = FALSE;

CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGSERIAL PRIMARY KEY,
  user_id         BIGINT       NOT NULL REFERENCES users(user_id),
  type            VARCHAR(32)  NOT NULL,
  title           VARCHAR(200),
  content         TEXT,
  related_type    VARCHAR(16),
  related_id      BIGINT,
  is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  status          VARCHAR(16)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','deleted')),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notifications_user       ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = FALSE;

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

CREATE TABLE IF NOT EXISTS reports (
  report_id        BIGSERIAL PRIMARY KEY,
  reporter_user_id BIGINT       NOT NULL REFERENCES users(user_id),
  target_type      VARCHAR(16)  NOT NULL CHECK (target_type IN ('user','item','demand','offer','comment','order','message','review')),
  target_id        BIGINT       NOT NULL,
  category         VARCHAR(32),
  reason           TEXT,
  status           VARCHAR(16)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','resolved','rejected')),
  handled_by_user_id BIGINT     REFERENCES users(user_id),
  resolution       TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  resolved_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reports_target   ON reports(target_type, target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status   ON reports(status);

CREATE TABLE IF NOT EXISTS user_bans (
  ban_id           BIGSERIAL PRIMARY KEY,
  user_id          BIGINT       NOT NULL REFERENCES users(user_id),
  reason           TEXT,
  status           VARCHAR(16)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  start_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  end_at           TIMESTAMPTZ,
  created_by_user_id BIGINT     REFERENCES users(user_id),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_bans_user ON user_bans(user_id, status);

-- 备注：
-- 1）offers/comments 通过 (target_type, target_id) 关联到 items/demands，外键由应用层校验；
-- 2）删除策略：优先软删（deleted 状态 + deleted_at），避免硬删导致的引用破坏；
-- 3）图片暂存为 items.images 数组；后续如需更细粒度管理，可新增 item_images 表（item_id, url, sort）。
