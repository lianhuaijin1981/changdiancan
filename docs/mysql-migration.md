# 畅点餐 - MySQL 迁移指南

## 概述

本文档说明如何将项目从 SQLite 迁移到 MySQL，适用于生产环境部署。

---

## 一、创建 MySQL 数据库

### 1. 安装 MySQL（Ubuntu）

```bash
# 安装 MySQL 服务器
sudo apt update
sudo apt install -y mysql-server

# 启动服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全初始化（设置 root 密码）
sudo mysql_secure_installation
```

### 2. 创建数据库和用户

```sql
-- 登录 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE canting DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（替换 YOUR_PASSWORD 为强密码）
CREATE USER 'canting'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
CREATE USER 'canting'@'%' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';

-- 授权
GRANT ALL PRIVILEGES ON canting.* TO 'canting'@'localhost';
GRANT ALL PRIVILEGES ON canting.* TO 'canting'@'%';
FLUSH PRIVILEGES;

-- 验证
SHOW GRANTS FOR 'canting'@'localhost';
```

---

## 二、配置环境变量

### 1. 编辑 `.env` 文件

```bash
# backend/.env

# 数据库配置（替换为你的实际值）
DATABASE_URL=mysql+pymysql://canting:YOUR_STRONG_PASSWORD@localhost:3306/canting?charset=utf8mb4

# 环境模式
ENV_MODE=production

# CORS 白名单（替换为你的域名）
CORS_ORIGINS=["https://your-domain.com"]

# JWT 密钥（生成随机字符串）
SECRET_KEY=your_random_secret_key_at_least_32_chars
REFRESH_TOKEN_SECRET_KEY=another_random_secret_key_at_least_32_chars

# JWT 过期时间（秒）
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7天
REFRESH_TOKEN_EXPIRE_DAYS=30
```

### 2. 生成安全密钥

```bash
# 生成随机密钥
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## 三、数据迁移

### 1. 方案一：使用 Alembic 迁移

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 初始化 Alembic（如果尚未配置）
alembic init alembic

# 配置 alembic.ini
# sqlalchemy.url = mysql+pymysql://canting:YOUR_PASSWORD@localhost:3306/canting

# 生成迁移脚本
alembic revision --autogenerate -m "Initial migration"

# 执行迁移
alembic upgrade head
```

### 2. 方案二：直接导出导入

```bash
# 1. 导出 SQLite 数据（开发环境）
# 在 SQLite 数据库中执行导出

# 2. 创建 MySQL 表结构
# 使用 SQLAlchemy 自动创建

# 3. 数据导入
mysql -u canting -p canting < data.sql
```

---

## 四、连接池配置

后端已配置连接池参数（在 `app/config.py` 中）：

```python
# 数据库连接池配置
DB_POOL_SIZE: int = 10          # 连接池最小连接数
DB_MAX_OVERFLOW: int = 20       # 连接池最大溢出数
DB_POOL_TIMEOUT: int = 30      # 连接获取超时（秒）
DB_POOL_RECYCLE: int = 3600    # 连接回收时间（秒）
```

根据服务器配置调整：

| 服务器规格 | 推荐配置 |
|-----------|---------|
| 1核2G | pool_size=5, max_overflow=10 |
| 2核4G | pool_size=10, max_overflow=20 |
| 4核8G | pool_size=20, max_overflow=40 |

---

## 五、验证迁移

### 1. 启动服务

```bash
cd backend
python run.py
```

### 2. 健康检查

```bash
curl http://localhost:8000/api/health
```

预期响应：
```json
{
  "status": "healthy",
  "db_connected": true,
  "mode": "production"
}
```

### 3. 测试 API

```bash
# 注册新用户
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"test123"}'
```

---

## 六、常见问题

### Q1: 连接被拒绝

检查：
1. MySQL 服务是否运行：`sudo systemctl status mysql`
2. 防火墙是否开放 3306 端口
3. 用户权限是否正确

### Q2: 字符集问题

确保使用 `utf8mb4` 字符集以支持表情符号：

```sql
ALTER DATABASE canting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Q3: 连接超时

调整连接参数：

```python
# 在 create_engine 中添加
connect_args = {
    "connect_timeout": 60,
    "read_timeout": 60,
    "write_timeout": 60,
}
```

---

## 七、回滚方案

如果迁移出现问题，可以回滚到 SQLite：

```bash
# 1. 修改 .env
DATABASE_URL=sqlite:///./canting.db

# 2. 重启服务
# 数据已在 SQLite 中保留
```

---

*文档生成日期：2026-05-08*
