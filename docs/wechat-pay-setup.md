# 畅点餐 - 微信支付配置指南

## 概述

畅点餐已集成完整的微信支付功能，支持：
- **JSAPI支付**：微信内浏览器调起支付
- **H5支付**：手机浏览器跳转微信支付
- **支付回调**：自动接收支付结果通知
- **订单查询**：主动查询支付状态
- **退款**：支持部分/全额退款

---

## 配置步骤

### 第一步：注册微信支付商户号

1. 访问 https://pay.weixin.qq.com/
2. 注册成为微信支付商户（需要企业资质或个体工商户）
3. 完成实名认证和资料审核（通常1-5个工作日）

### 第二步：获取必要参数

审核通过后，在商户后台获取以下参数：

| 参数 | 获取位置 | 说明 |
|------|----------|------|
| `APPID` | 微信支付 → 开发配置 → APPID | 公众号/小程序APPID |
| `商户号(mch_id)` | 账户中心 → 商户信息 | 10位数字 |
| `API密钥(APIv2 key)` | 账户中心 → API安全 → 设置API密钥 | 32位随机字符串 |
| `证书(apiclient_cert.pem)` | 账户中心 → API安全 → 下载证书 | 退款需要 |
| `证书密钥(apiclient_key.pem)` | 账户中心 → API安全 → 下载证书 | 退款需要 |

### 第三步：配置后端

在 `backend/.env` 文件中添加：

```bash
# 微信支付配置
WXPAY_APPID=wxd678efh567hg6787          # 你的公众号/小程序APPID
WXPAY_MCHID=1234567890                    # 你的商户号
WXPAY_KEY=Your32CharacterAPIv2KeyHere     # APIv2密钥（32位）
WXPAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify  # 回调URL

# 证书路径（退款需要，可选）
WXPAY_CERT_PATH=./certs/apiclient_cert.pem
WXPAY_KEY_PATH=./certs/apiclient_key.pem
```

**重要**：
- `WXPAY_NOTIFY_URL` 必须是公网可访问的HTTPS地址
- 回调URL不能带端口号
- 需要备案域名

### 第四步：配置支付授权目录

在微信商户后台设置：

1. 产品中心 → 开发配置 → 支付授权目录
2. 添加你的H5支付页面URL目录，例如：
   ```
   https://yourdomain.com/app/#/
   ```
3. 添加H5支付域名（如果是H5支付）

### 第五步：配置JSAPI支付

**获取用户openid**：

1. 用户访问H5页面时，需要通过微信网页授权获取code
2. 用code换取openid

前端代码示例：
```javascript
// 获取微信授权URL
const redirectUri = encodeURIComponent('https://yourdomain.com/app/#/callback');
const scope = 'snsapi_base';  // 静默授权
const authUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=STATE#wechat_redirect`;

// 用户授权后，后端用code换取openid
const getOpenid = async (code) => {
  const res = await api.get(`/auth/wechat-openid?code=${code}`);
  return res.openid;
};
```

### 第六步：上传证书（退款需要）

将下载的证书文件放到后端项目目录：

```
backend/
├── app/
├── certs/
│   ├── apiclient_cert.pem
│   └── apiclient_key.pem
└── .env
```

---

## 支付流程

```
用户下单 → 调起支付 → 统一下单API → 返回prepay_id → 调起微信支付 → 用户完成支付 → 微信回调通知 → 更新订单状态
```

---

## API接口说明

### 1. 统一下单

**POST** `/api/payment/unified-order`

请求参数：
```json
{
  "order_no": "CD20260504123456",
  "openid": "oUpF8uMuAJO_M2pxb1Q9zNjWeS6o",
  "pay_type": "wechat"
}
```

响应：
```json
{
  "code": 200,
  "message": "统一下单成功",
  "data": {
    "order_no": "CD20260504123456",
    "pay_params": {
      "appId": "wxd678efh567hg6787",
      "timeStamp": "1714812345",
      "nonceStr": "5K8264ILTKCH16CQ2502SI8ZNMTM67VS",
      "package": "prepay_id=wx201410272009395522657a690399285100",
      "signType": "MD5",
      "paySign": "C380BEC2BFD727A4B6845133519F3AD6"
    }
  }
}
```

### 2. 支付回调通知

**POST** `/api/payment/notify`

微信服务器主动推送的回调（XML格式）。

系统会自动：
- 验证签名
- 更新订单状态为"已支付"
- 记录交易流水号
- 返回成功响应给微信

### 3. 查询支付状态

**GET** `/api/payment/status/{order_no}`

主动查询订单支付状态，适用于回调丢失的情况。

### 4. 申请退款

**POST** `/api/payment/refund`

请求参数：
```json
{
  "order_no": "CD20260504123456",
  "refund_amount": 10.00,
  "reason": "用户申请退款"
}
```

**注意**：退款需要商户证书。

---

## 开发测试模式

如果暂时没有微信支付商户号，系统会自动使用**模拟支付模式**：

1. 统一下单返回 `mock_mode: true`
2. 前端显示"模拟支付"提示
3. 点击支付后直接标记成功
4. 用于开发和演示

---

## 常见问题

### Q: 提示"签名验证失败"
A: 检查API密钥是否正确，注意区分大小写。建议重新设置一次API密钥。

### Q: 提示"appid和mch_id不匹配"
A: APPID必须和商户号在同一个微信开放平台账号下绑定。

### Q: 回调收不到通知
A: 检查：
1. 回调URL是否为公网HTTPS
2. 服务器防火墙是否放行了微信IP段
3. 回调URL是否返回正确的XML响应

### Q: 退款提示"证书错误"
A: 检查证书路径是否正确，证书是否过期。微信证书通常每年需要更新。

---

## 安全建议

1. **API密钥保密**：不要提交到Git仓库，使用环境变量
2. **回调验签**：所有回调必须验证签名，防止伪造
3. **HTTPS**：支付相关接口必须使用HTTPS
4. **金额校验**：回调时校验金额是否与订单一致
5. **幂等处理**：同一订单多次回调只处理一次

---

## 费用说明

| 费率类型 | 费率 | 说明 |
|----------|------|------|
| 普通商户 | 0.6% | 餐饮类目 |
| 小微商户 | 0.38% | 个体工商户 |
| 退款 | 0% | 退款不收手续费 |

---

*配置日期：2026-05-04*
