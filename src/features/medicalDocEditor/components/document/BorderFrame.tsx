import { buildBorderFrameStyle, type BorderConfig } from "../../utils/medicalDocEditor.utils";
import { CornerOrnaments } from "./CornerOrnaments";

interface Props { b: BorderConfig; }

export function BorderFrame({ b }: Props) {
  const style = buildBorderFrameStyle(b);
  if (style.display === "none") return null;
  return (
    <div style={style}>
      {b.pattern === "corners" && <CornerOrnaments color={b.color} size={b.width} />}
    </div>
  );
}
