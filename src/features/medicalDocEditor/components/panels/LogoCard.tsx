import { LOGO_POSITIONS, C, type Logo, type LogoPositionId } from "../../utils/medicalDocEditor.utils";
import { SliderRow } from "../ui/shared";

interface Props {
  logo:       Logo;
  isActive:   boolean;
  position:   LogoPositionId;
  size:       number;
  opacity:    number;
  onSelect:   () => void;
  onRemove:   () => void;
  onPosition: (pos: LogoPositionId) => void;
  onSize:     (v: number) => void;
  onOpacity:  (v: number) => void;
}

export function LogoCard({ logo, isActive, position, size, opacity, onSelect, onRemove, onPosition, onSize, onOpacity }: Props) {
  return (
    <div onClick={onSelect} style={{
      border: `2px solid ${isActive ? C.teal : C.border}`,
      borderRadius: 10, padding: 12, marginBottom: 12,
      background: isActive ? C.tealLight : "#fafefe", cursor: "pointer",
    }}>

      {/* Preview row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <img src={logo.src} alt="" style={{ height: 40, objectFit: "contain", maxWidth: 64, borderRadius: 4, border: `1px solid ${C.border}` }} />
        <div style={{ flex: 1, fontSize: 11, color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{logo.name}</div>
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ border: "none", background: "none", cursor: "pointer", color: "#c44", fontSize: 16, lineHeight: 1 }}>✕</button>
      </div>

      {/* Position grid — 3×2 */}
      <div style={{ fontSize: 10, color: "#999", fontWeight: 700, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Position</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginBottom: 10 }}>
        {LOGO_POSITIONS.map(pos => (
          <button key={pos.id} onClick={e => { e.stopPropagation(); onPosition(pos.id); }} style={{
            padding: "5px 2px", fontSize: 9.5, textAlign: "center",
            border: `1px solid ${position === pos.id ? C.teal : C.border}`,
            borderRadius: 5,
            background: position === pos.id ? C.teal : "#fff",
            color: position === pos.id ? "#fff" : "#555",
            cursor: "pointer", lineHeight: 1.3,
          }}>
            {pos.icon}<br />{pos.label}
          </button>
        ))}
      </div>

      <SliderRow label="Taille"   value={size}                    min={30}  max={280} onChange={onSize}              unit="px" />
      <SliderRow label="Opacité"  value={Math.round(opacity * 100)} min={5} max={100} onChange={v => onOpacity(v / 100)} unit="%" />
    </div>
  );
}
