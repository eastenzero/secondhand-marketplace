-- seed-demands-extra.sql
-- 额外的校园求购数据种子，用于在真实后端环境下丰富 /api/demands 的返回结果。
-- 使用方式示例（本机有 psql 且能连到数据库时）：
--   psql -h <host> -p <port> -U <user> -d <database> -f database/seed-demands-extra.sql

INSERT INTO demands (buyer_id, title, description, category, expected_price, status, created_at, updated_at)
VALUES
  (
    (SELECT user_id FROM users WHERE username = 'math_genius'),
    '求购高等数学教材（同济版）',
    '大一工科生用，要求页码完整，最好有少量干净的笔记，方便期末复习。',
    'books',
    20.00,
    'active',
    now() - INTERVAL '1 day',
    now() - INTERVAL '1 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'student_user'),
    '求购四六级真题+听力资料',
    '准备下学期考四六级，想收一套最近几年的真题书和配套听力，做过也没关系。',
    'books',
    45.00,
    'active',
    now() - INTERVAL '2 day',
    now() - INTERVAL '2 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'rider'),
    '收一辆校园代步自行车',
    '能正常骑就行，不求外观完美，最好自带车锁，适合校园短途通勤。',
    'others',
    150.00,
    'active',
    now() - INTERVAL '3 day',
    now() - INTERVAL '3 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'lazy_boy'),
    '求购宿舍懒人沙发椅',
    '想在宿舍看书和打游戏用，最好可以折叠收纳，布套干净即可。',
    'furniture',
    80.00,
    'active',
    now() - INTERVAL '4 day',
    now() - INTERVAL '4 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'guitar_hero'),
    '求购入门民谣吉他',
    '吉他社新手，希望有一把手感较好的民谣吉他，送琴包和变调夹更好。',
    'others',
    380.00,
    'pending',
    now() - INTERVAL '5 day',
    now() - INTERVAL '5 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'apple_fan'),
    '收一台二手 iPad 用于记笔记',
    '需求支持 Apple Pencil 记笔记，64G 或 128G 均可，成色 8 成以上。',
    'electronics',
    2200.00,
    'active',
    now() - INTERVAL '6 day',
    now() - INTERVAL '6 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'digital_lover'),
    '求购 24/27 寸显示器支架',
    '想把宿舍显示器抬高一点，兼容 VESA 75/100 的支架都可以。',
    'electronics',
    90.00,
    'active',
    now() - INTERVAL '7 day',
    now() - INTERVAL '7 day'
  ),
  (
    (SELECT user_id FROM users WHERE username = 'sneaker_head'),
    '收一套篮球训练装备',
    '需要一双 42 码篮球鞋和护膝，适合在学校室外场地打球使用。',
    'others',
    260.00,
    'active',
    now() - INTERVAL '8 day',
    now() - INTERVAL '8 day'
  );
