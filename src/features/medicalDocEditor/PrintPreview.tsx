import { buildPageStyle, C } from "./utils/medicalDocEditor.utils";
import type { UseMedicalDocEditor } from "./hooks/useMedicalDocEditor";
import { BorderFrame } from "./components/document/BorderFrame";
import { WatermarkLogos, CornerLogos } from "./components/document/LogoLayers";

type Props = Pick<UseMedicalDocEditor,
  | "logos" | "logoPositions" | "logoSizes" | "logoOpacities" | "hasTopLogos"
  | "border" | "pw" | "ph" | "margins" | "docFontSize" | "rtl"
  | "headerRef" | "bodyRef" | "footerRef"
  | "headerHtml" | "bodyHtml" | "footerHtml"
  | "setPrintMode"
>;


export function PrintPreview({
  logos, logoPositions, logoSizes, logoOpacities, hasTopLogos,
  border, pw, ph, margins, docFontSize, rtl,
  headerRef, bodyRef, footerRef,
  headerHtml, bodyHtml, footerHtml,
  setPrintMode,
}: Props) {
  const pageStyle = { ...buildPageStyle(pw, ph, margins, docFontSize, rtl), margin: "0 auto", boxShadow: "none" };
  const logoProps = { logos, logoPositions, logoSizes, logoOpacities };

  return (
    <div style={pageStyle}>

      {/* Floating action buttons */}
      <button onClick={() => setPrintMode(false)} style={{ position: "fixed", top: 80, right: 16, zIndex: 999, padding: "8px 18px", background: C.navy, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>✕ Fermer</button>
      <button onClick={() => window.print()} style={{ position: "fixed", top: 80, right: 140, zIndex: 999, padding: "8px 18px", background: "#2e7d52", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>🖨 Imprimer</button>

      <BorderFrame b={border} />
      <WatermarkLogos {...logoProps} />

      {hasTopLogos && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1 }}><CornerLogos {...logoProps} pos="top-left" justify="flex-start" /></div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><CornerLogos {...logoProps} pos="top-center" justify="center" /></div>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><CornerLogos {...logoProps} pos="top-right" justify="flex-end" /></div>
        </div>
      )}

      <div style={{ borderBottom: `2px solid ${C.tealLight}`, paddingBottom: 14, marginBottom: 18, position: "relative", zIndex: 1 }}
        dangerouslySetInnerHTML={{ __html: headerRef.current?.innerHTML || headerHtml }} />

      <div style={{ minHeight: "160mm", lineHeight: 1.75, position: "relative", zIndex: 1 }}
        dangerouslySetInnerHTML={{ __html: bodyRef.current?.innerHTML || bodyHtml }} />

      <div style={{ borderTop: "1px solid #bbd8d8", paddingTop: 12, marginTop: 24, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <CornerLogos {...logoProps} pos="bottom-left" justify="flex-start" />
          <div style={{ flex: 1, textAlign: "center" }}
            dangerouslySetInnerHTML={{ __html: footerRef.current?.innerHTML || footerHtml }} />
          <CornerLogos {...logoProps} pos="bottom-right" justify="flex-end" />
        </div>
      </div>
    </div>
  );
}
