-- 美邻网测试数据生成脚本
-- 生成：20 个用户 + 100 条帖子 + 200 条评论 + 300 个点赞
-- 执行时间：2026-03-19
-- 注意：需要在 Supabase SQL Editor 中使用 service_role 权限执行

-- ==================== 1. 生成测试用户 ====================

-- 临时禁用 RLS（需要管理员权限）
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE likes DISABLE ROW LEVEL SECURITY;

-- 插入 20 个测试用户
INSERT INTO users (id, email, nickname, avatar, role, created_at) VALUES
  (gen_random_uuid(), 'user001@test.com', '阳光花园 3 栋', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001', 'user', NOW() - INTERVAL '30 days'),
  (gen_random_uuid(), 'user002@test.com', '热心邻居老王', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user002', 'user', NOW() - INTERVAL '29 days'),
  (gen_random_uuid(), 'user003@test.com', '爱分享的李姐', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user003', 'user', NOW() - INTERVAL '28 days'),
  (gen_random_uuid(), 'user004@test.com', '豆豆妈', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user004', 'user', NOW() - INTERVAL '27 days'),
  (gen_random_uuid(), 'user005@test.com', '业委会 - 小陈', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user005', 'admin', NOW() - INTERVAL '26 days'),
  (gen_random_uuid(), 'user006@test.com', '张阿姨', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user006', 'user', NOW() - INTERVAL '25 days'),
  (gen_random_uuid(), 'user007@test.com', '程序员小李', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user007', 'user', NOW() - INTERVAL '24 days'),
  (gen_random_uuid(), 'user008@test.com', '健身达人王哥', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user008', 'user', NOW() - INTERVAL '23 days'),
  (gen_random_uuid(), 'user009@test.com', '美食家刘姐', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user009', 'user', NOW() - INTERVAL '22 days'),
  (gen_random_uuid(), 'user010@test.com', '快递小哥小赵', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user010', 'user', NOW() - INTERVAL '21 days'),
  (gen_random_uuid(), 'user011@test.com', '退休教师周叔', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user011', 'user', NOW() - INTERVAL '20 days'),
  (gen_random_uuid(), 'user012@test.com', '全职妈妈小吴', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user012', 'user', NOW() - INTERVAL '19 days'),
  (gen_random_uuid(), 'user013@test.com', '大学生小孙', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user013', 'user', NOW() - INTERVAL '18 days'),
  (gen_random_uuid(), 'user014@test.com', '宠物医生小钱', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user014', 'user', NOW() - INTERVAL '17 days'),
  (gen_random_uuid(), 'user015@test.com', '保安队长老郑', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user015', 'user', NOW() - INTERVAL '16 days'),
  (gen_random_uuid(), 'user016@test.com', '花店老板娘小冯', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user016', 'user', NOW() - INTERVAL '15 days'),
  (gen_random_uuid(), 'user017@test.com', 'IT 男小蒋', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user017', 'user', NOW() - INTERVAL '14 days'),
  (gen_random_uuid(), 'user018@test.com', '瑜伽教练小美', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user018', 'user', NOW() - INTERVAL '13 days'),
  (gen_random_uuid(), 'user019@test.com', '便利店老板老魏', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user019', 'user', NOW() - INTERVAL '12 days'),
  (gen_random_uuid(), 'user020@test.com', '社区志愿者小杨', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user020', 'user', NOW() - INTERVAL '11 days');

-- ==================== 2. 生成 100 条帖子（按分类分布） ====================

-- 临时表存储用户 ID
CREATE TEMP TABLE temp_users AS SELECT id, nickname FROM users;

-- 紧急通知 (15 条) - emergency 🚨
INSERT INTO posts (id, user_id, content, category, likes_count, comments_count, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM temp_users ORDER BY RANDOM() LIMIT 1),
  CASE (ROW_NUMBER() OVER () % 15)
    WHEN 0 THEN '🚨【紧急通知】明天上午 9-12 点小区停水，请大家提前储水！'
    WHEN 1 THEN '⚠️【安全提醒】近期有陌生人冒充物业人员上门，请邻居们提高警惕！'
    WHEN 2 THEN '📢【物业通知】本周六小区进行消杀作业，请关好门窗'
    WHEN 3 THEN '🚨【紧急寻物】今天下午在小区花园丢失黑色钱包，内有重要证件，请拾到者联系！'
    WHEN 4 THEN '⚠️【停电通知】明晚 8 点到 10 点片区检修，请提前准备'
    WHEN 5 THEN '📢【社区公告】下周一起小区门禁系统升级，请带好门禁卡'
    WHEN 6 THEN '🚨【紧急通知】台风预警，请大家关好门窗，减少外出'
    WHEN 7 THEN '⚠️【防诈骗提醒】近期高发冒充客服诈骗，请大家提高警惕'
    WHEN 8 THEN '📢【物业通知】电梯维保通知，3 栋 2 单元明天上午暂停使用'
    WHEN 9 THEN '🚨【紧急寻人】家中老人走失，穿着蓝色外套，有看到的请联系！'
    WHEN 10 THEN '⚠️【道路施工】小区门口道路明天开始施工，请注意绕行'
    WHEN 11 THEN '📢【疫苗接种】社区医院本周六有疫苗接种，需要的邻居可以前往'
    WHEN 12 THEN '🚨【紧急通知】燃气管道检修，明天下午 2-5 点暂停供气'
    WHEN 13 THEN '⚠️【天气预警】暴雨蓝色预警，请大家注意出行安全'
    ELSE '📢【社区公告】小区业主大会将于下周日召开，请大家准时参加'
  END,
  'emergency',
  (RANDOM() * 50 + 10)::INTEGER,
  (RANDOM() * 20 + 5)::INTEGER,
  NOW() - (RANDOM() * INTERVAL '10 days')
FROM generate_series(1, 15);

-- 二手闲置 (18 条) - marketplace 🏪
INSERT INTO posts (id, user_id, content, category, likes_count, comments_count, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM temp_users ORDER BY RANDOM() LIMIT 1),
  CASE (ROW_NUMBER() OVER () % 18)
    WHEN 0 THEN '🏪【闲置转让】九成新微波炉，买来没用几次，50 元自取'
    WHEN 1 THEN '📦【出二手】儿童自行车，适合 3-6 岁，80 元'
    WHEN 2 THEN '🏪【转让】宜家沙发，9 成新，500 元，需自提'
    WHEN 3 THEN '📦【闲置】小米空气净化器，用了半年，200 元'
    WHEN 4 THEN '🏪【出】macbook pro 2020 款，8+256G，3500 元'
    WHEN 5 THEN '📦【转让】婴儿推车，几乎全新，150 元'
    WHEN 6 THEN '🏪【闲置】健身哑铃一对，20kg，100 元'
    WHEN 7 THEN '📦【出二手】索尼耳机 WH-1000XM4，800 元'
    WHEN 8 THEN '🏪【转让】餐桌椅套装，一桌四椅，300 元'
    WHEN 9 THEN '📦【闲置】Switch 游戏机 + 健身环，1500 元'
    WHEN 10 THEN '🏪【出】品牌羽绒服，M 码，9 成新，200 元'
    WHEN 11 THEN '📦【转让】书架，实木，100 元'
    WHEN 12 THEN '🏪【闲置】电烤箱，30L，80 元'
    WHEN 13 THEN '📦【出二手】儿童安全座椅，300 元'
    WHEN 14 THEN '🏪【转让】跑步机，用了很少，800 元自提'
    WHEN 15 THEN '📦【闲置】空气炸锅，全新未拆封，200 元'
    WHEN 16 THEN '🏪【出】品牌包包，9 成新，150 元'
    ELSE '📦【转让】床垫，1.8 米，500 元'
  END,
  'marketplace',
  (RANDOM() * 30 + 5)::INTEGER,
  (RANDOM() * 15 + 2)::INTEGER,
  NOW() - (RANDOM() * INTERVAL '10 days')
FROM generate_series(1, 18);

-- 邻里互助 (20 条) - help 🆘
INSERT INTO posts (id, user_id, content, category, likes_count, comments_count, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM temp_users ORDER BY RANDOM() LIMIT 1),
  CASE (ROW_NUMBER() OVER () % 20)
    WHEN 0 THEN '🆘【邻里互助】明天上午要去山姆会员店，有要一起拼车的邻居吗？我开 SUV，还能坐 3 个人'
    WHEN 1 THEN '🙏【求助】哪位邻居有电钻借我用一下？想挂个画，用完马上还'
    WHEN 2 THEN '🆘【拼车】下周一去浦东机场，早上 6 点出发，有同路的吗？'
    WHEN 3 THEN '🙏【求助】家里老人不会用智能手机，谁能帮忙教一下怎么挂号？'
    WHEN 4 THEN '🆘【互助】周末要搬家，有空的邻居来帮忙吗？请你吃饭！'
    WHEN 5 THEN '🙏【求助】有没有邻居认识靠谱的装修师傅？'
    WHEN 6 THEN '🆘【拼单】京东买家电差 300 满减，有要一起拼的吗？'
    WHEN 7 THEN '🙏【求助】猫咪走丢了，灰色的英短，有看到的邻居请联系！'
    WHEN 8 THEN '🆘【互助】我会修电脑，邻居们有电脑问题可以找我免费帮忙'
    WHEN 9 THEN '🙏【求助】谁能帮忙代收个快递？今天不在家'
    WHEN 10 THEN '🆘【拼车】每天早 8 点在张江上班，有可以拼车的吗？'
    WHEN 11 THEN '🙏【求助】有没有邻居有多余的口罩？急用'
    WHEN 12 THEN '🆘【互助】我开培训机构的，可以免费帮邻居孩子辅导作业'
    WHEN 13 THEN '🙏【求助】家里跳闸了，有没有懂电工的邻居帮忙看看？'
    WHEN 14 THEN '🆘【拼单】 Costco 会员卡拼单，还差 2 人'
    WHEN 15 THEN '🙏【求助】推荐个靠谱的保洁阿姨'
    WHEN 16 THEN '🆘【互助】周末组织小区羽毛球活动，有要一起的吗？'
    WHEN 17 THEN '🙏【求助】谁家有多余的儿童玩具？想给娃借来玩几天'
    WHEN 18 THEN '🆘【拼车】春节回家，2 月 8 日开车回南京，有同路的吗？'
    ELSE '🙏【求助】有没有邻居知道附近哪里可以配钥匙？'
  END,
  'help',
  (RANDOM() * 40 + 10)::INTEGER,
  (RANDOM() * 25 + 8)::INTEGER,
  NOW() - (RANDOM() * INTERVAL '10 days')
FROM generate_series(1, 20);

-- 社区活动 (17 条) - event 🎉
INSERT INTO posts (id, user_id, content, category, likes_count, comments_count, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM temp_users ORDER BY RANDOM() LIMIT 1),
  CASE (ROW_NUMBER() OVER () % 17)
    WHEN 0 THEN '🎉【社区活动】本周六下午 3 点，小区广场举办邻里美食节，欢迎大家带上拿手菜来分享！'
    WHEN 1 THEN '🏃【活动报名】周日早上 7 点小区晨跑，有要一起的吗？'
    WHEN 2 THEN '🎉【亲子活动】下周六儿童乐园亲子游戏，欢迎带娃参加！'
    WHEN 3 THEN '🎸【兴趣小组】小区吉他社招新，每周三晚 8 点活动'
    WHEN 4 THEN '🎉【活动】周五晚 7 点小区广场电影放映，播放《流浪地球》'
    WHEN 5 THEN '📚【读书会】每月最后一个周日下午，小区阅览室读书分享会'
    WHEN 6 THEN '🎉【活动报名】元宵节猜灯谜活动，周日晚 6 点，有奖品！'
    WHEN 7 THEN '🏸【羽毛球】每周二四六晚 8-10 点，小区羽毛球场，欢迎加入'
    WHEN 8 THEN '🎉【社区活动】三八妇女节活动，手工 DIY，限 20 人报名'
    WHEN 9 THEN '🎤【K 歌大赛】周六晚 7 点，小区活动室，欢迎来一展歌喉'
    WHEN 10 THEN '🎉【活动】周日跳蚤市场，有闲置物品的邻居可以来摆摊'
    WHEN 11 THEN '🌸【赏花团】周末组织去植物园赏花，有要一起的吗？'
    WHEN 12 THEN '🎉【活动报名】小区春节联欢晚会，征集节目！'
    WHEN 13 THEN '🥟【包饺子】冬至包饺子活动，周日上午 10 点，物业活动室'
    WHEN 14 THEN '🎉【社区活动】儿童绘画比赛，5-12 岁可参加，有奖品'
    WHEN 15 THEN '🧘【瑜伽课】每周一三五早 9 点，小区花园晨练，免费教学'
    ELSE '🎉【活动】周末烧烤派对，小区露台，自带食材，AA 制'
  END,
  'event',
  (RANDOM() * 60 + 20)::INTEGER,
  (RANDOM() * 30 + 10)::INTEGER,
  NOW() - (RANDOM() * INTERVAL '10 days')
FROM generate_series(1, 17);

-- 宠物交友 (15 条) - pets 🐕
INSERT INTO posts (id, user_id, content, category, likes_count, comments_count, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM temp_users ORDER BY RANDOM() LIMIT 1),
  CASE (ROW_NUMBER() OVER () % 15)
    WHEN 0 THEN '🐕【宠物交友】我家金毛「豆豆」想找小伙伴一起玩！每天傍晚在小区花园'
    WHEN 1 THEN '🐱【猫咪找玩伴】3 岁布偶猫，想找附近的猫咪朋友'
    WHEN 2 THEN '🐕【寻狗】昨天晚上小区门口走丢一只泰迪，有看到的请联系！'
    WHEN 3 THEN '🐱【猫咪下崽】自家猫咪生了 5 只小奶猫，满月后可领养'
    WHEN 4 THEN '🐕【宠物聚会】周末组织小区宠物聚会，带毛孩子来玩！'
    WHEN 5 THEN '🐱【求助】猫咪绝育后怎么照顾？第一次养猫求经验'
    WHEN 6 THEN '🐕【找主人】捡到一只流浪狗，很温顺，有想领养的邻居吗？'
    WHEN 7 THEN '🐱【猫咪寄养】春节回家 7 天，有邻居愿意帮忙照顾猫咪吗？有偿'
    WHEN 8 THEN '🐕【宠物摄影】我是宠物摄影师，可以给小区邻居免费拍宠物照'
    WHEN 9 THEN '🐱【猫咪用品】多买了猫粮和猫砂，低价转让给有需要的邻居'
    WHEN 10 THEN '🐕【狗狗训练】专业训犬师，可以给小区邻居提供训犬服务'
    WHEN 11 THEN '🐱【猫咪医疗】推荐一家靠谱的宠物医院，医生很专业'
    WHEN 12 THEN '🐕【宠物洗澡】小区门口新开了宠物店，洗澡美容 8 折'
    WHEN 13 THEN '🐱【猫咪行为】猫咪总是半夜叫怎么办？求支招'
    ELSE '🐕【宠物丢失】悬赏 500 元找丢失的鹦鹉，绿色的，会说话'
  END,
  'pets',
  (RANDOM() * 50 + 15)::INTEGER,
  (RANDOM() * 20 + 8)::INTEGER,
  NOW() - (RANDOM() * INTERVAL '10 days')
FROM generate_series(1, 15);

-- 美食分享 (15 条) - food 🍳
INSERT INTO posts (id, user_id, content, category, likes_count, comments_count, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM temp_users ORDER BY RANDOM() LIMIT 1),
  CASE (ROW_NUMBER() OVER () % 15)
    WHEN 0 THEN '🍳【美食分享】今天做了红烧肉，邻居们说好吃，分享一下做法！'
    WHEN 1 THEN '🍜【探店】小区门口新开的面馆，牛肉面超好吃！'
    WHEN 2 THEN '🍳【烘焙】第一次做蛋糕，请大家看看怎么样？'
    WHEN 3 THEN '🥘【菜谱】教大家做正宗的麻婆豆腐，超下饭！'
    WHEN 4 THEN '🍳【美食】周末去农家乐，土鸡味道太正宗了！'
    WHEN 5 THEN '🥗【健康餐】减肥餐打卡第 30 天，瘦了 10 斤！'
    WHEN 6 THEN '🍳【家常菜】今天做了糖醋排骨，孩子说比饭店还好吃'
    WHEN 7 THEN '🍕【烘焙】自制披萨，材料足味道好！'
    WHEN 8 THEN '🍳【美食分享】婆婆教的秘制酱料，拌什么都好吃！'
    WHEN 9 THEN '🥟【包饺子】冬至包饺子，韭菜鸡蛋馅的最香！'
    WHEN 10 THEN '🍳【探店】发现一家宝藏小店，手工水饺一绝！'
    WHEN 11 THEN '🍰【甜品】自制提拉米苏，配方分享给大家'
    WHEN 12 THEN '🍳【美食】今天尝试做川菜，水煮肉片成功了！'
    WHEN 13 THEN '🍲【火锅】冬天就是要吃火锅，自家做的更卫生！'
    ELSE '🍳【早餐】每天早起做早餐，今天是豆浆油条！'
  END,
  'food',
  (RANDOM() * 45 + 15)::INTEGER,
  (RANDOM() * 20 + 5)::INTEGER,
  NOW() - (RANDOM() * INTERVAL '10 days')
FROM generate_series(1, 15);

-- 删除临时表
DROP TABLE temp_users;

-- ==================== 3. 生成测试评论 ====================

-- 临时表存储帖子 ID
CREATE TEMP TABLE temp_posts AS SELECT id FROM posts;
CREATE TEMP TABLE temp_users_for_comment AS SELECT id FROM users;

-- 生成 200 条评论
INSERT INTO comments (id, post_id, user_id, content, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM temp_posts ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM temp_users_for_comment ORDER BY RANDOM() LIMIT 1),
  CASE (RANDOM() * 20)::INTEGER
    WHEN 0 THEN '太棒了！支持！'
    WHEN 1 THEN '感谢分享，很有用！'
    WHEN 2 THEN '已收藏，谢谢楼主'
    WHEN 3 THEN '这个不错，赞一个'
    WHEN 4 THEN '请问还有吗？'
    WHEN 5 THEN '什么时候开始？想参加'
    WHEN 6 THEN '多少钱？还在吗？'
    WHEN 7 THEN '我也遇到过类似问题'
    WHEN 8 THEN '好帖要顶！'
    WHEN 9 THEN '感谢邻居分享'
    WHEN 10 THEN '已转发给需要的人'
    WHEN 11 THEN '实用，mark 一下'
    WHEN 12 THEN '有空试试，看起来不错'
    WHEN 13 THEN '请问具体位置在哪里？'
    WHEN 14 THEN '怎么联系？'
    WHEN 15 THEN '太及时了，正需要'
    WHEN 16 THEN '好邻居，点赞！'
    WHEN 17 THEN '已报名，期待活动'
    WHEN 18 THEN '这个价格不错'
    ELSE '谢谢分享，很有帮助'
  END,
  NOW() - (RANDOM() * INTERVAL '9 days')
FROM generate_series(1, 200);

-- ==================== 4. 生成测试点赞 ====================

CREATE TEMP TABLE temp_posts_for_like AS SELECT id FROM posts;
CREATE TEMP TABLE temp_users_for_like AS SELECT id FROM users;

-- 生成 300 个点赞
INSERT INTO likes (id, post_id, user_id, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM temp_posts_for_like ORDER BY RANDOM() LIMIT 1),
  (SELECT id FROM temp_users_for_like ORDER BY RANDOM() LIMIT 1),
  NOW() - (RANDOM() * INTERVAL '10 days')
FROM generate_series(1, 300);

-- 删除临时表
DROP TABLE temp_posts;
DROP TABLE temp_users_for_comment;
DROP TABLE temp_posts_for_like;
DROP TABLE temp_users_for_like;

-- ==================== 5. 恢复 RLS ====================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- ==================== 6. 验证数据 ====================

SELECT '用户总数：' || COUNT(*) as 统计 FROM users;
SELECT '帖子总数：' || COUNT(*) as 统计 FROM posts;
SELECT '评论总数：' || COUNT(*) as 统计 FROM comments;
SELECT '点赞总数：' || COUNT(*) as 统计 FROM likes;

-- 分类统计
SELECT category, COUNT(*) as 帖子数 
FROM posts 
WHERE category IS NOT NULL 
GROUP BY category 
ORDER BY 帖子数 DESC;

-- 显示结果
SELECT '✅ 测试数据生成成功！' as 状态;
