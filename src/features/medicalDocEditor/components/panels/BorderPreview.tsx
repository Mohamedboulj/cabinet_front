import { scaleBorder, C, type BorderConfig } from "../../utils/medicalDocEditor.utils";
import { BorderFrame } from "../document/BorderFrame";

interface Props { border: BorderConfig; }

export function BorderPreview({ border }: Props) {
  const scaled = scaleBorder(border, 0.4);

  return (
    <>
      <div style={{ fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
        Aperçu
      </div>
      <div style={{
        height: 100, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f5f5f5", borderRadius: 8, padding: 8, marginBottom: 10,
      }}>
        <div style={{ width: 100, height: 78, background: "#fff", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,.1)" }}>
          <BorderFrame b={scaled} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#ccc", zIndex: 0 }}>
            aperçu
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#888" }}>
        <span>Décalage : <strong style={{ color: C.teal }}>{border.offset}px</strong> du bord</span>
        <span>Épaisseur : <strong style={{ color: C.teal }}>{border.width}px</strong></span>
      </div>
    </>
  );
}
