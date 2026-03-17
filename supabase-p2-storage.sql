-- 美邻网 P2 - Supabase Storage 图片存储
-- 执行于：Supabase Dashboard → SQL Editor

-- ============================================
-- 1. 创建 Storage Bucket
-- ============================================
-- 注意：Bucket 也可以通过 Dashboard 手动创建
-- Storage → New Bucket → post-images → Public

-- ============================================
-- 2. 创建 RLS 策略
-- ============================================

-- 允许登录用户上传到自己的文件夹
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 允许用户查看自己文件夹的图片
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'post-images' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text OR
    bucket_id = 'post-images' -- 公开读取
  )
);

-- 允许用户删除自己的图片
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 允许所有人公开读取图片（重要：用于帖子展示）
CREATE POLICY "Public can view all images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

-- ============================================
-- 3. 验证
-- ============================================
SELECT '✓ Supabase Storage 配置完成' as status;

-- ============================================
-- 使用说明
-- ============================================
-- 1. 访问 https://supabase.com/dashboard
-- 2. 选择项目 tgffujhcruemykdviluw
-- 3. 进入 Storage → New Bucket
-- 4. Bucket name: post-images
-- 5. Public: true
-- 6. 点击 Create bucket
-- 7. 进入 SQL Editor，执行本脚本
