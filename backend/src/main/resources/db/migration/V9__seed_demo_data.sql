-- V9__seed_demo_data.sql
-- Seed demo users, items, demands and comments so that the frontend
-- can display realistic example content using the real backend APIs.

-- Demo users
INSERT INTO users (username, password_hash, contact_phone, contact_email, status, role)
VALUES
  ('test_user', 'password', NULL, 'test@example.com', 'active', 'MEMBER'),
  ('digital_lover', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('graduate_2024', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('code_master', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('music_fan', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('math_genius', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('sneaker_head', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('lazy_boy', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('guitar_hero', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('apple_fan', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('bookworm', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('gym_rat', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('coder', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('rider', 'password', NULL, NULL, 'active', 'MEMBER'),
  ('student_user', 'password', NULL, NULL, 'active', 'MEMBER');

-- Demo items (subset of the original frontend mock data)
INSERT INTO items (seller_id, title, description, category, price, condition, status, images, created_at, updated_at)
VALUES
  (
    (SELECT user_id FROM users WHERE username = 'digital_lover'),
    'iPhone 15 Pro Max',
    '99新，电池健康100%，带Apple Care+。',
    'electronics',
    8999.00,
    NULL,
    'active',
    ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800']::text[],
    now() - INTERVAL '1 day',
    now() - INTERVAL '1 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'test_user'),
    '考研英语红宝书',
    '全新未拆封，买多了。',
    'books',
    25.00,
    NULL,
    'active',
    ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800']::text[],
    now() - INTERVAL '2 day',
    now() - INTERVAL '2 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'graduate_2024'),
    '宜家台灯',
    '毕业出，功能正常，送灯泡。',
    'furniture',
    30.00,
    NULL,
    'off',
    ARRAY['https://images.unsplash.com/photo-1507473888900-52e1ad14592d?auto=format&fit=crop&q=80&w=800']::text[],
    now() - INTERVAL '3 day',
    now() - INTERVAL '3 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'code_master'),
    'MacBook Air M1',
    '8+256G，深空灰，轻微使用痕迹，箱说全。',
    'electronics',
    4500.00,
    NULL,
    'active',
    ARRAY['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800']::text[],
    now() - INTERVAL '4 day',
    now() - INTERVAL '4 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'music_fan'),
    '索尼 WH-1000XM4',
    '降噪耳机，音质无敌，耳罩有点磨损，功能完好。',
    'electronics',
    1200.00,
    NULL,
    'active',
    ARRAY['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800']::text[],
    now() - INTERVAL '5 day',
    now() - INTERVAL '5 day'
  );

-- Demo demands (simplified from the original mock data)
INSERT INTO demands (buyer_id, title, description, category, expected_price, status, created_at, updated_at)
VALUES
  (
    (SELECT user_id FROM users WHERE username = 'test_user'),
    '求购二手 iPad Air 5',
    '预算3000左右，要求屏幕无划痕，颜色不限。',
    'electronics',
    3000.00,
    'active',
    now() - INTERVAL '1 day',
    now() - INTERVAL '1 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'bookworm'),
    '收个书架',
    '宿舍用，小一点的，最好是木质的。',
    'furniture',
    35.00,
    'active',
    now() - INTERVAL '2 day',
    now() - INTERVAL '2 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'gym_rat'),
    '求购健身卡',
    '学校附近的健身房，还剩半年左右的最好。',
    'others',
    650.00,
    'active',
    now() - INTERVAL '3 day',
    now() - INTERVAL '3 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'coder'),
    '收个显示器',
    '24寸或27寸，1080P以上，用来写代码。',
    'electronics',
    450.00,
    'active',
    now() - INTERVAL '4 day',
    now() - INTERVAL '4 day'
  );

-- Demo comments attached to one item and one demand
INSERT INTO comments (target_type, target_id, user_id, content, created_at)
SELECT 'item', i.item_id, u.user_id,
       '请问还在吗？',
       now() - INTERVAL '1 hour'
FROM items i
JOIN users u ON u.username = 'digital_lover'
WHERE i.title = '考研英语红宝书'
LIMIT 1;

INSERT INTO comments (target_type, target_id, user_id, content, created_at)
SELECT 'item', i.item_id, u.user_id,
       '可以小刀吗？',
       now() - INTERVAL '30 minutes'
FROM items i
JOIN users u ON u.username = 'graduate_2024'
WHERE i.title = '考研英语红宝书'
LIMIT 1;

INSERT INTO comments (target_type, target_id, user_id, content, created_at)
SELECT 'demand', d.demand_id, u.user_id,
       '我有一张合适的卡，可以私聊。',
       now() - INTERVAL '45 minutes'
FROM demands d
JOIN users u ON u.username = 'gym_rat'
WHERE d.title = '求购健身卡'
LIMIT 1;

INSERT INTO comments (target_type, target_id, user_id, content, created_at)
SELECT 'demand', d.demand_id, u.user_id,
       '同求书架',
       now() - INTERVAL '20 minutes'
FROM demands d
JOIN users u ON u.username = 'sneaker_head'
WHERE d.title = '收个书架'
LIMIT 1;
