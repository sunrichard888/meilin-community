# Domain Glossary — 美邻网

This glossary defines core domain terms, types, and actions for the Meilin Community Network. All team members should use these terms consistently.

## Core Types

| Term | Definition | Example/Notes |
|------|------------|---------------|
| **User** | A registered member of the community | Has nickname, avatar, join date |
| **Neighbor** | A User who lives in the same geographic area | Implies local connection |
| **Post** | A user-generated content item in the feed | Text + optional images |
| **Comment** | A response to a Post | Threaded under the post |
| **Like** | A positive reaction to a Post | Count displayed on post |
| **Feed** | The main content stream showing recent Posts | Chronological or algorithmic |
| **Notification** | An alert about activity relevant to the user | Likes, comments, follows |
| **Report** | A flag for inappropriate content | Triggers moderation review |
| **Block** | A user action to hide another user's content | Prevents interaction |
| **Follow** | A subscription to another user's posts | Optional social graph |

## Actions

| Action | Actor | Description |
|--------|-------|-------------|
| **Sign Up** | Guest | Create a new account with email/password |
| **Log In** | User | Authenticate and start a session |
| **Log Out** | User | End the current session |
| **Create Post** | User | Publish a new post to the feed |
| **Edit Post** | Post Author | Modify an existing post |
| **Delete Post** | Post Author / Moderator | Remove a post |
| **Like Post** | User | Express appreciation for a post |
| **Comment** | User | Add a response to a post |
| **Report** | User | Flag content for moderation |
| **Block User** | User | Hide another user's content |
| **Follow User** | User | Subscribe to another user's posts |
| **Upload Image** | User | Add images to a post |

## Errors

| Error | Context | User Message |
|-------|---------|--------------|
| **AuthFailed** | Login/signup fails | "邮箱或密码错误" |
| **Unauthorized** | Accessing without login | "请先登录" |
| **NotFound** | Resource doesn't exist | "内容不存在" |
| **RateLimited** | Too many requests | "操作太频繁，请稍后再试" |
| **InvalidInput** | Form validation fails | Field-specific message |
| **NetworkError** | API connection fails | "网络连接失败，请检查网络" |
| **ContentRemoved** | Moderated content | "该内容因违反社区规范已被移除" |

## Type Design Principles

1. **User-Centric Language**: Use terms users understand (邻居，帖子) not technical terms (entity, record).
2. **Consistent Naming**: Same concept = same term everywhere. No synonym drift.
3. **Action Verbs**: Actions are clear verbs (Create, Delete, Block) not vague terms (Handle, Process).
4. **Error Clarity**: Error types map to user-facing messages. Technical details logged, not shown.
5. **Extensibility**: Types support future features (Follow, Groups) without breaking changes.

## Naming Conventions

- **Database Tables**: snake_case plural (`users`, `posts`, `comments`)
- **TypeScript Types**: PascalCase singular (`User`, `Post`, `Comment`)
- **API Routes**: kebab-case plural (`/api/users`, `/api/posts`)
- **Component Names**: PascalCase descriptive (`PostCard`, `CommentList`)
- **CSS Classes**: kebab-case (`post-card`, `comment-list`)
