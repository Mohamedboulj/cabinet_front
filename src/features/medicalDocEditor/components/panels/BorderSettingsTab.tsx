import { BORDER_PATTERNS, BORDER_SWATCHES, C, type BorderConfig } from "../../utils/medicalDocEditor.utils";
import { Label, SliderRow } from "../ui/shared";
import { BorderPreview } from "./BorderPreview";

interface Props {
  border:       BorderConfig;
  updateBorder: (patch: Partial<BorderConfig>) => void;
}

export function BorderSettingsTab({ border, updateBorder }: Props) {
  return (
    <>
      {/* Enable toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, padding: "10px 12px", background: C.tealBg, borderRadius: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>Activer la bordure</span>
        <div onClick={() => updateBorder({ enabled: !border.enabled })} style={{
          width: 38, height: 20, borderRadius: 10, cursor: "pointer",
          background: border.enabled ? C.teal : "#ccc", position: "relative", transition: "background .2s",
        }}>
          <div style={{
            position: "absolute", top: 2, width: 16, height: 16, borderRadius: 8, background: "#fff",
            transition: "left .2s", left: border.enabled ? 20 : 2, boxShadow: "0 1px 4px rgba(0,0,0,.2)",
          }} />
        </div>
      </div>

      {border.enabled && (
        <>
          {/* Pattern grid */}
          <Label>Motif / Style</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 14 }}>
            {BORDER_PATTERNS.map(bp => (
              <button key={bp.id} onClick={() => updateBorder({ pattern: bp.id })} style={{
                padding: "8px 6px", textAlign: "center",
                border: `2px solid ${border.pattern === bp.id ? C.teal : C.border}`,
                borderRadius: 7,
                background: border.pattern === bp.id ? C.tealLight : "#fff",
                color: border.pattern === bp.id ? C.tealDark : "#555",
                cursor: "pointer",
              }}>
                <div style={{ fontSize: 13, marginBottom: 2, color: border.pattern === bp.id ? C.teal : "#aaa" }}>{bp.preview}</div>
                <div style={{ fontSize: 10, fontWeight: 600 }}>{bp.label}</div>
              </button>
            ))}
          </div>

          {/* Color */}
          <Label>Couleur</Label>
          <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
            <input type="color" value={border.color} onChange={e => updateBorder({ color: e.target.value })}
              style={{ width: 36, height: 36, border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer", padding: 2 }} />
            {BORDER_SWATCHES.map(clr => (
              <div key={clr} onClick={() => updateBorder({ color: clr })} style={{
                width: 22, height: 22, borderRadius: 4, background: clr, cursor: "pointer", flexShrink: 0,
                border: `2px solid ${border.color === clr ? "#333" : "transparent"}`,
              }} />
            ))}
          </div>

          <SliderRow label="Épaisseur"      value={border.width}  min={1} max={25} onChange={v => updateBorder({ width: v })}  unit="px" />
          <SliderRow label="Rayon des coins" value={border.radius} min={0} max={40} onChange={v => updateBorder({ radius: v })} unit="px" />

          {/* Offset */}
          <div style={{ background: C.tealBg, borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
            <SliderRow label="Marge de la bordure" value={border.offset} min={0} max={60}
              onChange={v => updateBorder({ offset: v })} unit="px" />
            <div style={{ fontSize: 10, color: "#999", lineHeight: 1.4, marginTop: -4 }}>
              Distance entre le bord de la page et la bordure.
            </div>
          </div>

          <BorderPreview border={border} />
        </>
      )}
    </>
  );
}
