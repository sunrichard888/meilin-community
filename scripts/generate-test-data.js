/**
 * 美邻网测试数据生成脚本
 * 生成：20 个用户 + 100 条帖子 + 200 条评论 + 300 个点赞
 * 
 * 使用方式：
 * 1. 确保 .env.local 配置正确
 * 2. 运行：node scripts/generate-test-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 使用 service_role key 绕过 RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 测试用户数据
const testUsers = [
  { email: 'user001@test.com', nickname: '阳光花园 3 栋', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user001', role: 'user' },
  { email: 'user002@test.com', nickname: '热心邻居老王', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user002', role: 'user' },
  { email: 'user003@test.com', nickname: '爱分享的李姐', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user003', role: 'user' },
  { email: 'user004@test.com', nickname: '豆豆妈', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user004', role: 'user' },
  { email: 'user005@test.com', nickname: '业委会 - 小陈', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user005', role: 'admin' },
  { email: 'user006@test.com', nickname: '张阿姨', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user006', role: 'user' },
  { email: 'user007@test.com', nickname: '程序员小李', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user007', role: 'user' },
  { email: 'user008@test.com', nickname: '健身达人王哥', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user008', role: 'user' },
  { email: 'user009@test.com', nickname: '美食家刘姐', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user009', role: 'user' },
  { email: 'user010@test.com', nickname: '快递小哥小赵', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user010', role: 'user' },
  { email: 'user011@test.com', nickname: '退休教师周叔', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user011', role: 'user' },
  { email: 'user012@test.com', nickname: '全职妈妈小吴', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user012', role: 'user' },
  { email: 'user013@test.com', nickname: '大学生小孙', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user013', role: 'user' },
  { email: 'user014@test.com', nickname: '宠物医生小钱', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user014', role: 'user' },
  { email: 'user015@test.com', nickname: '保安队长老郑', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user015', role: 'user' },
  { email: 'user016@test.com', nickname: '花店老板娘小冯', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user016', role: 'user' },
  { email: 'user017@test.com', nickname: 'IT 男小蒋', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user017', role: 'user' },
  { email: 'user018@test.com', nickname: '瑜伽教练小美', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user018', role: 'user' },
  { email: 'user019@test.com', nickname: '便利店老板老魏', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user019', role: 'user' },
  { email: 'user020@test.com', nickname: '社区志愿者小杨', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user020', role: 'user' },
];

// 各分类的帖子内容
const postsByCategory = {
  emergency: [
    '🚨【紧急通知】明天上午 9-12 点小区停水，请大家提前储水！',
    '⚠️【安全提醒】近期有陌生人冒充物业人员上门，请邻居们提高警惕！',
    '📢【物业通知】本周六小区进行消杀作业，请关好门窗',
    '🚨【紧急寻物】今天下午在小区花园丢失黑色钱包，内有重要证件，请拾到者联系！',
    '⚠️【停电通知】明晚 8 点到 10 点片区检修，请提前准备',
    '📢【社区公告】下周一起小区门禁系统升级，请带好门禁卡',
    '🚨【紧急通知】台风预警，请大家关好门窗，减少外出',
    '⚠️【防诈骗提醒】近期高发冒充客服诈骗，请大家提高警惕',
    '📢【物业通知】电梯维保通知，3 栋 2 单元明天上午暂停使用',
    '🚨【紧急寻人】家中老人走失，穿着蓝色外套，有看到的请联系！',
    '⚠️【道路施工】小区门口道路明天开始施工，请注意绕行',
    '📢【疫苗接种】社区医院本周六有疫苗接种，需要的邻居可以前往',
    '🚨【紧急通知】燃气管道检修，明天下午 2-5 点暂停供气',
    '⚠️【天气预警】暴雨蓝色预警，请大家注意出行安全',
    '📢【社区公告】小区业主大会将于下周日召开，请大家准时参加',
  ],
  marketplace: [
    '🏪【闲置转让】九成新微波炉，买来没用几次，50 元自取',
    '📦【出二手】儿童自行车，适合 3-6 岁，80 元',
    '🏪【转让】宜家沙发，9 成新，500 元，需自提',
    '📦【闲置】小米空气净化器，用了半年，200 元',
    '🏪【出】macbook pro 2020 款，8+256G，3500 元',
    '📦【转让】婴儿推车，几乎全新，150 元',
    '🏪【闲置】健身哑铃一对，20kg，100 元',
    '📦【出二手】索尼耳机 WH-1000XM4，800 元',
    '🏪【转让】餐桌椅套装，一桌四椅，300 元',
    '📦【闲置】Switch 游戏机 + 健身环，1500 元',
    '🏪【出】品牌羽绒服，M 码，9 成新，200 元',
    '📦【转让】书架，实木，100 元',
    '🏪【闲置】电烤箱，30L，80 元',
    '📦【出二手】儿童安全座椅，300 元',
    '🏪【转让】跑步机，用了很少，800 元自提',
    '📦【闲置】空气炸锅，全新未拆封，200 元',
    '🏪【出】品牌包包，9 成新，150 元',
    '📦【转让】床垫，1.8 米，500 元',
  ],
  help: [
    '🆘【邻里互助】明天上午要去山姆会员店，有要一起拼车的邻居吗？我开 SUV，还能坐 3 个人',
    '🙏【求助】哪位邻居有电钻借我用一下？想挂个画，用完马上还',
    '🆘【拼车】下周一去浦东机场，早上 6 点出发，有同路的吗？',
    '🙏【求助】家里老人不会用智能手机，谁能帮忙教一下怎么挂号？',
    '🆘【互助】周末要搬家，有空的邻居来帮忙吗？请你吃饭！',
    '🙏【求助】有没有邻居认识靠谱的装修师傅？',
    '🆘【拼单】京东买家电差 300 满减，有要一起拼的吗？',
    '🙏【求助】猫咪走丢了，灰色的英短，有看到的邻居请联系！',
    '🆘【互助】我会修电脑，邻居们有电脑问题可以找我免费帮忙',
    '🙏【求助】谁能帮忙代收个快递？今天不在家',
    '🆘【拼车】每天早 8 点在张江上班，有可以拼车的吗？',
    '🙏【求助】有没有邻居有多余的口罩？急用',
    '🆘【互助】我开培训机构的，可以免费帮邻居孩子辅导作业',
    '🙏【求助】家里跳闸了，有没有懂电工的邻居帮忙看看？',
    '🆘【拼单】Costco 会员卡拼单，还差 2 人',
    '🙏【求助】推荐个靠谱的保洁阿姨',
    '🆘【互助】周末组织小区羽毛球活动，有要一起的吗？',
    '🙏【求助】谁家有多余的儿童玩具？想给娃借来玩几天',
    '🆘【拼车】春节回家，2 月 8 日开车回南京，有同路的吗？',
    '🙏【求助】有没有邻居知道附近哪里可以配钥匙？',
  ],
  event: [
    '🎉【社区活动】本周六下午 3 点，小区广场举办邻里美食节，欢迎大家带上拿手菜来分享！',
    '🏃【活动报名】周日早上 7 点小区晨跑，有要一起的吗？',
    '🎉【亲子活动】下周六儿童乐园亲子游戏，欢迎带娃参加！',
    '🎸【兴趣小组】小区吉他社招新，每周三晚 8 点活动',
    '🎉【活动】周五晚 7 点小区广场电影放映，播放《流浪地球》',
    '📚【读书会】每月最后一个周日下午，小区阅览室读书分享会',
    '🎉【活动报名】元宵节猜灯谜活动，周日晚 6 点，有奖品！',
    '🏸【羽毛球】每周二四六晚 8-10 点，小区羽毛球场，欢迎加入',
    '🎉【社区活动】三八妇女节活动，手工 DIY，限 20 人报名',
    '🎤【K 歌大赛】周六晚 7 点，小区活动室，欢迎来一展歌喉',
    '🎉【活动】周日跳蚤市场，有闲置物品的邻居可以来摆摊',
    '🌸【赏花团】周末组织去植物园赏花，有要一起的吗？',
    '🎉【活动报名】小区春节联欢晚会，征集节目！',
    '🥟【包饺子】冬至包饺子活动，周日上午 10 点，物业活动室',
    '🎉【社区活动】儿童绘画比赛，5-12 岁可参加，有奖品',
    '🧘【瑜伽课】每周一三五早 9 点，小区花园晨练，免费教学',
    '🎉【活动】周末烧烤派对，小区露台，自带食材，AA 制',
  ],
  pets: [
    '🐕【宠物交友】我家金毛「豆豆」想找小伙伴一起玩！每天傍晚在小区花园',
    '🐱【猫咪找玩伴】3 岁布偶猫，想找附近的猫咪朋友',
    '🐕【寻狗】昨天晚上小区门口走丢一只泰迪，有看到的请联系！',
    '🐱【猫咪下崽】自家猫咪生了 5 只小奶猫，满月后可领养',
    '🐕【宠物聚会】周末组织小区宠物聚会，带毛孩子来玩！',
    '🐱【求助】猫咪绝育后怎么照顾？第一次养猫求经验',
    '🐕【找主人】捡到一只流浪狗，很温顺，有想领养的邻居吗？',
    '🐱【猫咪寄养】春节回家 7 天，有邻居愿意帮忙照顾猫咪吗？有偿',
    '🐕【宠物摄影】我是宠物摄影师，可以给小区邻居免费拍宠物照',
    '🐱【猫咪用品】多买了猫粮和猫砂，低价转让给有需要的邻居',
    '🐕【狗狗训练】专业训犬师，可以给小区邻居提供训犬服务',
    '🐱【猫咪医疗】推荐一家靠谱的宠物医院，医生很专业',
    '🐕【宠物洗澡】小区门口新开了宠物店，洗澡美容 8 折',
    '🐱【猫咪行为】猫咪总是半夜叫怎么办？求支招',
    '🐕【宠物丢失】悬赏 500 元找丢失的鹦鹉，绿色的，会说话',
  ],
  food: [
    '🍳【美食分享】今天做了红烧肉，邻居们说好吃，分享一下做法！',
    '🍜【探店】小区门口新开的面馆，牛肉面超好吃！',
    '🍳【烘焙】第一次做蛋糕，请大家看看怎么样？',
    '🥘【菜谱】教大家做正宗的麻婆豆腐，超下饭！',
    '🍳【美食】周末去农家乐，土鸡味道太正宗了！',
    '🥗【健康餐】减肥餐打卡第 30 天，瘦了 10 斤！',
    '🍳【家常菜】今天做了糖醋排骨，孩子说比饭店还好吃',
    '🍕【烘焙】自制披萨，材料足味道好！',
    '🍳【美食分享】婆婆教的秘制酱料，拌什么都好吃！',
    '🥟【包饺子】冬至包饺子，韭菜鸡蛋馅的最香！',
    '🍳【探店】发现一家宝藏小店，手工水饺一绝！',
    '🍰【甜品】自制提拉米苏，配方分享给大家',
    '🍳【美食】今天尝试做川菜，水煮肉片成功了！',
    '🍲【火锅】冬天就是要吃火锅，自家做的更卫生！',
    '🍳【早餐】每天早起做早餐，今天是豆浆油条！',
  ],
};

// 评论模板
const commentTemplates = [
  '太棒了！支持！',
  '感谢分享，很有用！',
  '已收藏，谢谢楼主',
  '这个不错，赞一个',
  '请问还有吗？',
  '什么时候开始？想参加',
  '多少钱？还在吗？',
  '我也遇到过类似问题',
  '好帖要顶！',
  '感谢邻居分享',
  '已转发给需要的人',
  '实用，mark 一下',
  '有空试试，看起来不错',
  '请问具体位置在哪里？',
  '怎么联系？',
  '太及时了，正需要',
  '好邻居，点赞！',
  '已报名，期待活动',
  '这个价格不错',
  '谢谢分享，很有帮助',
];

async function generateTestData() {
  console.log('🚀 开始生成测试数据...\n');

  try {
    // 1. 生成用户
    console.log('📝 正在生成 20 个测试用户...');
    const userIds = [];
    
    for (const userData of testUsers) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          nickname: userData.nickname,
          avatar: userData.avatar,
          role: userData.role,
        })
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') { // 唯一约束冲突
          console.log(`  ⚠️  用户 ${userData.email} 已存在，跳过`);
          // 获取已存在的用户 ID
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', userData.email)
            .single();
          if (existingUser) userIds.push(existingUser.id);
        } else {
          console.log(`  ❌ 创建用户失败：${error.message}`);
        }
      } else {
        console.log(`  ✅ 创建用户：${userData.nickname}`);
        userIds.push(data.id);
      }
    }

    if (userIds.length === 0) {
      console.log('❌ 没有可用的用户，退出');
      return;
    }

    console.log(`\n✅ 用户生成完成，共 ${userIds.length} 个\n`);

    // 2. 生成帖子
    console.log('📝 正在生成 100 条测试帖子...');
    const postIds = [];
    const categories = Object.keys(postsByCategory);
    
    // 每个分类的帖子数量分配
    const postsPerCategory = {
      emergency: 15,
      marketplace: 18,
      help: 20,
      event: 17,
      pets: 15,
      food: 15,
    };

    for (const category of categories) {
      const contents = postsByCategory[category];
      const count = postsPerCategory[category];

      for (let i = 0; i < count; i++) {
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const content = contents[i % contents.length];
        const daysAgo = Math.floor(Math.random() * 10);
        const likesCount = Math.floor(Math.random() * 50) + 5;
        const commentsCount = Math.floor(Math.random() * 20) + 2;

        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: userId,
            content: content,
            category: category,
            likes_count: likesCount,
            comments_count: commentsCount,
            created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select('id')
          .single();

        if (error) {
          console.log(`  ❌ 创建帖子失败：${error.message}`);
        } else {
          postIds.push(data.id);
        }
      }
      console.log(`  ✅ ${category} 分类：${count} 条`);
    }

    console.log(`\n✅ 帖子生成完成，共 ${postIds.length} 条\n`);

    // 3. 生成评论
    console.log('📝 正在生成 200 条评论...');
    let commentCount = 0;

    for (let i = 0; i < 200; i++) {
      const postId = postIds[Math.floor(Math.random() * postIds.length)];
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const content = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
      const daysAgo = Math.floor(Math.random() * 9);

      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: userId,
          content: content,
          created_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        });

      if (!error) commentCount++;
    }

    console.log(`✅ 评论生成完成，共 ${commentCount} 条\n`);

    // 4. 生成点赞
    console.log('📝 正在生成 300 个点赞...');
    let likeCount = 0;

    for (let i = 0; i < 300; i++) {
      const postId = postIds[Math.floor(Math.random() * postIds.length)];
      const userId = userIds[Math.floor(Math.random() * userIds.length)];

      const { error } = await supabase
        .from('likes')
        .insert({
          post_id: postId,
          user_id: userId,
        });

      if (!error) likeCount++;
    }

    console.log(`✅ 点赞生成完成，共 ${likeCount} 个\n`);

    // 5. 统计结果
    console.log('📊 数据统计：');
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    const { count: commentCount2 } = await supabase.from('comments').select('*', { count: 'exact', head: true });
    const { count: likeCount2 } = await supabase.from('likes').select('*', { count: 'exact', head: true });

    console.log(`  👥 用户总数：${userCount}`);
    console.log(`  📝 帖子总数：${postCount}`);
    console.log(`  💬 评论总数：${commentCount2}`);
    console.log(`  ❤️  点赞总数：${likeCount2}`);

    // 分类统计
    console.log('\n📊 分类统计：');
    for (const category of categories) {
      const { count } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);
      console.log(`  ${category}: ${count} 条`);
    }

    console.log('\n✅ 测试数据生成完成！');

  } catch (error) {
    console.error('❌ 生成测试数据失败:', error);
    process.exit(1);
  }
}

// 运行
generateTestData();
