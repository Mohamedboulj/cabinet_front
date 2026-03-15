import { useState, useRef, useEffect, useCallback } from "react";
import {
  TEMPLATES, PAGE_SIZES, getPageDimensions,
  type BorderConfig, type EditTarget, type LayoutTab,
  type Logo, type LogoPositionId, type Margins,
  type Orientation, type PageSize, type PanelId, type TemplateKey,
  getPopulatedTemplate,
} from "../utils/medicalDocEditor.utils";
import { useAuth } from "@/features/auth/hooks/useAuth";

const DEFAULT_BORDER: BorderConfig = {
  enabled: true, pattern: "solid", color: "#3DBFB8i",
  width: 8, radius: 0, offset: 8,
};

export function useMedicalDocEditor() {
  const { user } = useAuth();

  // ── Content ───────────────────────────────────────────────────────────────
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey>("repos");
  const [headerHtml, setHeaderHtml] = useState(TEMPLATES.repos.header);
  const [bodyHtml, setBodyHtml] = useState(TEMPLATES.repos.body);
  const [footerHtml, setFooterHtml] = useState(TEMPLATES.repos.footer);

  // ── Logos ─────────────────────────────────────────────────────────────────
  const [logos, setLogos] = useState<Logo[]>([]);
  const [logoPositions, setLogoPositions] = useState<Record<string, LogoPositionId>>({});
  const [logoSizes, setLogoSizes] = useState<Record<string, number>>({});
  const [logoOpacities, setLogoOpacities] = useState<Record<string, number>>({});
  const [activeLogoId, setActiveLogoId] = useState<string | null>(null);

  // ── Editor UI ─────────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<EditTarget>("body");
  const [activePanel, setActivePanel] = useState<PanelId>("templates");
  const [printMode, setPrintMode] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [docFontSize, setDocFontSize] = useState(13);

  // ── Page layout ───────────────────────────────────────────────────────────
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZES[0]);
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margins, setMargins] = useState<Margins>({ top: 18, right: 20, bottom: 18, left: 20 });
  const [customSize, setCustomSize] = useState({ w: 210, h: 297 });

  // ── Border ────────────────────────────────────────────────────────────────
  const [border, setBorder] = useState<BorderConfig>(DEFAULT_BORDER);
  const [layoutTab, setLayoutTab] = useState<LayoutTab>("page");

  // ── Refs ──────────────────────────────────────────────────────────────────
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seed contentEditable refs on mount and immediately populate with active user data if available
  useEffect(() => {
    const t = TEMPLATES[activeTemplate];
    const initialHeader = getPopulatedTemplate(t.header, user || undefined);
    const initialBody = getPopulatedTemplate(t.body, user || undefined);
    const initialFooter = getPopulatedTemplate(t.footer, user || undefined);

    setHeaderHtml(initialHeader);
    setBodyHtml(initialBody);
    setFooterHtml(initialFooter);

    if (headerRef.current) headerRef.current.innerHTML = initialHeader;
    if (bodyRef.current) bodyRef.current.innerHTML = initialBody;
    if (footerRef.current) footerRef.current.innerHTML = initialFooter;
    
    // We only want this to run once on mount, regardless of activeTemplate changes
    // User object is included in dependencies to ensure it populates correctly if user loads slightly after mount, 
    // but the template populating logic inside applyTemplate handles changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Derived values ────────────────────────────────────────────────────────
  const { pw, ph } = getPageDimensions(pageSize, orientation);

  const byPos = useCallback(
    (pos: LogoPositionId) => logos.filter(l => logoPositions[l.id] === pos),
    [logos, logoPositions],
  );

  const hasTopLogos =
    byPos("top-left").length + byPos("top-center").length + byPos("top-right").length > 0;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const getEditRef = useCallback(() => {
    if (editTarget === "header") return headerRef;
    if (editTarget === "footer") return footerRef;
    return bodyRef;
  }, [editTarget]);

  const exec = useCallback((cmd: string, val: string | null = null) => {
    getEditRef().current?.focus();
    document.execCommand(cmd, false, val ?? undefined);
  }, [getEditRef]);

  const applyTemplate = useCallback((key: TemplateKey) => {
    const t = TEMPLATES[key];
    setActiveTemplate(key);
    
    const newHeader = getPopulatedTemplate(t.header, user || undefined);
    const newBody = getPopulatedTemplate(t.body, user || undefined);
    const newFooter = getPopulatedTemplate(t.footer, user || undefined);
    
    setHeaderHtml(newHeader); setBodyHtml(newBody); setFooterHtml(newFooter);
    setTimeout(() => {
      if (headerRef.current) headerRef.current.innerHTML = newHeader;
      if (bodyRef.current) bodyRef.current.innerHTML = newBody;
      if (footerRef.current) footerRef.current.innerHTML = newFooter;
    }, 0);
  }, [user]);

  const handleLogoUpload = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const id = `logo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const src = ev.target?.result as string;
        setLogos(p => [...p, { id, src, name: file.name }]);
        setLogoPositions(p => ({ ...p, [id]: "top-center" }));
        setLogoSizes(p => ({ ...p, [id]: 90 }));
        setLogoOpacities(p => ({ ...p, [id]: 1 }));
        setActiveLogoId(id);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeLogo = useCallback((id: string) => {
    setLogos(p => p.filter(l => l.id !== id));
    setLogoPositions(p => { const n = { ...p }; delete n[id]; return n; });
    setLogoSizes(p => { const n = { ...p }; delete n[id]; return n; });
    setLogoOpacities(p => { const n = { ...p }; delete n[id]; return n; });
    setActiveLogoId(prev => (prev === id ? null : prev));
  }, []);

  const updateBorder = useCallback((patch: Partial<BorderConfig>) => {
    setBorder(p => ({ ...p, ...patch }));
  }, []);

  const updateMargins = useCallback((patch: Partial<Margins>) => {
    setMargins(p => ({ ...p, ...patch }));
  }, []);

  const updatePageSize = useCallback((ps: PageSize) => {
    setPageSize(ps);
    setCustomSize({ w: ps.w, h: ps.h });
  }, []);

  const updateCustomSize = useCallback((dim: "w" | "h", val: number) => {
    setCustomSize(p => {
      const next = { ...p, [dim]: val };
      setPageSize({ name: "Perso.", w: next.w, h: next.h });
      return next;
    });
  }, []);

  const activateSection = useCallback((target: EditTarget) => {
    setEditTarget(target);
    setActivePanel("section");
  }, []);

  return {
    // state
    activeTemplate, headerHtml, bodyHtml, footerHtml,
    logos, logoPositions, logoSizes, logoOpacities, activeLogoId,
    editTarget, activePanel, printMode, rtl, docFontSize,
    pageSize, orientation, margins, customSize, border, layoutTab,
    // derived
    pw, ph, hasTopLogos, byPos,
    // setters
    setHeaderHtml, setBodyHtml, setFooterHtml,
    setLogoPositions, setLogoSizes, setLogoOpacities, setActiveLogoId,
    setEditTarget, setActivePanel, setPrintMode, setRtl, setDocFontSize,
    setOrientation, setLayoutTab,
    // refs
    headerRef, bodyRef, footerRef, fileInputRef,
    // handlers
    exec, applyTemplate, handleLogoUpload, removeLogo,
    updateBorder, updateMargins, updatePageSize, updateCustomSize, activateSection,
  };
}

export type UseMedicalDocEditor = ReturnType<typeof useMedicalDocEditor>;
