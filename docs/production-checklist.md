# 畅点餐 - 上线前检查清单与缺陷复盘

> 本文档记录当前版本的所有已知缺陷、技术债务，以及正式上线前必须完成的全部事项。

---

## 一、当前版本缺陷复盘

### A. 技术架构缺陷（高优先级）

| # | 缺陷 | 影响 | 严重程度 | 修复方案 |
|---|------|------|----------|----------|
| 1 | **前端JS包过大(3.3MB)** | 首次加载慢，用户体验差 | 高 | 代码分割(Code Splitting)、懒加载各端 |
| 2 | **无代码分割** | 所有页面打包在一个JS文件 | 高 | React.lazy + Suspense 按路由拆分 |
| 3 | **缺少Error Boundary** | 页面崩溃无降级处理，白屏 | 高 | 添加全局ErrorBoundary组件 |
| 4 | **API无请求限流** | 容易被恶意刷接口 | 高 | 添加 slowapi 限流中间件 |
| 5 | **CORS开放为 *（所有域名）** | 安全风险，CSRF攻击 | 高 | 配置CORS白名单，只允许指定域名 |
| 6 | **SQLite不适合生产** | 并发差、无远程访问、易损坏 | 高 | 迁移到MySQL/PostgreSQL |
| 7 | **JWT无刷新机制** | Token过期后用户被踢出 | 中 | 添加refresh_token机制 |
| 8 | **密码HTTP明文传输** | 中间人可截获密码 | 中 | 强制HTTPS + 前端密码加密传输 |
| 9 | **无输入长度限制** | SQL注入/XSS风险（虽然ORM有防护） | 中 | Pydantic字段加max_length限制 |
| 10 | **缺少审计日志** | 无法追踪谁改了什么 | 中 | 添加操作日志表 |

### B. 业务功能缺陷（中优先级）

| # | 缺陷 | 影响 | 严重程度 | 修复方案 |
|---|------|------|----------|----------|
| 1 | **无订单超时自动取消** | 待支付订单永远挂在那 | 高 | 添加定时任务，30分钟未支付自动取消 |
| 2 | **无库存扣减** | 超卖风险 | 高 | 下单时扣库存，取消时回滚 |
| 3 | **并发下单无锁** | 多人同时点同菜品超卖 | 高 | 数据库乐观锁/悲观锁 |
| 4 | **无打印对接** | 后厨看不到订单，靠手机 | 高 | 对接云打印（易联云/飞鹅） |
| 5 | **骑手端无地图导航** | 骑手不知道去哪送餐 | 中 | 接入腾讯/高德地图SDK |
| 6 | **无数据导出** | 老板要Excel报表给不了 | 中 | 添加订单/数据导出Excel功能 |
| 7 | **无财务报表** | 营收/成本/利润看不到 | 中 | 添加日/月/年财务报表 |
| 8 | **缺少库存预警** | 菜品卖完了不知道 | 中 | 库存低于阈值弹窗提醒 |
| 9 | **无扫码绑定桌台完整流程** | 用户扫码后需要手动选桌 | 低 | 桌台二维码带参数自动绑定 |
| 10 | **无数据备份恢复** | 数据丢失无法恢复 | 高 | 自动定时备份 |

### C. 性能与运维缺陷

| # | 缺陷 | 影响 | 严重程度 | 修复方案 |
|---|------|------|----------|----------|
| 1 | **无缓存机制** | 每次请求查数据库 | 中 | Redis缓存热门数据 |
| 2 | **图片无CDN** | 加载慢、耗服务器带宽 | 中 | 接入阿里云OSS+CDN |
| 3 | **无监控告警** | 出问题了不知道 | 高 | 接入Sentry/钉钉告警 |
| 4 | **无日志收集** | 排查问题靠猜 | 中 | 配置结构化日志+日志文件 |
| 5 | **无优雅关闭** | 重启时丢请求 | 低 | FastAPI graceful shutdown |
| 6 | **无数据库连接池** | 高并发下连接数暴涨 | 中 | SQLAlchemy连接池配置 |

---

## 二、正式上线必备清单

### Phase 1: 基础设施（必须先完成）

- [ ] **购买云服务器**
  - 推荐：阿里云ECS / 腾讯云CVM
  - 配置：2核4G起步，带宽3-5M
  - 系统：Ubuntu 22.04 LTS
  - 费用：约 ¥500-1000/年

- [ ] **购买域名 + 备案**
  - 域名：.com/.cn 均可（约 ¥60-100/年）
  - 备案：国内服务器必须备案（7-20个工作日）
  - 解析：A记录指向服务器IP

- [ ] **配置HTTPS（SSL证书）**
  - 推荐：Let's Encrypt免费证书 / 阿里云免费SSL
  - 必须：微信支付要求HTTPS
  - 工具：Certbot自动续期

- [ ] **安装基础环境**
  ```bash
  # 服务器上执行
  apt update && apt install -y python3-pip nginx git certbot
  pip3 install virtualenv
  ```

### Phase 2: 后端部署

- [ ] **数据库迁移到MySQL**
  ```bash
  apt install -y mysql-server
  # 创建数据库
  CREATE DATABASE canting DEFAULT CHARSET utf8mb4;
  # 修改 backend/.env: DATABASE_URL=mysql+pymysql://user:pass@localhost/canting
  ```

- [ ] **配置环境变量**
  ```bash
  # backend/.env
  DATABASE_URL=mysql+pymysql://canting:your_password@localhost/canting
  SECRET_KEY=your_random_secret_key_here
  WXPAY_APPID=your_appid
  WXPAY_MCHID=your_mchid
  WXPAY_KEY=your_api_key
  WXPAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify
  ```

- [ ] **上传商户证书**
  ```
  backend/certs/
  ├── apiclient_cert.pem
  └── apiclient_key.pem
  ```

- [ ] **配置Nginx反向代理**
  ```nginx
  server {
      listen 80;
      server_name yourdomain.com;
      return 301 https://$server_name$request_uri;
  }

  server {
      listen 443 ssl;
      server_name yourdomain.com;

      ssl_certificate /path/to/cert.pem;
      ssl_certificate_key /path/to/key.pem;

      location / {
          root /path/to/app/dist;
          try_files $uri $uri/ /index.html;
      }

      location /api/ {
          proxy_pass http://127.0.0.1:8000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  }
  ```

- [ ] **配置Systemd服务**
  ```ini
  # /etc/systemd/system/canting.service
  [Unit]
  Description=Canting FastAPI Service
  After=network.target

  [Service]
  User=www-data
  WorkingDirectory=/path/to/backend
  ExecStart=/path/to/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
  Restart=always
  Environment=PYTHONPATH=/path/to/backend

  [Install]
  WantedBy=multi-user.target
  ```

- [ ] **前端API地址改为生产环境**
  ```typescript
  // 所有 api/client.ts 中的 API_BASE
  const API_BASE = "https://yourdomain.com/api";  // 原来是 localhost:8000
  ```

- [ ] **重新构建前端**
  ```bash
  cd app && npm run build
  # 将dist目录上传到服务器
  ```

### Phase 3: 微信支付配置

- [ ] 注册微信支付商户号
- [ ] 获取APPID、商户号、API密钥
- [ ] 下载商户证书
- [ ] 配置支付授权目录（商户后台）
  - JSAPI支付授权目录：`https://yourdomain.com/app/#/`
  - H5支付域名：`yourdomain.com`
- [ ] 配置回调URL（.env中的WXPAY_NOTIFY_URL）
- [ ] 测试支付流程

### Phase 4: 安全加固

- [ ] **修改CORS白名单**
  ```python
  # backend/app/main.py
  allow_origins=["https://yourdomain.com"]  # 不要*
  ```

- [ ] **添加限流中间件**
  ```bash
  pip install slowapi
  ```

- [ ] **添加请求日志**
  ```python
  # 记录所有API请求到文件
  ```

- [ ] **配置防火墙**
  ```bash
  ufw allow 22/tcp    # SSH
  ufw allow 80/tcp    # HTTP
  ufw allow 443/tcp   # HTTPS
  ufw enable
  ```

### Phase 5: 数据备份

- [ ] **配置MySQL自动备份**
  ```bash
  # 每天凌晨3点备份
  0 3 * * * mysqldump -u root -p canting > /backup/canting_$(date +\%Y\%m\%d).sql
  ```

- [ ] **配置备份上传到OSS**
  ```bash
  # 阿里云OSS自动上传脚本
  ```

### Phase 6: 监控告警

- [ ] **配置服务监控**
  - 推荐：阿里云云监控 / UptimeRobot
  - 监控：服务器CPU/内存/磁盘、API可用性

- [ ] **配置日志收集**
  ```bash
  # 安装logrotate
  apt install logrotate
  # 配置日志轮转
  ```

- [ ] **添加应用监控（可选）**
  - Sentry：应用错误监控（免费版够用）
  - 钉钉Webhook：服务异常时告警

### Phase 7: 业务功能完善（上线前必须）

- [ ] **订单超时自动取消**
  ```bash
  # 配置定时任务（APScheduler或Linux crontab）
  # 每5分钟扫描一次，关闭超时未支付订单
  ```

- [ ] **库存扣减逻辑**
  - 下单时扣库存
  - 取消/退款时回滚库存
  - 库存不足时阻止下单

- [ ] **云打印对接（强烈建议）**
  - 后厨打印：订单详情
  - 前台打印：收银小票
  - 推荐：易联云 / 飞鹅云打印（API接入简单）

---

## 三、建议的上线顺序

```
Week 1: 服务器 + 域名 + 备案 + HTTPS
Week 2: 后端部署 + MySQL迁移 + Nginx配置
Week 3: 微信支付商户号申请 + 配置
Week 4: 安全加固 + 数据备份 + 监控
Week 5: 业务功能完善 + 打印对接 + 测试
Week 6: 正式上线 + 监控观察
```

---

## 四、最小可行上线（MVP）

如果希望尽快上线接单，以下是最小配置：

**必须项（缺一不可）：**
1. ✅ 云服务器
2. ✅ 域名 + 备案
3. ✅ HTTPS证书
4. ✅ MySQL数据库
5. ✅ Nginx反向代理
6. ✅ 微信支付商户号
7. ✅ 商户证书
8. ✅ CORS白名单
9. ✅ 前端API地址改为生产

**强烈建议（影响体验）：**
10. 订单超时自动取消
11. 云打印对接
12. 数据自动备份

---

## 五、长期规划

| 阶段 | 时间 | 内容 |
|------|------|------|
| V1上线 | 第1-2个月 | 基础功能跑通，接第一个客户 |
| V2优化 | 第3-4个月 | 云打印、财务报表、库存预警 |
| V3扩展 | 第5-6个月 | 多语言、小程序原生版、营销工具 |
| V4商业化 | 第7-12个月 | 多城市、加盟体系、数据分析 |

---

*文档生成日期：2026-05-04*
*适用版本：v4.1.0*
