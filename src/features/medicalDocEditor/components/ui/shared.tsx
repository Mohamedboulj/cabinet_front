import type { ReactNode } from "react";
import { C } from "../../utils/medicalDocEditor.utils";

export function Sep() {
  return <div style={{ width: 1, height: 20, background: C.border, margin: "0 3px" }} />;
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: 10, color: "#999", fontWeight: 700,
      marginBottom: 5, letterSpacing: 0.5, textTransform: "uppercase",
    }}>
      {children}
    </div>
  );
}

interface SliderRowProps {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; unit?: string;
}

export function SliderRow({ label, value, min, max, onChange, unit = "" }: SliderRowProps) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <Label>{label}</Label>
        <span style={{ fontSize: 10, color: C.teal, fontWeight: 700 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.teal }} />
    </div>
  );
}

interface NumberInputProps {
  value: number; min: number; max: number;
  onChange: (v: number) => void; unit?: string;
}

export function NumberInput({ value, min, max, onChange, unit }: NumberInputProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center",
      border: `1px solid ${C.border}`, borderRadius: 5,
      overflow: "hidden", background: "#fff",
    }}>
      <input
        type="number" min={min} max={max} value={value}
        onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        style={{ width: "100%", border: "none", padding: "5px 6px", fontSize: 12, color: C.navy, outline: "none", textAlign: "center" }}
      />
      {unit && (
        <span style={{ padding: "0 6px", fontSize: 10, color: "#999", background: "#f8f8f8", borderLeft: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
          {unit}
        </span>
      )}
    </div>
  );
}
