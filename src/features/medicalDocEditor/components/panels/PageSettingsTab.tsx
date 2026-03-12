import { PAGE_SIZES, MARGIN_PRESETS, C, type Margins, type Orientation, type PageSize } from "../../utils/medicalDocEditor.utils";
import { Label } from "../ui/shared";
import { MarginDiagram } from "./MarginDiagram";

interface Props {
  pageSize:      PageSize;
  orientation:   Orientation;
  margins:       Margins;
  customSize:    { w: number; h: number };
  pw:            number;
  ph:            number;
  onPageSize:    (ps: PageSize) => void;
  onOrientation: (o: Orientation) => void;
  onMargins:     (patch: Partial<Margins>) => void;
  onCustomSize:  (dim: "w" | "h", v: number) => void;
}

export function PageSettingsTab({ pageSize, orientation, margins, customSize, pw, ph, onPageSize, onOrientation, onMargins, onCustomSize }: Props) {
  return (
    <>
      {/* Format presets */}
      <Label>Format de page</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {PAGE_SIZES.map(ps => (
          <button key={ps.name} onClick={() => onPageSize(ps)} style={{
            padding: "8px 4px", textAlign: "center",
            border: `2px solid ${pageSize.name === ps.name ? C.teal : C.border}`,
            borderRadius: 7,
            background: pageSize.name === ps.name ? C.tealLight : "#fff",
            color: pageSize.name === ps.name ? C.tealDark : "#555",
            cursor: "pointer", fontWeight: 700, fontSize: 12,
          }}>
            <div>{ps.name}</div>
            <div style={{ fontSize: 9, color: "#999", fontWeight: 400 }}>{ps.w}×{ps.h} mm</div>
          </button>
        ))}
      </div>

      {/* Custom dimensions */}
      <Label>Taille personnalisée</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {(["w", "h"] as const).map(dim => (
          <div key={dim}>
            <div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>{dim === "w" ? "Largeur" : "Hauteur"}</div>
            <input type="number" min={50} max={dim === "w" ? 500 : 700} value={customSize[dim]}
              onChange={e => onCustomSize(dim, Number(e.target.value))}
              style={{ width: "100%", border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 6px", fontSize: 12, color: "#1a3a5c", outline: "none", boxSizing: "border-box" }} />
          </div>
        ))}
      </div>

      {/* Orientation */}
      <Label>Orientation</Label>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {(["portrait", "landscape"] as const).map(o => (
          <button key={o} onClick={() => onOrientation(o)} style={{
            flex: 1, padding: "8px 4px",
            border: `2px solid ${orientation === o ? C.teal : C.border}`,
            borderRadius: 7,
            background: orientation === o ? C.tealLight : "#fff",
            color: orientation === o ? C.tealDark : "#555",
            cursor: "pointer", fontWeight: 700, fontSize: 12,
          }}>
            {o === "portrait" ? "▯ Portrait" : "▭ Paysage"}
          </button>
        ))}
      </div>

      {/* Margin presets */}
      <Label>Marges — Préréglages</Label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {MARGIN_PRESETS.map(mp => (
          <button key={mp.name} onClick={() => onMargins(mp)} style={{
            padding: "7px 4px", border: `1px solid ${C.border}`,
            borderRadius: 7, background: "#fff", color: "#555",
            cursor: "pointer", fontSize: 11, fontWeight: 600, textAlign: "center",
          }}>
            <div>{mp.name}</div>
            <div style={{ fontSize: 9, color: "#aaa" }}>{mp.top}mm</div>
          </button>
        ))}
      </div>

      {/* Fine-tune diagram */}
      <Label>Marges personnalisées (mm)</Label>
      <MarginDiagram margins={margins} pw={pw} ph={ph} onChange={onMargins} />
    </>
  );
}
