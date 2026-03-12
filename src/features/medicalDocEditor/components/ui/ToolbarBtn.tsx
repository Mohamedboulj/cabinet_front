import type { ReactNode } from "react";
import { C } from "../../utils/medicalDocEditor.utils";

interface Props {
  onClick:  () => void;
  title?:   string;
  active?:  boolean;
  children: ReactNode;
}

export function ToolbarBtn({ onClick, title, active, children }: Props) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      title={title}
      style={{
        padding: "3px 7px",
        border: `1px solid ${active ? C.teal : "transparent"}`,
        borderRadius: 4,
        background: active ? C.tealLight : "transparent",
        cursor: "pointer",
        fontSize: 13,
        color: C.navy,
        fontFamily: "inherit",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {children}
    </button>
  );
}
