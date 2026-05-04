// 畅点餐 - 模板配置系统
// 定义所有可用的UI模板及其样式参数

export interface TemplateColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
  badgeNew: string;
  badgeHot: string;
}

export interface TemplateFonts {
  heading: string;
  body: string;
}

export interface TemplateRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface TemplateShadows {
  card: string;
  elevated: string;
  button: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: string[];
  colors: TemplateColors;
  fonts: TemplateFonts;
  radius: TemplateRadius;
  shadows: TemplateShadows;
  // 布局特征
  features: {
    homeLayout: 'banner-grid' | 'banner-list' | 'fullscreen' | 'minimal';
    categoryNav: 'left-sidebar' | 'top-pills' | 'grid-icons' | 'horizontal-scroll';
    dishCard: 'horizontal' | 'vertical' | 'compact' | 'elegant';
    cartStyle: 'floating-bar' | 'bottom-sheet' | 'badge-only';
    useBorders: boolean;
    useGradients: boolean;
    animationStyle: 'bounce' | 'fade' | 'slide' | 'none';
  };
}

export const TEMPLATES: Record<string, TemplateConfig> = {
  modern: {
    id: 'modern',
    name: '简约现代',
    description: '扁平化设计，暖橙主色调，适合快餐、连锁餐饮',
    category: ['快餐', '连锁餐饮', '小吃店', '食堂'],
    colors: {
      primary: '#FF6B35',
      primaryLight: '#FFF0EB',
      primaryDark: '#E55A2B',
      secondary: '#1A1A2E',
      background: '#F5F5F5',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      text: '#1A1A2E',
      textMuted: '#6B7280',
      textInverse: '#FFFFFF',
      border: '#E5E7EB',
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      badgeNew: '#10B981',
      badgeHot: '#EF4444',
    },
    fonts: {
      heading: '"PingFang SC", "Noto Sans SC", sans-serif',
      body: '"PingFang SC", "Noto Sans SC", sans-serif',
    },
    radius: {
      sm: '6px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      full: '9999px',
    },
    shadows: {
      card: '0 2px 8px rgba(0,0,0,0.06)',
      elevated: '0 4px 16px rgba(0,0,0,0.1)',
      button: '0 2px 8px rgba(255,107,53,0.3)',
    },
    features: {
      homeLayout: 'banner-grid',
      categoryNav: 'left-sidebar',
      dishCard: 'horizontal',
      cartStyle: 'floating-bar',
      useBorders: false,
      useGradients: true,
      animationStyle: 'bounce',
    },
  },

  traditional: {
    id: 'traditional',
    name: '中式传统',
    description: '中国红配金色，传统纹样装饰，适合中餐、火锅、茶楼',
    category: ['中餐', '火锅', '茶楼', '面馆', '烧烤'],
    colors: {
      primary: '#C41E3A',
      primaryLight: '#FFF5F5',
      primaryDark: '#A01830',
      secondary: '#8B4513',
      background: '#FDF8F0',
      surface: '#FFFCF8',
      surfaceElevated: '#FFFFFF',
      text: '#2D1810',
      textMuted: '#8B7355',
      textInverse: '#FFFFFF',
      border: '#E8D5C4',
      success: '#2E7D32',
      warning: '#ED6C02',
      danger: '#D32F2F',
      badgeNew: '#2E7D32',
      badgeHot: '#C41E3A',
    },
    fonts: {
      heading: '"Noto Serif SC", "Songti SC", serif',
      body: '"PingFang SC", "Noto Sans SC", sans-serif',
    },
    radius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    shadows: {
      card: '0 1px 4px rgba(139,69,19,0.08)',
      elevated: '0 2px 12px rgba(139,69,19,0.12)',
      button: '0 2px 8px rgba(196,30,58,0.25)',
    },
    features: {
      homeLayout: 'banner-list',
      categoryNav: 'grid-icons',
      dishCard: 'vertical',
      cartStyle: 'floating-bar',
      useBorders: true,
      useGradients: false,
      animationStyle: 'fade',
    },
  },

  fresh: {
    id: 'fresh',
    name: '清新文艺',
    description: '薄荷绿与马卡龙色系，手绘插画感，适合奶茶、咖啡、轻食',
    category: ['奶茶', '咖啡', '轻食', '烘焙', '甜品'],
    colors: {
      primary: '#4ECDC4',
      primaryLight: '#E8FAF8',
      primaryDark: '#3BA99A',
      secondary: '#FF6B9D',
      background: '#FAF9F6',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      text: '#2D3436',
      textMuted: '#95A5A6',
      textInverse: '#FFFFFF',
      border: '#E8E8E8',
      success: '#00B894',
      warning: '#FDCB6E',
      danger: '#D63031',
      badgeNew: '#00B894',
      badgeHot: '#FF6B9D',
    },
    fonts: {
      heading: '"PingFang SC", "Quicksand", sans-serif',
      body: '"PingFang SC", "Noto Sans SC", sans-serif',
    },
    radius: {
      sm: '12px',
      md: '20px',
      lg: '28px',
      xl: '36px',
      full: '9999px',
    },
    shadows: {
      card: '0 4px 12px rgba(78,205,196,0.08)',
      elevated: '0 8px 24px rgba(78,205,196,0.12)',
      button: '0 4px 12px rgba(78,205,196,0.25)',
    },
    features: {
      homeLayout: 'banner-grid',
      categoryNav: 'top-pills',
      dishCard: 'compact',
      cartStyle: 'floating-bar',
      useBorders: false,
      useGradients: true,
      animationStyle: 'slide',
    },
  },

  luxury: {
    id: 'luxury',
    name: '高端黑金',
    description: '深邃黑色配香槟金，极简留白，适合日料、西餐、高端餐厅',
    category: ['日料', '西餐', '高端中餐', '私房菜', '酒吧'],
    colors: {
      primary: '#C9A962',
      primaryLight: '#2A2520',
      primaryDark: '#B89A50',
      secondary: '#8A8075',
      background: '#0F0F0F',
      surface: '#1A1A1A',
      surfaceElevated: '#242424',
      text: '#F5F0E8',
      textMuted: '#8A8075',
      textInverse: '#0F0F0F',
      border: '#333333',
      success: '#4CAF50',
      warning: '#FF9800',
      danger: '#F44336',
      badgeNew: '#4CAF50',
      badgeHot: '#C9A962',
    },
    fonts: {
      heading: '"Noto Serif SC", "Playfair Display", serif',
      body: '"PingFang SC", "Noto Sans SC", sans-serif',
    },
    radius: {
      sm: '2px',
      md: '4px',
      lg: '8px',
      xl: '12px',
      full: '9999px',
    },
    shadows: {
      card: '0 1px 4px rgba(0,0,0,0.4)',
      elevated: '0 4px 16px rgba(0,0,0,0.5)',
      button: '0 2px 12px rgba(201,169,98,0.2)',
    },
    features: {
      homeLayout: 'minimal',
      categoryNav: 'horizontal-scroll',
      dishCard: 'elegant',
      cartStyle: 'badge-only',
      useBorders: true,
      useGradients: false,
      animationStyle: 'fade',
    },
  },
};

export const DEFAULT_TEMPLATE = 'modern';

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES[id] || TEMPLATES[DEFAULT_TEMPLATE];
}

export function getAllTemplates(): TemplateConfig[] {
  return Object.values(TEMPLATES);
}
