import random
import os

def generate_sql():
    sql = ["-- V9__seed_demo_data.sql",
           "-- Phase 2D: Realistic product images + price coherence",
           ""]

    # 1. Generate 40 Users
    users = []
    roles = ['MEMBER'] * 38 + ['ADMIN'] * 2
    for i in range(1, 41):
        username = f"user_{i}"
        contact_phone = f"1380000{i:04d}"
        status = 'active' if i % 10 != 0 else 'disabled'
        role = roles[i-1]
        users.append(f"('{username}', 'password', '{contact_phone}', 'user{i}@example.com', '{status}', '{role}')")

    sql.append("-- Users (40)")
    sql.append("INSERT INTO users (username, password_hash, contact_phone, contact_email, status, role) VALUES")
    sql.append(",\n".join(users) + ";\n")

    # 2. Product data per category - title, description (realistic)
    data_pool = {
        'electronics': [
            ("iPhone 15 Pro Max 256G", "电池健康98%，无拆无修，一直贴膜带壳使用。支持发快递或当面交易。"),
            ("MacBook Air M2 16G 512G", "大学时期用来写代码的，保护得很好。附带原装充电器和一个内胆包。"),
            ("索尼 WH-1000XM5 降噪耳机", "出差神器，使用次数不到十次，极品成色。音质无可挑剔。"),
            ("大疆 DJI Mini 3 Pro 无人机", "买来就飞过两次，一直吃灰。带畅飞套装和收纳包。"),
            ("Switch OLED 日版续航增强板", "吃灰神器，99新。带两款游戏卡带，手柄无漂移，屏幕完美。"),
            ("罗技 MX Master 3S 无线鼠标", "办公升级换下来的，微动完美，续航还有很久。带接收器。"),
            ("Kindle Paperwhite 5 签名版", "盖泡面神器，几乎全新，屏幕无划痕。为了护眼买的，结果还是看手机多。"),
            ("Apple Watch Series 9 45mm", "蜂窝版，带了几个月，因为换安卓手机所以出了。表盘无磕碰。"),
        ],
        'books': [
            ("考研数学复习全书+习题", "学长上岸后留下的祈福秘籍，做了不到二十页，几乎全新。"),
            ("《深入理解计算机系统》CSAPP", "硬核砖头书，仅翻阅了前三章。适合计算机专业学弟学妹。"),
            ("三体全集（刘慈欣）精装版", "塑封已经拆了，但只读了第一部。书页无折痕，书脊完好。"),
            ("新概念英语 1-4册全套", "买来想好好学英语的，结果完全没动。现低价打包出售，适合初学者。"),
            ("毛泽东选集 第一卷至第四卷", "经典好书，适合收藏或阅读。品相九五新，无笔记。"),
            ("人类简史+未来简史套装", "看了一半看不下去了，转给有缘人。带书腰，保护得很好。"),
        ],
        'furniture': [
            ("宜家实木书桌 120x60cm", "毕业清仓，结实耐用，桌面有一些正常使用划痕。需要上门自提。"),
            ("人体工学椅 电竞版", "坐垫回弹好，网布透气。升降功能和扶手调节都正常，救你的老腰。"),
            ("单人折叠沙发床", "买来给偶尔来家里住的朋友用的，平时就当沙发。成色很新，自提便宜出。"),
            ("简易四层衣柜/置物架", "布质衣柜，安装简单，非常适合出租屋过渡期使用。"),
            ("北欧风圆形落地灯", "光源柔和，带遥控器，可以调色温。摆在客厅很有氛围感。"),
        ],
        'clothing': [
            ("Nike AF1 空军一号 纯白 42码", "经典百搭款，穿了大概一个月，定期清理，鞋底无明显磨损。"),
            ("The North Face 1996 冲锋衣", "L码，黑色。防风防雨效果好。衣服太多了清库存。"),
            ("优衣库 U系列 纯棉 T恤 M码", "买了没试穿，吊牌还在，因为颜色买重复了所以出。全新。"),
            ("始祖鸟 Arc''teryx 抓绒外套", "正品保证，穿着很保暖。衣服九成新，无抽丝起球。"),
            ("Zara 休闲西装外套 S码", "面试的时候穿过一次，非常修身。颜色是藏青色。"),
        ],
        'beauty': [
            ("雅诗兰黛 小棕瓶精华 50ml", "免税店带回，带外盒和塑封。保质期到明年底，囤多了出。"),
            ("SK-II 神仙水 230ml", "使用了大概五分之一，不太适合我的肤质，低价转让。"),
            ("迪奥 999 哑光口红", "试色过一次，颜色不适合我。消毒后出，带原包装盒。"),
            ("海蓝之谜 面霜 30ml 全新", "年会抽奖的奖品，用不上。查过批号，保真。"),
            ("祖玛珑 蓝风铃香水 100ml", "女朋友不喜欢这个味道。余量还有很多，几乎没喷几次。"),
        ],
        'appliance': [
            ("米家 小米扫地机器人 Pro", "每天都在勤勤恳恳扫地，因为换了洗地机所以出。工作正常。"),
            ("戴森 V10 吸尘器", "吸力依旧强劲。电池老化，最高档大概能用十分钟。配有多种吸头。"),
            ("九阳 破壁机/榨汁机", "给宝宝做辅食用了一年，现在用不上了。刀头锋利，无异味。"),
            ("美的 20L 迷你微波炉", "出租房必备热饭神器，小巧不占地。成色较差但功能完好。"),
            ("飞利浦 电流恒温吹风机", "风力大，带负离子功能。没怎么用过，看着像新的。"),
        ],
        'sports': [
            ("迪卡侬 哑铃套装 15KG", "原打算在家练肌肉的，结果成了阻门器。有点重，限自提。"),
            ("李宁 尤尼克斯 羽毛球拍", "刚拉的 26 磅线。拍框有一处极小掉漆，不影响使用。"),
            ("公路自行车 铝合金车架", "骑了不到三百公里，变线刹车全好。换工作了不方便骑车通勤。"),
            ("瑜伽垫 + 泡沫轴 套装", "防滑加厚款，完全没用过，还在吃灰中。适合居家健身新手。"),
        ],
        'others': [
            ("周杰伦 演唱会门票 随机出", "抢多了，原价转让给杰迷。座位随机，必须先付款。"),
            ("星巴克 星礼卡 500面值", "公司发的福利，我不喝咖啡。八折出，密码没刮开。"),
            ("猫架/猫爬架 三层原木", "主子嫌弃不用，纯摆设。实木材质很扎实，几乎全新。"),
            ("哈利波特 盲盒 隐藏款", "拆开就放进展示盒了，无瑕疵。只出同城，支持当面验货。"),
        ],
    }

    # Price ranges per category (min, max), with a condition multiplier
    price_ranges = {
        'electronics':  (300,  12000),
        'books':        (5,    300),
        'clothing':     (20,   2000),
        'furniture':    (80,   8000),
        'beauty':       (20,   3000),
        'sports':       (30,   5000),
        'appliance':    (100,  9000),
        'others':       (10,   3000),
    }
    # Condition multiplier: fair < good < like_new < new
    condition_mult = {'new': 1.0, 'like_new': 0.85, 'good': 0.65, 'fair': 0.45}

    # Build category-aware image pools from demo-assets/real/
    real_img_dir = "/home/easten/github/secondhand-marketplace/frontend/public/demo-assets/real"
    category_img_pools = {}
    for cat in data_pool.keys():
        files = sorted([f for f in os.listdir(real_img_dir) if f.startswith(cat)])
        category_img_pools[cat] = [f"/demo-assets/real/{f}" for f in files]

    categories = list(data_pool.keys())
    conditions = ['new', 'like_new', 'good', 'fair']

    # 3. Generate 130 Items with category-matched images
    items = []
    # Track used images globally for uniqueness
    used_images = set()

    for i in range(1, 131):
        seller_id = random.randint(1, 40)
        cat = random.choice(categories)
        cond = random.choice(conditions)

        product = random.choice(data_pool[cat])
        title = product[0].replace("'", "''")
        desc = product[1].replace("'", "''")

        # Price: coherent with category range and condition
        pmin, pmax = price_ranges[cat]
        mult = condition_mult[cond]
        # Apply condition multiplier to the max price
        effective_max = pmin + (pmax - pmin) * mult
        price = round(random.uniform(pmin, effective_max), 2)

        # Status distribution
        st_rand = random.random()
        if st_rand < 0.6:
            status = 'active'
        elif st_rand < 0.75:
            status = 'off'
        elif st_rand < 0.85:
            status = 'deleted'
        elif st_rand < 0.90:
            status = 'draft'
        else:
            status = 'pending'

        days_ago = random.randint(1, 90)
        hours_ago = random.randint(1, 23)

        # Category-aware image selection
        pool = category_img_pools[cat]
        available = [img for img in pool if img not in used_images]
        if not available:
            available = pool  # reset if all used
        img_url = random.choice(available)
        used_images.add(img_url)

        images = f"ARRAY['{img_url}']::TEXT ARRAY"

        items.append(
            f"({seller_id}, '{title}', '{desc}', '{cat}', {price}, '{cond}', '{status}', {images},"
            f" now() - INTERVAL '{days_ago}' DAY - INTERVAL '{hours_ago}' HOUR, now() - INTERVAL '{days_ago-1}' DAY)"
        )

    sql.append("-- Items (130)")
    sql.append("INSERT INTO items (seller_id, title, description, category, price, condition, status, images, created_at, updated_at) VALUES")
    sql.append(",\n".join(items) + ";\n")

    # 4. Generate 15 Demands
    demands = []
    for i in range(1, 16):
        buyer_id = random.randint(1, 40)
        cat = random.choice(categories)
        product = random.choice(data_pool[cat])
        title = product[0].replace("'", "''")
        pmin, pmax = price_ranges[cat]
        price = round(random.uniform(pmin, pmax * 0.7), 2)
        days_ago = random.randint(1, 30)
        demands.append(
            f"({buyer_id}, '求购：{title}', '诚心收购，最好带包装盒和购买凭证。价格 {price} 左右', '{cat}', {price}, 'active',"
            f" now() - INTERVAL '{days_ago}' DAY, now() - INTERVAL '{days_ago-1}' DAY)"
        )

    sql.append("-- Demands (15)")
    sql.append("INSERT INTO demands (buyer_id, title, description, category, expected_price, status, created_at, updated_at) VALUES")
    sql.append(",\n".join(demands) + ";\n")

    with open('src/main/resources/db/migration/V9__seed_demo_data.sql', 'w', encoding='utf-8') as f:
        f.write("\n".join(sql))

    return items, data_pool, price_ranges, condition_mult

if __name__ == '__main__':
    items, data_pool, price_ranges, condition_mult = generate_sql()
    print("Phase 2D seed data generated successfully.")
    print(f"Total items: {len(items)}")
