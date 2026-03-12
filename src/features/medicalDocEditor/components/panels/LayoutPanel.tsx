import { C, type BorderConfig, type LayoutTab, type Margins, type Orientation, type PageSize } from "../../utils/medicalDocEditor.utils";
import { PageSettingsTab }   from "./PageSettingsTab";
import { BorderSettingsTab } from "./BorderSettingsTab";

interface Props {
  layoutTab:     LayoutTab;
  setLayoutTab:  (t: LayoutTab) => void;
  pageSize:      PageSize;
  orientation:   Orientation;
  margins:       Margins;
  customSize:    { w: number; h: number };
  pw:            number;
  ph:            number;
  border:        BorderConfig;
  onPageSize:    (ps: PageSize) => void;
  onOrientation: (o: Orientation) => void;
  onMargins:     (patch: Partial<Margins>) => void;
  onCustomSize:  (dim: "w" | "h", v: number) => void;
  updateBorder:  (patch: Partial<BorderConfig>) => void;
}

const SUB_TABS: { id: LayoutTab; label: string }[] = [
  { id: "page",   label: "📄 Page"     },
  { id: "border", label: "🖼 Bordures" },
];

export function LayoutPanel({ layoutTab, setLayoutTab, border, updateBorder, ...pageProps }: Props) {
  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {SUB_TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setLayoutTab(id)} style={{
            flex: 1, padding: "7px 4px",
            border: `2px solid ${layoutTab === id ? C.teal : C.border}`,
            borderRadius: 7,
            background: layoutTab === id ? C.tealLight : "#fff",
            color: layoutTab === id ? C.tealDark : "#666",
            cursor: "pointer", fontWeight: 700, fontSize: 11,
          }}>
            {label}
          </button>
        ))}
      </div>

      {layoutTab === "page"   && <PageSettingsTab   {...pageProps} />}
      {layoutTab === "border" && <BorderSettingsTab border={border} updateBorder={updateBorder} />}
    </>
  );
}
