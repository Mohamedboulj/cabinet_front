import type { RefObject, ReactNode } from "react";
import { C, type EditTarget } from "../../utils/medicalDocEditor.utils";

interface SectionWrapProps {
  isActive: boolean;
  onActivate: () => void;
  hint: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

function SectionWrap({ isActive, onActivate, hint, children, style = {} }: SectionWrapProps) {
  return (
    <div onClick={onActivate} style={{
      outline: isActive ? `2px dashed ${C.teal}` : "none",
      outlineOffset: 2, borderRadius: 2, cursor: "text",
      position: "relative", zIndex: 1, ...style,
    }}>
      {children}
      {!isActive && <div style={{ fontSize: 9, color: "#cde", fontFamily: "sans-serif", marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
interface HeaderProps {
  contentRef: RefObject<HTMLDivElement>;
  editTarget: EditTarget;
  onActivate: () => void;
  onInput: (html: string) => void;
}

export function DocumentHeader({ contentRef, editTarget, onActivate, onInput }: HeaderProps) {
  return (
    <div style={{ borderBottom: `2px solid ${C.tealLight}`, paddingBottom: 14, marginBottom: 18, minHeight: 60 }}>
      <SectionWrap isActive={editTarget === "header"} onActivate={onActivate} hint="Cliquez pour modifier l'en-tête">
        <div ref={contentRef} contentEditable suppressContentEditableWarning
          onInput={e => onInput((e.target as HTMLDivElement).innerHTML)}
          style={{ outline: "none" }} />
      </SectionWrap>
    </div>
  );
}

// ─── Body ────────────────────────────────────────────────────────────────────
interface BodyProps {
  contentRef: RefObject<HTMLDivElement>;
  editTarget: EditTarget;
  onActivate: () => void;
  onInput: (html: string) => void;
}

export function DocumentBody({ contentRef, editTarget, onActivate, onInput }: BodyProps) {
  return (
    <div style={{ flex: 1, marginBottom: 18 }}>
      <SectionWrap isActive={editTarget === "body"} onActivate={onActivate} hint="">
        <div ref={contentRef} contentEditable suppressContentEditableWarning
          onInput={e => onInput((e.target as HTMLDivElement).innerHTML)}
          style={{ outline: "none", minHeight: 280, lineHeight: 1.75 }} />
      </SectionWrap>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
interface FooterProps {
  contentRef: RefObject<HTMLDivElement>;
  editTarget: EditTarget;
  onActivate: () => void;
  onInput: (html: string) => void;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

export function DocumentFooter({ contentRef, editTarget, onActivate, onInput, leftSlot, rightSlot }: FooterProps) {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <SectionWrap isActive={editTarget === "footer"} onActivate={onActivate}
        hint="Cliquez pour modifier le pied de page"
        style={{ borderTop: "1px solid #bbd8d8", paddingTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 10 }}>
          {leftSlot}
          <div ref={contentRef} contentEditable suppressContentEditableWarning
            onInput={e => onInput((e.target as HTMLDivElement).innerHTML)}
            style={{ outline: "none", flex: 1, textAlign: "center" }} />
          {rightSlot}
        </div>
      </SectionWrap>
    </div>
  );
}
