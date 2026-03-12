import { C, type BorderConfig, type EditTarget, type Margins, type PageSize } from "./utils/medicalDocEditor.utils";
import { ToolbarBtn } from "./components/ui/ToolbarBtn";
import { Sep } from "./components/ui/shared";

interface Props {
  editTarget: EditTarget;
  rtl: boolean;
  border: BorderConfig;
  pageSize: PageSize;
  orientation: string;
  pw: number;
  ph: number;
  margins: Margins;
  exec: (cmd: string, val?: string | null) => void;
  setRtl: (v: boolean) => void;
}

export function EditorToolbar({ editTarget, rtl, border, pageSize, orientation, pw, ph, margins, exec, setRtl }: Props) {
  const sectionLabel =
    editTarget === "header" ? "🔝 EN-TÊTE"
      : editTarget === "footer" ? "🔻 PIED"
        : "📝 CORPS";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 2, padding: "6px 14px",
      background: "#fff", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap",
    }}>

      {/* Active section badge */}
      <div style={{ fontSize: 10, fontWeight: 900, color: "#fff", background: C.teal, padding: "3px 10px", borderRadius: 12, marginRight: 6, letterSpacing: 0.5 }}>
        {sectionLabel}
      </div>
      <Sep />

      {/* Text formatting */}
      <ToolbarBtn onClick={() => exec("bold")} title="Gras"><b>G</b></ToolbarBtn>
      <ToolbarBtn onClick={() => exec("italic")} title="Italique"><em>I</em></ToolbarBtn>
      <ToolbarBtn onClick={() => exec("underline")} title="Souligné"><u>S</u></ToolbarBtn>
      <ToolbarBtn onClick={() => exec("strikeThrough")} title="Barré"><s>B</s></ToolbarBtn>
      <Sep />

      {/* Alignment */}
      <ToolbarBtn onClick={() => exec("justifyLeft")} title="Gauche">⬅</ToolbarBtn>
      <ToolbarBtn onClick={() => exec("justifyCenter")} title="Centre">↔</ToolbarBtn>
      <ToolbarBtn onClick={() => exec("justifyRight")} title="Droite">➡</ToolbarBtn>
      <Sep />

      {/* Lists */}
      <ToolbarBtn onClick={() => exec("insertOrderedList")} title="Liste numérotée">1.</ToolbarBtn>
      <ToolbarBtn onClick={() => exec("insertUnorderedList")} title="Liste à puces">•</ToolbarBtn>
      <Sep />

      {/* Block format */}
      <select onChange={e => exec("formatBlock", e.target.value)}
        style={{ padding: "3px 6px", border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12, color: C.navy, background: "#fff" }}>
        <option value="p">Paragraphe</option>
        <option value="h1">Titre 1</option>
        <option value="h2">Titre 2</option>
        <option value="h3">Titre 3</option>
      </select>
      <Sep />

      {/* Color */}
      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#888" }}>
        Couleur
        <input type="color" defaultValue={C.tealDark} onChange={e => exec("foreColor", e.target.value)}
          style={{ width: 26, height: 26, border: "none", borderRadius: 4, cursor: "pointer", padding: 1 }} />
      </label>
      <Sep />

      {/* History */}
      <ToolbarBtn onClick={() => exec("undo")} title="Annuler">↩</ToolbarBtn>
      <ToolbarBtn onClick={() => exec("redo")} title="Rétablir">↪</ToolbarBtn>
      <ToolbarBtn onClick={() => exec("removeFormat")} title="Effacer format"><span style={{ fontSize: 11 }}>✕fmt</span></ToolbarBtn>
      <Sep />

      {/* RTL toggle */}
      <ToolbarBtn onClick={() => setRtl(!rtl)} title="Basculer RTL/LTR" active={rtl}>
        <span style={{ fontSize: 11 }}>{rtl ? "RTL ←" : "→ LTR"}</span>
      </ToolbarBtn>

      {/* Info badges — right-aligned */}
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ background: C.tealBg, padding: "2px 8px", borderRadius: 10, color: C.tealDark, fontWeight: 700, fontSize: 10 }}>
          {pageSize.name} {orientation === "landscape" ? "▭" : "▯"} {pw}×{ph}mm
        </span>
        <span style={{ background: C.tealBg, padding: "2px 8px", borderRadius: 10, color: C.tealDark, fontWeight: 700, fontSize: 10 }}>
          ↕{margins.top} ↔{margins.left}mm
        </span>
        {border.enabled && (
          <span style={{ background: C.tealBg, padding: "2px 8px", borderRadius: 10, fontWeight: 700, color: C.tealDark, fontSize: 10 }}>
            <span style={{ color: C.tealDark }}>▣</span> {border.width}px · ↔{border.offset}px
          </span>
        )}
      </div>
    </div>
  );
}
