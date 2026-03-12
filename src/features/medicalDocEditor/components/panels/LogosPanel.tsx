import type { RefObject } from "react";
import { C, type Logo, type LogoPositionId } from "../../utils/medicalDocEditor.utils";
import { LogoCard } from "./LogoCard";

interface Props {
  logos:         Logo[];
  logoPositions: Record<string, LogoPositionId>;
  logoSizes:     Record<string, number>;
  logoOpacities: Record<string, number>;
  activeLogoId:  string | null;
  fileInputRef:  RefObject<HTMLInputElement>;
  onUploadClick: () => void;
  onFileChange:  (files: FileList | null) => void;
  onSelect:      (id: string) => void;
  onRemove:      (id: string) => void;
  onPosition:    (id: string, pos: LogoPositionId) => void;
  onSize:        (id: string, v: number) => void;
  onOpacity:     (id: string, v: number) => void;
}

export function LogosPanel({
  logos, logoPositions, logoSizes, logoOpacities, activeLogoId,
  fileInputRef, onUploadClick, onFileChange,
  onSelect, onRemove, onPosition, onSize, onOpacity,
}: Props) {
  return (
    <>
      <p style={{ fontSize: 11, color: "#666", marginBottom: 12, lineHeight: 1.5 }}>
        Importez vos logos et définissez leur position, taille et opacité.
      </p>

      <button onClick={onUploadClick} style={{
        width: "100%", padding: "10px 0",
        border: `2px dashed ${C.teal}`, borderRadius: 8,
        background: C.tealLight, color: C.tealDark,
        cursor: "pointer", fontWeight: 800, fontSize: 13, marginBottom: 14,
      }}>
        + Importer un Logo
      </button>

      <input ref={fileInputRef} type="file" accept="image/*" multiple hidden
        onChange={e => onFileChange(e.target.files)} />

      {logos.length === 0 && (
        <div style={{ textAlign: "center", color: "#bbb", fontSize: 12, padding: "24px 0" }}>
          Aucun logo importé
        </div>
      )}

      {logos.map(logo => (
        <LogoCard
          key={logo.id}
          logo={logo}
          isActive={activeLogoId === logo.id}
          position={logoPositions[logo.id] ?? "top-center"}
          size={logoSizes[logo.id] ?? 90}
          opacity={logoOpacities[logo.id] ?? 1}
          onSelect={() => onSelect(logo.id)}
          onRemove={() => onRemove(logo.id)}
          onPosition={pos => onPosition(logo.id, pos)}
          onSize={v => onSize(logo.id, v)}
          onOpacity={v => onOpacity(logo.id, v)}
        />
      ))}
    </>
  );
}
