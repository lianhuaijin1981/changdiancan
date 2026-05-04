import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getTemplate, DEFAULT_TEMPLATE, type TemplateConfig } from "./config";

interface TemplateContextType {
  template: TemplateConfig;
  templateId: string;
  setTemplateId: (id: string) => void;
}

const TemplateContext = createContext<TemplateContextType | null>(null);

export function TemplateProvider({ 
  children,
  initialTemplateId = DEFAULT_TEMPLATE 
}: { 
  children: ReactNode;
  initialTemplateId?: string;
}) {
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const template = getTemplate(templateId);

  // 当模板切换时，动态注入CSS变量
  useEffect(() => {
    const root = document.documentElement;
    const c = template.colors;
    const r = template.radius;
    const s = template.shadows;

    root.style.setProperty('--tmpl-primary', c.primary);
    root.style.setProperty('--tmpl-primary-light', c.primaryLight);
    root.style.setProperty('--tmpl-primary-dark', c.primaryDark);
    root.style.setProperty('--tmpl-secondary', c.secondary);
    root.style.setProperty('--tmpl-bg', c.background);
    root.style.setProperty('--tmpl-surface', c.surface);
    root.style.setProperty('--tmpl-surface-elevated', c.surfaceElevated);
    root.style.setProperty('--tmpl-text', c.text);
    root.style.setProperty('--tmpl-text-muted', c.textMuted);
    root.style.setProperty('--tmpl-text-inverse', c.textInverse);
    root.style.setProperty('--tmpl-border', c.border);
    root.style.setProperty('--tmpl-success', c.success);
    root.style.setProperty('--tmpl-warning', c.warning);
    root.style.setProperty('--tmpl-danger', c.danger);
    root.style.setProperty('--tmpl-badge-new', c.badgeNew);
    root.style.setProperty('--tmpl-badge-hot', c.badgeHot);
    root.style.setProperty('--tmpl-radius-sm', r.sm);
    root.style.setProperty('--tmpl-radius-md', r.md);
    root.style.setProperty('--tmpl-radius-lg', r.lg);
    root.style.setProperty('--tmpl-radius-xl', r.xl);
    root.style.setProperty('--tmpl-shadow-card', s.card);
    root.style.setProperty('--tmpl-shadow-elevated', s.elevated);
    root.style.setProperty('--tmpl-shadow-button', s.button);
    root.style.setProperty('--tmpl-heading-font', template.fonts.heading);
    root.style.setProperty('--tmpl-body-font', template.fonts.body);

    // 设置 body 背景色
    document.body.style.backgroundColor = c.background;
    document.body.style.color = c.text;
  }, [template]);

  return (
    <TemplateContext.Provider value={{ template, templateId, setTemplateId }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const ctx = useContext(TemplateContext);
  if (!ctx) throw new Error("useTemplate must be inside TemplateProvider");
  return ctx;
}
