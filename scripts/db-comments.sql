-- ============================================================================
--  数据库中文注释脚本（PostgreSQL）
--  作用：为 my_downloads 库中的所有表与主要业务字段添加中文注释，
--        方便在 pgAdmin / Navicat / DBeaver 等工具中理解每张表的含义。
--
--  特性：可重复执行（COMMENT ON 为幂等操作，重复运行会覆盖旧注释）。
--  运行：
--    psql -h 127.0.0.1 -U postgres -d my_downloads -f scripts/db-comments.sql
--
--  说明：本项目由 Payload CMS 自动生成表结构。带 _rels 后缀的是「关系表」，
--        带 _v 前缀的是「版本/草稿历史表」，payload_ 前缀的是框架系统表。
--        每次表结构变化（新增字段/集合）后可重新运行本脚本补齐注释。
-- ============================================================================

-- ========== 内容集合 ==========
COMMENT ON TABLE categories IS '分类：文章与软件的分类目录，支持嵌套父子层级';
COMMENT ON TABLE media      IS '媒体：图片/文件资源。支持本地上传，也支持仅填写外部图片 URL（external_url）';
COMMENT ON TABLE pages      IS '页面：自定义页面（首页、关于等），由区块拼装，支持草稿与版本';
COMMENT ON TABLE posts      IS '文章：博客/资讯文章，支持草稿与版本';
COMMENT ON TABLE series     IS '专题：把多篇文章聚合成的专题合集，支持草稿与版本';
COMMENT ON TABLE software   IS '软件：软件下载条目，含介绍/截图/下载文件/平台/下载次数，支持草稿与版本';

-- ========== 用户与互动 ==========
COMMENT ON TABLE users              IS '用户：后台/前台账号，role 区分 user/vip/admin 三种角色';
COMMENT ON TABLE users_sessions     IS '用户会话：登录会话记录（用于多端登录管理）';
COMMENT ON TABLE comments           IS '评论：用户对内容的评论，status 控制审核状态';
COMMENT ON TABLE favorites          IS '收藏：用户收藏的内容记录';
COMMENT ON TABLE messages           IS '留言：前台联系表单提交的留言/咨询';
COMMENT ON TABLE notifications      IS '通知：站内公告/通知，audience 指定受众，is_active 控制是否生效';
COMMENT ON TABLE notification_reads IS '通知已读：记录某用户已读某条通知';

-- ========== 全局配置 ==========
COMMENT ON TABLE header IS '页眉：全局页眉配置（导航等），全库仅一条';
COMMENT ON TABLE footer IS '页脚：全局页脚配置（导航等），全库仅一条';

-- ========== 搜索 ==========
COMMENT ON TABLE search            IS '搜索索引：由文章/软件同步生成，供站内搜索使用';
COMMENT ON TABLE search_categories IS '搜索索引-分类：搜索索引条目关联的分类快照';
COMMENT ON TABLE search_rels       IS '搜索索引-关系表：搜索索引指向原始文档的关联';

-- ========== 关系/子表（Payload 自动生成） ==========
COMMENT ON TABLE categories_breadcrumbs      IS '分类-面包屑：嵌套分类的层级路径';
COMMENT ON TABLE comments_rels               IS '评论-关系表：评论指向目标内容/用户的关联';
COMMENT ON TABLE favorites_rels              IS '收藏-关系表：收藏指向被收藏内容的关联';
COMMENT ON TABLE footer_nav_items            IS '页脚-导航项：页脚菜单条目';
COMMENT ON TABLE footer_rels                 IS '页脚-关系表：页脚内部链接的关联';
COMMENT ON TABLE header_nav_items            IS '页眉-导航项：页眉菜单条目';
COMMENT ON TABLE header_rels                 IS '页眉-关系表：页眉内部链接的关联';
COMMENT ON TABLE pages_blocks_archive        IS '页面区块-归档：列表/归档展示区块';
COMMENT ON TABLE pages_blocks_content        IS '页面区块-内容：富文本内容区块';
COMMENT ON TABLE pages_blocks_content_columns IS '页面区块-内容列：内容区块内的分栏';
COMMENT ON TABLE pages_blocks_cta            IS '页面区块-CTA：行动号召区块';
COMMENT ON TABLE pages_blocks_cta_links      IS '页面区块-CTA链接：CTA 区块内的按钮/链接';
COMMENT ON TABLE pages_blocks_media_block    IS '页面区块-媒体：图片/视频展示区块';
COMMENT ON TABLE pages_hero_links            IS '页面-首屏链接：首屏 Hero 区域的按钮/链接';
COMMENT ON TABLE pages_rels                  IS '页面-关系表：页面内部引用的关联';
COMMENT ON TABLE posts_populated_authors     IS '文章-作者（冗余）：为提升查询性能冗余存储的作者信息';
COMMENT ON TABLE posts_rels                  IS '文章-关系表：文章的分类/相关文章/作者等关联';
COMMENT ON TABLE series_rels                 IS '专题-关系表：专题包含的文章等关联（有序）';
COMMENT ON TABLE software_download_files     IS '软件-下载文件：某软件的多个下载项（含权限/平台/来源）';
COMMENT ON TABLE software_platform           IS '软件-支持平台：某软件支持的平台（windows/macos 等）';
COMMENT ON TABLE software_rels               IS '软件-关系表：软件的分类等关联';
COMMENT ON TABLE software_screenshots        IS '软件-截图：某软件的截图列表';

-- ========== 版本/草稿历史表（_v 前缀，用于草稿与回滚） ==========
COMMENT ON TABLE _pages_v                            IS '页面-版本历史';
COMMENT ON TABLE _pages_v_blocks_archive             IS '页面版本-归档区块';
COMMENT ON TABLE _pages_v_blocks_content             IS '页面版本-内容区块';
COMMENT ON TABLE _pages_v_blocks_content_columns     IS '页面版本-内容区块列';
COMMENT ON TABLE _pages_v_blocks_cta                 IS '页面版本-CTA 区块';
COMMENT ON TABLE _pages_v_blocks_cta_links           IS '页面版本-CTA 区块链接';
COMMENT ON TABLE _pages_v_blocks_media_block         IS '页面版本-媒体区块';
COMMENT ON TABLE _pages_v_rels                       IS '页面版本-关系表';
COMMENT ON TABLE _pages_v_version_hero_links         IS '页面版本-首屏链接';
COMMENT ON TABLE _posts_v                            IS '文章-版本历史';
COMMENT ON TABLE _posts_v_rels                       IS '文章版本-关系表';
COMMENT ON TABLE _posts_v_version_populated_authors  IS '文章版本-作者（冗余）';
COMMENT ON TABLE _series_v                           IS '专题-版本历史';
COMMENT ON TABLE _series_v_rels                      IS '专题版本-关系表';
COMMENT ON TABLE _software_v                         IS '软件-版本历史';
COMMENT ON TABLE _software_v_rels                    IS '软件版本-关系表';
COMMENT ON TABLE _software_v_version_download_files  IS '软件版本-下载文件';
COMMENT ON TABLE _software_v_version_platform        IS '软件版本-支持平台';
COMMENT ON TABLE _software_v_version_screenshots     IS '软件版本-截图';

-- ========== Payload 框架系统表 ==========
COMMENT ON TABLE payload_folders                 IS '系统-媒体文件夹：媒体库的文件夹组织结构';
COMMENT ON TABLE payload_folders_folder_type     IS '系统-文件夹类型';
COMMENT ON TABLE payload_jobs                    IS '系统-任务队列：后台定时/异步任务';
COMMENT ON TABLE payload_jobs_log                IS '系统-任务日志：任务执行日志';
COMMENT ON TABLE payload_kv                      IS '系统-键值存储：框架内部使用的 KV 缓存';
COMMENT ON TABLE payload_locked_documents        IS '系统-文档锁：后台正在编辑的文档锁定记录';
COMMENT ON TABLE payload_locked_documents_rels   IS '系统-文档锁关系表';
COMMENT ON TABLE payload_migrations              IS '系统-迁移记录：数据库结构迁移历史';
COMMENT ON TABLE payload_preferences             IS '系统-用户偏好：后台界面偏好（列宽/排序等）';
COMMENT ON TABLE payload_preferences_rels        IS '系统-用户偏好关系表';

-- ============================================================================
--  主要业务字段注释
-- ============================================================================

-- 媒体 media
COMMENT ON COLUMN media.id           IS '主键 ID';
COMMENT ON COLUMN media.alt          IS '替代文字（无障碍/SEO）';
COMMENT ON COLUMN media.caption      IS '说明文字（富文本）';
COMMENT ON COLUMN media.external_url IS '外部图片地址：填写后前台优先使用该 URL，可不上传本地文件';
COMMENT ON COLUMN media.url          IS '本地文件访问路径（上传后自动生成）';
COMMENT ON COLUMN media.filename     IS '本地文件名';
COMMENT ON COLUMN media.mime_type    IS '文件 MIME 类型';
COMMENT ON COLUMN media.filesize     IS '文件大小（字节）';
COMMENT ON COLUMN media.width        IS '图片宽度（像素）';
COMMENT ON COLUMN media.height       IS '图片高度（像素）';
COMMENT ON COLUMN media.focal_x      IS '焦点 X（裁剪时保留的重点位置）';
COMMENT ON COLUMN media.focal_y      IS '焦点 Y';
COMMENT ON COLUMN media.folder_id    IS '所属媒体文件夹 ID';
COMMENT ON COLUMN media.created_at   IS '创建时间';
COMMENT ON COLUMN media.updated_at   IS '更新时间';

-- 分类 categories
COMMENT ON COLUMN categories.id        IS '主键 ID';
COMMENT ON COLUMN categories.title     IS '分类名称';
COMMENT ON COLUMN categories.slug      IS 'URL 别名（用于路由）';
COMMENT ON COLUMN categories.parent_id IS '父分类 ID（嵌套分类）';

-- 文章 posts
COMMENT ON COLUMN posts.id            IS '主键 ID';
COMMENT ON COLUMN posts.title         IS '文章标题';
COMMENT ON COLUMN posts.hero_image_id IS '封面图（media 外键）';
COMMENT ON COLUMN posts.content       IS '正文内容（富文本/区块）';
COMMENT ON COLUMN posts.slug          IS 'URL 别名';
COMMENT ON COLUMN posts.published_at  IS '发布时间';
COMMENT ON COLUMN posts._status       IS '状态：draft 草稿 / published 已发布';

-- 软件 software
COMMENT ON COLUMN software.id             IS '主键 ID';
COMMENT ON COLUMN software.title          IS '软件名称';
COMMENT ON COLUMN software.thumbnail_id   IS '软件图标（media 外键）';
COMMENT ON COLUMN software.summary        IS '一句话简介（列表页展示）';
COMMENT ON COLUMN software.description    IS '详细介绍（富文本）';
COMMENT ON COLUMN software.version        IS '当前版本号';
COMMENT ON COLUMN software.featured       IS '是否推荐置顶';
COMMENT ON COLUMN software.download_count IS '下载次数（仅下载端点可写）';
COMMENT ON COLUMN software.slug           IS 'URL 别名';
COMMENT ON COLUMN software._status        IS '状态：draft 草稿 / published 已发布';

-- 软件下载文件 software_download_files
COMMENT ON COLUMN software_download_files.label         IS '版本标签（如 v2.1.0 Windows 64 位）';
COMMENT ON COLUMN software_download_files.platform      IS '适用平台';
COMMENT ON COLUMN software_download_files.file_size     IS '文件大小（展示用文本，如 32.5 MB）';
COMMENT ON COLUMN software_download_files.required_role IS '下载所需角色：user / vip / admin';
COMMENT ON COLUMN software_download_files.file_source   IS '文件来源：upload 本地上传 / url 外部链接';
COMMENT ON COLUMN software_download_files.file_id       IS '本地上传文件（media 外键）';
COMMENT ON COLUMN software_download_files.url           IS '外部下载地址';

-- 软件截图 software_screenshots
COMMENT ON COLUMN software_screenshots.image_id IS '截图（media 外键）';

-- 专题 series
COMMENT ON COLUMN series.id          IS '主键 ID';
COMMENT ON COLUMN series.title       IS '专题标题';
COMMENT ON COLUMN series.cover_id    IS '专题封面（media 外键）';
COMMENT ON COLUMN series.description IS '专题描述';
COMMENT ON COLUMN series.slug        IS 'URL 别名';
COMMENT ON COLUMN series._status     IS '状态：draft 草稿 / published 已发布';

-- 页面 pages
COMMENT ON COLUMN pages.id            IS '主键 ID';
COMMENT ON COLUMN pages.title         IS '页面标题';
COMMENT ON COLUMN pages.hero_type     IS '首屏类型';
COMMENT ON COLUMN pages.hero_media_id IS '首屏媒体（media 外键）';
COMMENT ON COLUMN pages.slug          IS 'URL 别名（home 映射到站点首页 /）';
COMMENT ON COLUMN pages._status       IS '状态：draft 草稿 / published 已发布';

-- 用户 users
COMMENT ON COLUMN users.id        IS '主键 ID';
COMMENT ON COLUMN users.name      IS '用户昵称/姓名';
COMMENT ON COLUMN users.role      IS '角色：user 普通 / vip 会员 / admin 管理员';
COMMENT ON COLUMN users.avatar_id IS '头像（media 外键）';
COMMENT ON COLUMN users.email     IS '登录邮箱（唯一）';

-- 留言 messages
COMMENT ON COLUMN messages.id             IS '主键 ID';
COMMENT ON COLUMN messages.name           IS '留言人姓名';
COMMENT ON COLUMN messages.email          IS '留言人邮箱';
COMMENT ON COLUMN messages.subject        IS '主题';
COMMENT ON COLUMN messages.software       IS '关联软件（可选）';
COMMENT ON COLUMN messages.contact_method IS '联系方式';
COMMENT ON COLUMN messages.message        IS '留言内容';
COMMENT ON COLUMN messages.status         IS '处理状态：new 新的 / resolved 已处理';
COMMENT ON COLUMN messages.source_page    IS '来源页面';

-- 评论 comments
COMMENT ON COLUMN comments.id        IS '主键 ID';
COMMENT ON COLUMN comments.content   IS '评论内容';
COMMENT ON COLUMN comments.author_id IS '评论作者（users 外键）';
COMMENT ON COLUMN comments.parent_id IS '父评论 ID（回复时指向被回复评论）';
COMMENT ON COLUMN comments.status    IS '审核状态';

-- 通知 notifications
COMMENT ON COLUMN notifications.id        IS '主键 ID';
COMMENT ON COLUMN notifications.title     IS '通知标题';
COMMENT ON COLUMN notifications.message   IS '通知内容';
COMMENT ON COLUMN notifications.audience  IS '受众范围';
COMMENT ON COLUMN notifications.link      IS '跳转链接';
COMMENT ON COLUMN notifications.is_active IS '是否生效';
