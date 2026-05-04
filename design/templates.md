# 餐饮小程序模板调研与设计

## 市场调研：主流餐饮小程序UI风格

基于餐饮行业品类特征和用户使用习惯，市场上常见的餐饮小程序模板可分为4大类：

| 模板类型 | 目标品类 | 核心色调 | 视觉特征 | 代表品牌参考 |
|----------|----------|----------|----------|-------------|
| **简约现代风** | 快餐、连锁餐饮、小吃 | 暖橙/橙红+白 | 扁平卡片、大图、清晰层级、高效操作 | 麦当劳、肯德基小程序 |
| **中式传统风** | 中餐、火锅、茶楼、面馆 | 中国红+金色+深木色 | 传统纹样、书法字体、卷轴元素、热闹氛围 | 海底捞、西贝小程序 |
| **清新文艺风** | 奶茶、咖啡、轻食、烘焙 | 薄荷绿/马卡龙粉+奶白 | 手绘插画、圆润元素、柔和阴影、治愈感 | 喜茶、奈雪小程序 |
| **高端黑金风** | 日料、西餐、高端中餐、私房菜 | 深黑+香槟金+象牙白 | 极简留白、大字体、高级感、克制配色 | 米其林餐厅小程序、Omakase预约 |

## 模板切换架构设计

### 1. 模板配置系统

```typescript
interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: string[];
  colors: TemplateColors;
  fonts: TemplateFonts;
  radius: TemplateRadius;
  shadows: TemplateShadows;
  assets: TemplateAssets;
}
```

### 2. 每套模板包含的组件

| 组件 | 说明 |
|------|------|
| `Home.tsx` | 首页（门店头图、分类、推荐、活动） |
| `Menu.tsx` | 点餐页（分类导航+菜品列表+购物车） |
| `DishCard.tsx` | 菜品卡片（展示样式差异最大） |
| `CategoryNav.tsx` | 分类导航（侧边栏/顶部标签/宫格） |
| `CartBar.tsx` | 底部购物车条 |
| `OrderCard.tsx` | 订单卡片 |
| `theme.css` | 样式变量覆盖 |

### 3. 动态加载机制

- 商家在注册/设置时选择 `template_id`
- 后端 Store 表存储 `template_id`
- 前端初始化时读取模板配置
- `TemplateProvider` 注入CSS变量和组件映射
- 路由组件通过 `useTemplate()` 获取当前模板组件

### 4. 开发计划

**后端改动：**
- Store 模型添加 `template_id` 字段（默认 'modern'）
- 商家端添加 `PUT /api/merchant/template` 切换模板API

**前端架构：**
- `src/templates/config.ts` — 所有模板配置
- `src/templates/TemplateProvider.tsx` — 模板上下文
- `src/templates/modern/` — 简约现代风
- `src/templates/traditional/` — 中式传统风
- `src/templates/fresh/` — 清新文艺风
- `src/templates/luxury/` — 高端黑金风

**商家端新增：**
- 模板选择页面（展示4套模板预览，点击切换）
