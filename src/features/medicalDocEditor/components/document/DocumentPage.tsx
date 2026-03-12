import { buildPageStyle } from "../../utils/medicalDocEditor.utils";
import type { UseMedicalDocEditor } from "../../hooks/useMedicalDocEditor";
import { BorderFrame }    from "./BorderFrame";
import { WatermarkLogos, CornerLogos } from "./LogoLayers";
import { DocumentHeader, DocumentBody, DocumentFooter } from "./DocumentSections";

type Props = Pick<UseMedicalDocEditor,
  | "logos" | "logoPositions" | "logoSizes" | "logoOpacities" | "hasTopLogos"
  | "border" | "pw" | "ph" | "margins" | "docFontSize" | "rtl" | "editTarget"
  | "headerRef" | "bodyRef" | "footerRef"
  | "setHeaderHtml" | "setBodyHtml" | "setFooterHtml"
  | "activateSection"
>;

export function DocumentPage({
  logos, logoPositions, logoSizes, logoOpacities, hasTopLogos,
  border, pw, ph, margins, docFontSize, rtl, editTarget,
  headerRef, bodyRef, footerRef,
  setHeaderHtml, setBodyHtml, setFooterHtml,
  activateSection,
}: Props) {
  const logoProps = { logos, logoPositions, logoSizes, logoOpacities };

  return (
    <div style={buildPageStyle(pw, ph, margins, docFontSize, rtl)}>

      {/* Layer 0 — border frame, inset by border.offset from page edge */}
      <BorderFrame b={border} />

      {/* Layer 0 — watermark logo(s) */}
      <WatermarkLogos {...logoProps} />

      {/* Top logo row */}
      {hasTopLogos && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, position: "relative", zIndex: 1 }}>
          <div style={{ flex: 1 }}><CornerLogos {...logoProps} pos="top-left"   justify="flex-start" /></div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}><CornerLogos {...logoProps} pos="top-center" justify="center" /></div>
          <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}><CornerLogos {...logoProps} pos="top-right"  justify="flex-end" /></div>
        </div>
      )}

      <DocumentHeader contentRef={headerRef} editTarget={editTarget}
        onActivate={() => activateSection("header")} onInput={setHeaderHtml} />

      <DocumentBody contentRef={bodyRef} editTarget={editTarget}
        onActivate={() => activateSection("body")} onInput={setBodyHtml} />

      <DocumentFooter contentRef={footerRef} editTarget={editTarget}
        onActivate={() => activateSection("footer")} onInput={setFooterHtml}
        leftSlot={<CornerLogos  {...logoProps} pos="bottom-left"  justify="flex-start" />}
        rightSlot={<CornerLogos {...logoProps} pos="bottom-right" justify="flex-end" />}
      />
    </div>
  );
}
