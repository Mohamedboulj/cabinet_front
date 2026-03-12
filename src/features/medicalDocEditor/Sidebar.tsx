import { SIDEBAR_TABS, C, type Logo, type LogoPositionId, type BorderConfig, type EditTarget, type LayoutTab, type Margins, type Orientation, type PageSize, type PanelId, type TemplateKey } from "./utils/medicalDocEditor.utils";
import type { RefObject } from "react";
import { TemplatesPanel } from "./components/panels/TemplatesPanel";
import { LogosPanel } from "./components/panels/LogosPanel";
import { LayoutPanel } from "./components/panels/LayoutPanel";
import { SectionsPanel } from "./components/panels/SectionsPanel";

interface Props {
  activePanel: PanelId;
  setActivePanel: (p: PanelId) => void;
  setPrintMode: (v: boolean) => void;
  // — templates
  activeTemplate: TemplateKey;
  applyTemplate: (k: TemplateKey) => void;
  rtl: boolean; setRtl: (v: boolean) => void;
  docFontSize: number; setDocFontSize: (v: number) => void;
  // — logos
  logos: Logo[]; logoPositions: Record<string, LogoPositionId>;
  logoSizes: Record<string, number>; logoOpacities: Record<string, number>;
  activeLogoId: string | null; fileInputRef: RefObject<HTMLInputElement>;
  onUploadClick: () => void; onFileChange: (f: FileList | null) => void;
  setActiveLogoId: (id: string) => void; removeLogo: (id: string) => void;
  setLogoPositions: (fn: (p: Record<string, LogoPositionId>) => Record<string, LogoPositionId>) => void;
  setLogoSizes: (fn: (p: Record<string, number>) => Record<string, number>) => void;
  setLogoOpacities: (fn: (p: Record<string, number>) => Record<string, number>) => void;
  // — layout
  layoutTab: LayoutTab; setLayoutTab: (t: LayoutTab) => void;
  pageSize: PageSize; orientation: Orientation;
  margins: Margins; customSize: { w: number; h: number };
  pw: number; ph: number; border: BorderConfig;
  onPageSize: (ps: PageSize) => void; onOrientation: (o: Orientation) => void;
  onMargins: (patch: Partial<Margins>) => void; onCustomSize: (dim: "w" | "h", v: number) => void;
  updateBorder: (patch: Partial<BorderConfig>) => void;
  // — sections
  editTarget: EditTarget; setEditTarget: (t: EditTarget) => void;
}

export function Sidebar({ activePanel, setActivePanel, setPrintMode, ...p }: Props) {
  return (
    <div style={{ width: 285, minWidth: 285, background: "#fff", borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Brand */}
      <div style={{ padding: "13px 18px", background: C.teal }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", letterSpacing: 0.3 }}>Cabinet MedDoc</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,.7)", marginTop: 1 }}>Éditeur de Documents Médicaux</div>
      </div>

      {/* 2×2 tab nav */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${C.border}` }}>
        {SIDEBAR_TABS.map(({ id, icon, label }) => (
          <button key={id} onClick={() => setActivePanel(id)} style={{
            padding: "8px 0", border: "none",
            background: activePanel === id ? C.tealBg : "#fff",
            borderBottom: `2px solid ${activePanel === id ? C.teal : "transparent"}`,
            cursor: "pointer", fontSize: 9, fontWeight: 800,
            color: activePanel === id ? C.tealDark : "#999",
            textTransform: "uppercase", letterSpacing: 0.4,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          }}>
            <span style={{ fontSize: 14 }}>{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {activePanel === "templates" && (
          <TemplatesPanel activeTemplate={p.activeTemplate} applyTemplate={p.applyTemplate}
            rtl={p.rtl} setRtl={p.setRtl} docFontSize={p.docFontSize} setDocFontSize={p.setDocFontSize} />
        )}
        {activePanel === "logo" && (
          <LogosPanel
            logos={p.logos} logoPositions={p.logoPositions}
            logoSizes={p.logoSizes} logoOpacities={p.logoOpacities}
            activeLogoId={p.activeLogoId} fileInputRef={p.fileInputRef}
            onUploadClick={p.onUploadClick} onFileChange={p.onFileChange}
            onSelect={p.setActiveLogoId} onRemove={p.removeLogo}
            onPosition={(id, pos) => p.setLogoPositions(prev => ({ ...prev, [id]: pos }))}
            onSize={(id, v) => p.setLogoSizes(prev => ({ ...prev, [id]: v }))}
            onOpacity={(id, v) => p.setLogoOpacities(prev => ({ ...prev, [id]: v }))}
          />
        )}
        {activePanel === "layout" && (
          <LayoutPanel
            layoutTab={p.layoutTab} setLayoutTab={p.setLayoutTab}
            pageSize={p.pageSize} orientation={p.orientation}
            margins={p.margins} customSize={p.customSize}
            pw={p.pw} ph={p.ph} border={p.border}
            onPageSize={p.onPageSize} onOrientation={p.onOrientation}
            onMargins={p.onMargins} onCustomSize={p.onCustomSize}
            updateBorder={p.updateBorder}
          />
        )}
        {activePanel === "section" && (
          <SectionsPanel editTarget={p.editTarget} activePanel={activePanel}
            setEditTarget={p.setEditTarget} setActivePanel={setActivePanel} />
        )}
      </div>

      {/* Print CTA */}
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => setPrintMode(true)}
          onMouseEnter={e => (e.currentTarget.style.background = C.tealDark)}
          onMouseLeave={e => (e.currentTarget.style.background = C.teal)}
          style={{ width: "100%", padding: 11, background: C.teal, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 900, fontSize: 13 }}
        >
          🖨 Aperçu &amp; Impression
        </button>
      </div>
    </div>
  );
}
