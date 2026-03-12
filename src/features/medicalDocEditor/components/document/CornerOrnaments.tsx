interface Props { color: string; size: number; }

function OrnamentSvg({ color, size, rot }: { color: string; size: number; rot: number }) {
  const px = size * 6;
  return (
    <svg width={px} height={px} viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rot}deg)`, display: "block" }}
    >
      <path d="M2,2 L2,18 M2,2 L18,2" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M2,2 L10,10"            stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <circle cx="2" cy="2" r="2.5"   fill={color} />
      <path d="M8,2 Q5,5 2,8"          stroke={color} strokeWidth="1"   fill="none" opacity="0.5" />
    </svg>
  );
}

export function CornerOrnaments({ color, size }: Props) {
  return (
    <>
      {([
        { rot: 0,   top: 0,    left: 0    },
        { rot: 90,  top: 0,    right: 0   },
        { rot: 180, bottom: 0, right: 0   },
        { rot: 270, bottom: 0, left: 0    },
      ] as const).map(({ rot, ...pos }) => (
        <div key={rot} style={{ position: "absolute", ...pos, pointerEvents: "none", zIndex: 2 }}>
          <OrnamentSvg color={color} size={size} rot={rot} />
        </div>
      ))}
    </>
  );
}
