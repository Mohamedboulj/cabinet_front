import { type Margins } from "../../utils/medicalDocEditor.utils";
import { NumberInput } from "../ui/shared";

interface Props {
  margins:  Margins;
  pw:       number;
  ph:       number;
  onChange: (patch: Partial<Margins>) => void;
}

export function MarginDiagram({ margins, pw, ph, onChange }: Props) {
  return (
    <div style={{ background: "#f0fafa", borderRadius: 10, padding: 12, marginBottom: 4 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>

        <NumberInput value={margins.top} min={0} max={60} unit="↑ haut"
          onChange={v => onChange({ top: v })} />

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <NumberInput value={margins.left} min={0} max={60} unit="← G"
            onChange={v => onChange({ left: v })} />

          {/* Page thumbnail */}
          <div style={{
            width: 64, height: 76, border: "2px solid #3DBFB8", borderRadius: 2,
            background: "#fff", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, color: "#aaa", textAlign: "center", lineHeight: 1.4,
          }}>
            page<br />{pw}×{ph}
          </div>

          <NumberInput value={margins.right} min={0} max={60} unit="D →"
            onChange={v => onChange({ right: v })} />
        </div>

        <NumberInput value={margins.bottom} min={0} max={60} unit="↓ bas"
          onChange={v => onChange({ bottom: v })} />

      </div>
    </div>
  );
}
