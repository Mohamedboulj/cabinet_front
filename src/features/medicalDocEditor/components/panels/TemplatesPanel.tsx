import { TEMPLATES, C, type TemplateKey } from "../../utils/medicalDocEditor.utils";
import { SliderRow } from "../ui/shared";

interface Props {
  activeTemplate: TemplateKey;
  applyTemplate: (key: TemplateKey) => void;
  rtl: boolean;
  setRtl: (v: boolean) => void;
  docFontSize: number;
  setDocFontSize: (v: number) => void;
}

export function TemplatesPanel({ activeTemplate, applyTemplate, rtl, setRtl, docFontSize, setDocFontSize }: Props) {
  return (
    <>
      {(Object.entries(TEMPLATES) as [TemplateKey, typeof TEMPLATES[TemplateKey]][]).map(([key, t]) => (
        <div key={key} onClick={() => applyTemplate(key)} style={{
          border: `2px solid ${activeTemplate === key ? C.teal : C.border}`,
          borderRadius: 8, padding: "11px 13px", marginBottom: 9, cursor: "pointer",
          background: activeTemplate === key ? C.tealLight : "#fff",
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.tealDark }}>{t.icon} {t.label}</div>
        </div>
      ))}

      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 13, marginTop: 5 }}>
        <div style={{ fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Langue / Direction
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {(["ltr", "rtl"] as const).map(dir => (
            <button key={dir} onClick={() => setRtl(dir === "rtl")} style={{
              flex: 1, padding: "7px 4px",
              border: `2px solid ${(rtl ? "rtl" : "ltr") === dir ? C.teal : C.border}`,
              borderRadius: 6,
              background: (rtl ? "rtl" : "ltr") === dir ? C.tealLight : "#fff",
              color: (rtl ? "rtl" : "ltr") === dir ? C.tealDark : "#666",
              cursor: "pointer", fontWeight: 700, fontSize: 11,
            }}>
              {dir === "ltr" ? "🇫🇷 LTR" : "🇲🇦 RTL"}
            </button>
          ))}
        </div>
        <SliderRow label="Taille police" value={docFontSize} min={9} max={18} onChange={setDocFontSize} unit="px" />
      </div>
    </>
  );
}
