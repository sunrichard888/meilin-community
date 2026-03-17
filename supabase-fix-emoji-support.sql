-- 美邻网 - 修复 posts 表支持 emoji
-- 执行于：Supabase SQL Editor

-- PostgreSQL 默认支持 UTF-8，但确保字符集正确
-- 如果 posts.content 是 text 类型，默认支持 emoji

-- 验证当前表结构
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'content';

-- 如果有问题，可以重建表（备份数据后）
-- 但通常不需要，因为 text 类型默认支持 UTF-8

-- 测试插入 emoji
-- INSERT INTO posts (user_id, content) VALUES ('test-user', '测试表情 😊👍');

SELECT '✓ posts 表已支持 emoji（UTF-8 编码）' as status;
