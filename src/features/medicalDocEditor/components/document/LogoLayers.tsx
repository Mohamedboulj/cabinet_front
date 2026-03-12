import type { Logo, LogoPositionId } from "../../utils/medicalDocEditor.utils";

interface SharedProps {
  logos:         Logo[];
  logoPositions: Record<string, LogoPositionId>;
  logoSizes:     Record<string, number>;
  logoOpacities: Record<string, number>;
}

export function WatermarkLogos({ logos, logoPositions, logoSizes, logoOpacities }: SharedProps) {
  const items = logos.filter(l => logoPositions[l.id] === "middle");
  return (
    <>
      {items.map(l => (
        <div key={l.id} style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 0,
        }}>
          <img src={l.src} alt="" style={{
            height: `${logoSizes[l.id] || 160}px`,
            opacity: logoOpacities[l.id] ?? 0.12,
            objectFit: "contain",
          }} />
        </div>
      ))}
    </>
  );
}

interface CornerLogosProps extends SharedProps {
  pos:     LogoPositionId;
  justify: string;
}

export function CornerLogos({ logos, logoPositions, logoSizes, logoOpacities, pos, justify }: CornerLogosProps) {
  const items = logos.filter(l => logoPositions[l.id] === pos);
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", justifyContent: justify, gap: 8, flexWrap: "wrap" }}>
      {items.map(l => (
        <img key={l.id} src={l.src} alt="" style={{
          height: `${logoSizes[l.id] || 90}px`,
          opacity: logoOpacities[l.id] ?? 1,
          objectFit: "contain", maxWidth: 200,
        }} />
      ))}
    </div>
  );
}
