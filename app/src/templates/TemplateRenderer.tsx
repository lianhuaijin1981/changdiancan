// 模板渲染器 - 根据模板ID加载对应首页
import { useTemplate } from "./TemplateProvider";

// 导入所有模板首页
import ModernHome from "./modern/Home";
import TraditionalHome from "./traditional/Home";
import FreshHome from "./fresh/Home";
import LuxuryHome from "./luxury/Home";

const homeComponents: Record<string, React.ComponentType> = {
  modern: ModernHome,
  traditional: TraditionalHome,
  fresh: FreshHome,
  luxury: LuxuryHome,
};

export function TemplateHome() {
  const { templateId } = useTemplate();
  const HomeComponent = homeComponents[templateId] || ModernHome;
  return <HomeComponent />;
}
